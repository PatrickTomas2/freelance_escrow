import { StrKey } from "@stellar/stellar-sdk";

/** Checks that a string is a valid Stellar ed25519 public key (starts with "G"). */
export function isValidStellarPublicKey(value: string): boolean {
  if (!value) return false;
  try {
    return StrKey.isValidEd25519PublicKey(value.trim());
  } catch {
    return false;
  }
}

// Positive decimal, max 7 fractional digits (Stellar's smallest unit, the
// stroop), no leading +/-, no scientific notation.
const XLM_AMOUNT_PATTERN = /^\d+(\.\d{1,7})?$/;

/** Checks that a string is a valid, positive XLM amount Stellar can encode. */
export function isValidXlmAmount(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!XLM_AMOUNT_PATTERN.test(trimmed)) return false;
  return parseFloat(trimmed) > 0;
}
