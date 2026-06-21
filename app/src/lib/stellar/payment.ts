import {
  Asset,
  BASE_FEE,
  Horizon,
  Memo,
  Transaction,
  TransactionBuilder,
  Operation,
} from "@stellar/stellar-sdk";
import {
  STELLAR_BASE_RESERVE_COUNT,
  STELLAR_BASE_RESERVE_XLM,
  STELLAR_NETWORK_PASSPHRASE,
} from "./constants";

export interface BuildPaymentParams {
  sourceAccount: Horizon.AccountResponse;
  destination: string;
  /** Decimal XLM amount as a string, e.g. "12.5". */
  amount: string;
  memo?: string;
}

/** Builds (but does not sign or submit) a native XLM payment transaction. */
export function buildPaymentTransaction({
  sourceAccount,
  destination,
  amount,
  memo,
}: BuildPaymentParams): Transaction {
  const builder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount,
    })
  );

  if (memo) {
    builder.addMemo(Memo.text(memo));
  }

  return builder.setTimeout(180).build();
}

function isAccountNativeBalance(
  balance: Horizon.HorizonApi.BalanceLine
): balance is Horizon.HorizonApi.BalanceLineNative {
  return balance.asset_type === "native";
}

/**
 * Estimates how much XLM is actually safe to send: balance minus the
 * minimum reserve Horizon withholds (2 base reserves + 1 per subentry)
 * and a small buffer for the network fee.
 */
export function getSendableXlmBalance(account: Horizon.AccountResponse): number {
  const nativeBalance = account.balances.find(isAccountNativeBalance);
  const balance = parseFloat(nativeBalance?.balance ?? "0");
  const minimumReserve =
    (STELLAR_BASE_RESERVE_COUNT + account.subentry_count) * STELLAR_BASE_RESERVE_XLM;
  const feeBuffer = 0.001;
  return Math.max(balance - minimumReserve - feeBuffer, 0);
}
