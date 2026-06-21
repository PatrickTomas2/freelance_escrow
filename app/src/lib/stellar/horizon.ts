import { Horizon, NetworkError, NotFoundError } from "@stellar/stellar-sdk";
import { STELLAR_HORIZON_URL } from "./constants";

let serverInstance: Horizon.Server | null = null;

/** Lazily-created singleton Horizon client pointed at Stellar Testnet. */
export function getHorizonServer(): Horizon.Server {
  if (!serverInstance) {
    serverInstance = new Horizon.Server(STELLAR_HORIZON_URL);
  }
  return serverInstance;
}

/** Raised when an account hasn't been created/funded on the Testnet yet. */
export class AccountNotFundedError extends Error {
  constructor(public readonly publicKey: string) {
    super(`Account ${publicKey} was not found on the Testnet`);
    this.name = "AccountNotFundedError";
  }
}

export interface NativeBalanceResult {
  account: Horizon.AccountResponse;
  balance: string;
}

function isAccountNativeBalance(
  balance: Horizon.HorizonApi.BalanceLine
): balance is Horizon.HorizonApi.BalanceLineNative {
  return balance.asset_type === "native";
}

/** Loads an account from Horizon and extracts its native XLM balance. */
export async function fetchAccountBalance(
  publicKey: string
): Promise<NativeBalanceResult> {
  const server = getHorizonServer();

  let account: Horizon.AccountResponse;
  try {
    account = await server.loadAccount(publicKey);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new AccountNotFundedError(publicKey);
    }
    throw err;
  }

  const nativeBalance = account.balances.find(isAccountNativeBalance);
  return { account, balance: nativeBalance?.balance ?? "0" };
}

interface HorizonResultCodes {
  transaction?: string;
  operations?: string[];
}

function extractResultCodes(err: NetworkError): HorizonResultCodes | undefined {
  const data = err.response?.data as
    | { extras?: { result_codes?: HorizonResultCodes } }
    | undefined;
  return data?.extras?.result_codes;
}

const OPERATION_ERROR_MESSAGES: Record<string, string> = {
  op_no_destination:
    "The destination account does not exist on Testnet yet, so it can't receive a payment until it's funded.",
  op_underfunded: "Insufficient balance to complete this payment.",
  op_low_reserve:
    "This payment would leave your account below the minimum reserve required by Stellar.",
  op_no_trust:
    "The destination account does not accept this asset (no trustline).",
};

const TRANSACTION_ERROR_MESSAGES: Record<string, string> = {
  tx_insufficient_balance: "Insufficient balance to cover the payment and network fee.",
  tx_bad_seq: "Transaction sequence number is stale. Please try again.",
  tx_insufficient_fee: "The network fee was too low. Please try again.",
};

/** Converts Horizon/Stellar SDK errors into a user-friendly message. */
export function getHorizonErrorMessage(err: unknown): string {
  if (err instanceof AccountNotFundedError) {
    return "Your Testnet account is not funded yet. Fund it using Stellar Friendbot, then refresh balance.";
  }

  if (err instanceof NetworkError) {
    const codes = extractResultCodes(err);
    const opMessage = codes?.operations
      ?.map((code) => OPERATION_ERROR_MESSAGES[code])
      .find(Boolean);
    if (opMessage) return opMessage;

    const txMessage = codes?.transaction
      ? TRANSACTION_ERROR_MESSAGES[codes.transaction]
      : undefined;
    if (txMessage) return txMessage;

    if (err instanceof NotFoundError) {
      return "The requested account or resource was not found on the Testnet.";
    }

    if (codes?.transaction) {
      return `The transaction was rejected by the Stellar network (${codes.transaction}).`;
    }

    return "Could not reach the Stellar Testnet. Check your connection and try again.";
  }

  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}
