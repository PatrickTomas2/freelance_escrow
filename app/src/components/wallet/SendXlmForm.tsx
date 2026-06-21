"use client";

import { useState, type FormEvent } from "react";
import type { SendPaymentInput, TxStatus } from "@/hooks/useStellarWallet";
import { STELLAR_EXPLORER_TX_BASE_URL } from "@/lib/stellar/constants";

interface SendXlmFormProps {
  isFunded: boolean;
  isSending: boolean;
  isDisabled?: boolean;
  txStatus: TxStatus;
  txHash: string | null;
  error: string | null;
  onSend: (input: SendPaymentInput) => Promise<void>;
  onClearStatus: () => void;
}

export function SendXlmForm({
  isFunded,
  isSending,
  isDisabled,
  txStatus,
  txHash,
  error,
  onSend,
  onClearStatus,
}: SendXlmFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSend({ destination, amount, memo: memo || undefined });
  };

  const handleFieldChange = () => {
    if (txStatus !== "idle") onClearStatus();
  };

  const disabled = isSending || !isFunded || isDisabled;

  return (
    <section className="rounded-2xl border border-border bg-background p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
        Send XLM
      </h3>

      {!isFunded && (
        <p className="mt-2 text-sm text-foreground/50">
          Fund your account on Testnet before sending a payment.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-foreground/80"
          >
            Destination public key
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            placeholder="G..."
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              handleFieldChange();
            }}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground/80">
            Amount (XLM)
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0000000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              handleFieldChange();
            }}
            disabled={disabled}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-foreground/80">
            Memo <span className="text-foreground/40">(optional, max 28 bytes)</span>
          </label>
          <input
            id="memo"
            name="memo"
            type="text"
            maxLength={28}
            placeholder="Milestone #1"
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value);
              handleFieldChange();
            }}
            disabled={disabled}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending…" : "Send XLM"}
        </button>
      </form>

      {txStatus === "error" && error && (
        <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {txStatus === "success" && txHash && (
        <div className="mt-4 rounded-lg bg-success-bg px-3 py-2 text-sm text-success">
          <p className="font-medium">Payment sent successfully.</p>
          <p className="mt-1 break-all font-mono text-xs">{txHash}</p>
          <a
            href={`${STELLAR_EXPLORER_TX_BASE_URL}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium underline"
          >
            View on Stellar Expert
          </a>
        </div>
      )}
    </section>
  );
}
