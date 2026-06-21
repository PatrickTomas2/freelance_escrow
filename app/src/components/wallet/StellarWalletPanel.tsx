"use client";

import { useState } from "react";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { formatXlmBalance, truncateAddress } from "@/lib/format";
import { STELLAR_FRIENDBOT_URL } from "@/lib/stellar/constants";
import { SendXlmForm } from "./SendXlmForm";

export function StellarWalletPanel() {
  const wallet = useStellarWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!wallet.publicKey) return;
    try {
      await navigator.clipboard.writeText(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — not critical.
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Stellar Testnet Wallet
            </h2>
            <p className="text-sm text-foreground/65">
              Connect Freighter to view your balance and send XLM.
            </p>
          </div>

          {wallet.isConnected ? (
            <button
              type="button"
              onClick={wallet.disconnect}
              className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {wallet.isConnecting ? "Connecting…" : "Connect Freighter Wallet"}
            </button>
          )}
        </div>

        {wallet.isConnected && wallet.publicKey && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
            <span className="font-mono text-foreground/80">
              {truncateAddress(wallet.publicKey)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-medium text-foreground/50 hover:text-foreground"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {wallet.isWrongNetwork && (
          <p className="mt-4 rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
            Freighter is connected to a different network. Switch it to{" "}
            <strong>Testnet</strong> to use this app.
          </p>
        )}

        {wallet.errorScope === "connect" && wallet.error && (
          <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
            {wallet.error}
          </p>
        )}
      </section>

      {wallet.isConnected && (
        <section className="rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
              XLM Balance
            </h3>
            <button
              type="button"
              onClick={wallet.refreshBalance}
              disabled={wallet.isLoadingBalance || wallet.isWrongNetwork}
              className="text-sm font-medium text-foreground/60 hover:text-foreground disabled:opacity-50"
            >
              {wallet.isLoadingBalance ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div className="mt-2">
            {wallet.isLoadingBalance && wallet.balance === null ? (
              <p className="text-2xl font-semibold text-foreground/40">Loading…</p>
            ) : wallet.errorScope === "balance" && wallet.error ? (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
                {wallet.error}
              </p>
            ) : !wallet.isFunded ? (
              <p className="text-sm text-foreground/65">
                Your Testnet account is not funded yet. Fund it using{" "}
                <a
                  href={STELLAR_FRIENDBOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline"
                >
                  Stellar Friendbot
                </a>
                , then refresh balance.
              </p>
            ) : wallet.balance !== null ? (
              <p className="text-2xl font-semibold text-foreground">
                {formatXlmBalance(wallet.balance)}{" "}
                <span className="text-base font-normal text-foreground/50">XLM</span>
              </p>
            ) : (
              <p className="text-sm text-foreground/50">Balance unavailable.</p>
            )}
          </div>
        </section>
      )}

      {wallet.isConnected && (
        <SendXlmForm
          isFunded={wallet.isFunded}
          isSending={wallet.isSending}
          isDisabled={wallet.isWrongNetwork}
          txStatus={wallet.txStatus}
          txHash={wallet.txHash}
          error={wallet.errorScope === "send" ? wallet.error : null}
          onSend={wallet.sendPayment}
          onClearStatus={wallet.clearTxStatus}
        />
      )}
    </div>
  );
}
