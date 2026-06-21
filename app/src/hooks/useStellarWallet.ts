"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import { STELLAR_NETWORK_PASSPHRASE } from "@/lib/stellar/constants";
import {
  AccountNotFundedError,
  fetchAccountBalance,
  getHorizonErrorMessage,
  getHorizonServer,
} from "@/lib/stellar/horizon";
import { buildPaymentTransaction, getSendableXlmBalance } from "@/lib/stellar/payment";
import { isValidStellarPublicKey, isValidXlmAmount } from "@/lib/stellar/validation";
import {
  checkFreighterInstalled,
  connectFreighter,
  getFreighterAddressIfAllowed,
  getFreighterNetwork,
  signXdrWithFreighter,
} from "@/lib/freighter";

const LAST_PUBLIC_KEY_STORAGE_KEY = "freelance-escrow:stellar:lastPublicKey";

export type TxStatus = "idle" | "pending" | "success" | "error";

export interface StellarWalletState {
  publicKey: string | null;
  isConnected: boolean;
  balance: string | null;
  /** False once we know the account hasn't been funded on Testnet yet. */
  isFunded: boolean;
  isConnecting: boolean;
  isLoadingBalance: boolean;
  isSending: boolean;
  error: string | null;
  /** Which section produced `error`, so the UI can show it in the right place. */
  errorScope: "connect" | "balance" | "send" | null;
  txHash: string | null;
  txStatus: TxStatus;
  networkPassphrase: string | null;
}

const initialState: StellarWalletState = {
  publicKey: null,
  isConnected: false,
  balance: null,
  isFunded: true,
  isConnecting: false,
  isLoadingBalance: false,
  isSending: false,
  error: null,
  errorScope: null,
  txHash: null,
  txStatus: "idle",
  networkPassphrase: null,
};

export interface SendPaymentInput {
  destination: string;
  amount: string;
  memo?: string;
}

function readStoredPublicKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_PUBLIC_KEY_STORAGE_KEY);
}

function writeStoredPublicKey(publicKey: string | null) {
  if (typeof window === "undefined") return;
  if (publicKey) {
    window.localStorage.setItem(LAST_PUBLIC_KEY_STORAGE_KEY, publicKey);
  } else {
    window.localStorage.removeItem(LAST_PUBLIC_KEY_STORAGE_KEY);
  }
}

/**
 * Client-only hook encapsulating Freighter connection state, Testnet XLM
 * balance, and the send-payment flow. All Freighter/Horizon calls happen
 * inside event handlers or effects, never during render.
 */
export function useStellarWallet() {
  const [state, setState] = useState<StellarWalletState>(initialState);
  const publicKeyRef = useRef<string | null>(null);
  publicKeyRef.current = state.publicKey;

  const refreshBalance = useCallback(async (publicKeyOverride?: string) => {
    const key = publicKeyOverride ?? publicKeyRef.current;
    if (!key) return;

    setState((s) => ({ ...s, isLoadingBalance: true, error: null, errorScope: null }));
    try {
      const { balance } = await fetchAccountBalance(key);
      setState((s) => ({ ...s, balance, isFunded: true, isLoadingBalance: false }));
    } catch (err) {
      if (err instanceof AccountNotFundedError) {
        setState((s) => ({ ...s, balance: null, isFunded: false, isLoadingBalance: false }));
        return;
      }
      setState((s) => ({
        ...s,
        isLoadingBalance: false,
        error: getHorizonErrorMessage(err),
        errorScope: "balance",
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null, errorScope: null }));

    const result = await connectFreighter();
    if (result.error || !result.address) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: result.error ?? "Could not connect to Freighter.",
        errorScope: "connect",
      }));
      return;
    }

    const network = await getFreighterNetwork();
    const address = result.address;

    setState((s) => ({
      ...s,
      isConnecting: false,
      isConnected: true,
      publicKey: address,
      networkPassphrase: network?.networkPassphrase ?? null,
      txStatus: "idle",
      txHash: null,
      error: null,
      errorScope: null,
    }));

    writeStoredPublicKey(address);
    void refreshBalance(address);
  }, [refreshBalance]);

  // App-session disconnect only — this clears local state, it does not
  // revoke the site's permission inside the Freighter extension itself.
  const disconnect = useCallback(() => {
    setState(initialState);
    writeStoredPublicKey(null);
  }, []);

  const sendPayment = useCallback(
    async ({ destination, amount, memo }: SendPaymentInput) => {
      const sourcePublicKey = publicKeyRef.current;
      if (!sourcePublicKey) {
        setState((s) => ({
          ...s,
          error: "Connect your wallet before sending a payment.",
          errorScope: "send",
        }));
        return;
      }

      const trimmedDestination = destination.trim();
      const trimmedMemo = memo?.trim();

      if (!isValidStellarPublicKey(trimmedDestination)) {
        setState((s) => ({
          ...s,
          txStatus: "error",
          error: "Enter a valid Stellar public key (starts with G).",
          errorScope: "send",
        }));
        return;
      }

      if (trimmedDestination === sourcePublicKey) {
        setState((s) => ({
          ...s,
          txStatus: "error",
          error: "Destination cannot be your own wallet address.",
          errorScope: "send",
        }));
        return;
      }

      if (!isValidXlmAmount(amount)) {
        setState((s) => ({
          ...s,
          txStatus: "error",
          error: "Enter a positive amount with up to 7 decimal places.",
          errorScope: "send",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        isSending: true,
        error: null,
        errorScope: null,
        txStatus: "pending",
        txHash: null,
      }));

      try {
        const server = getHorizonServer();
        const sourceAccount = await server.loadAccount(sourcePublicKey);

        const sendable = getSendableXlmBalance(sourceAccount);
        if (parseFloat(amount) > sendable) {
          setState((s) => ({
            ...s,
            isSending: false,
            txStatus: "error",
            error: `Amount exceeds available balance (~${sendable.toFixed(4)} XLM after the minimum reserve and network fee).`,
            errorScope: "send",
          }));
          return;
        }

        let transaction;
        try {
          transaction = buildPaymentTransaction({
            sourceAccount,
            destination: trimmedDestination,
            amount,
            memo: trimmedMemo || undefined,
          });
        } catch (buildErr) {
          setState((s) => ({
            ...s,
            isSending: false,
            txStatus: "error",
            error:
              buildErr instanceof Error
                ? buildErr.message
                : "Could not build the transaction.",
            errorScope: "send",
          }));
          return;
        }

        const { signedXdr, error: signError } = await signXdrWithFreighter(
          transaction.toXDR(),
          sourcePublicKey
        );

        if (signError || !signedXdr) {
          setState((s) => ({
            ...s,
            isSending: false,
            txStatus: "error",
            error: signError ?? "Signing failed.",
            errorScope: "send",
          }));
          return;
        }

        const signedTransaction = TransactionBuilder.fromXDR(
          signedXdr,
          STELLAR_NETWORK_PASSPHRASE
        );
        const response = await server.submitTransaction(signedTransaction);

        setState((s) => ({
          ...s,
          isSending: false,
          txStatus: "success",
          txHash: response.hash,
          error: null,
          errorScope: null,
        }));

        void refreshBalance(sourcePublicKey);
      } catch (err) {
        console.error("Stellar payment failed:", err);
        setState((s) => ({
          ...s,
          isSending: false,
          txStatus: "error",
          error: getHorizonErrorMessage(err),
          errorScope: "send",
        }));
      }
    },
    [refreshBalance]
  );

  const clearTxStatus = useCallback(() => {
    setState((s) => ({ ...s, txStatus: "idle", txHash: null, error: null, errorScope: null }));
  }, []);

  // Silently restore a previous session on mount: only succeeds if Freighter
  // still grants this site access, so it never triggers a popup.
  useEffect(() => {
    const storedKey = readStoredPublicKey();
    if (!storedKey) return;

    let cancelled = false;

    (async () => {
      const installed = await checkFreighterInstalled();
      if (!installed) {
        writeStoredPublicKey(null);
        return;
      }

      const address = await getFreighterAddressIfAllowed();
      if (cancelled) return;

      if (!address || address !== storedKey) {
        writeStoredPublicKey(null);
        return;
      }

      const network = await getFreighterNetwork();
      if (cancelled) return;

      setState((s) => ({
        ...s,
        isConnected: true,
        publicKey: address,
        networkPassphrase: network?.networkPassphrase ?? null,
      }));

      void refreshBalance(address);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshBalance]);

  const isWrongNetwork =
    state.networkPassphrase !== null && state.networkPassphrase !== STELLAR_NETWORK_PASSPHRASE;

  return {
    ...state,
    isWrongNetwork,
    connect,
    disconnect,
    refreshBalance: () => refreshBalance(),
    sendPayment,
    clearTxStatus,
  };
}
