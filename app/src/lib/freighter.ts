import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { STELLAR_NETWORK_PASSPHRASE } from "@/lib/stellar/constants";

export const MISSING_FREIGHTER_MESSAGE =
  "Freighter wallet is required. Install the Freighter browser extension and switch to Testnet.";

function describeFreighterError(
  error: { message?: string } | undefined,
  fallback: string
): string {
  return error?.message || fallback;
}

/** True if the Freighter browser extension is installed and reachable. */
export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await freighterIsConnected();
  if (result.error) return false;
  return result.isConnected;
}

export interface FreighterConnectResult {
  address: string | null;
  error: string | null;
}

/**
 * Prompts the user (via the Freighter popup) to grant this site access and
 * returns their public key. Resolves with an error string instead of
 * throwing so callers can show it directly in the UI.
 */
export async function connectFreighter(): Promise<FreighterConnectResult> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    return { address: null, error: MISSING_FREIGHTER_MESSAGE };
  }

  const access = await freighterRequestAccess();
  if (access.error || !access.address) {
    return {
      address: null,
      error: describeFreighterError(access.error, "Could not connect to Freighter."),
    };
  }

  return { address: access.address, error: null };
}

/**
 * Returns the connected address only if this site already has permission —
 * never opens the Freighter popup. Used to silently restore a session.
 */
export async function getFreighterAddressIfAllowed(): Promise<string | null> {
  const installed = await checkFreighterInstalled();
  if (!installed) return null;

  const result = await freighterGetAddress();
  if (result.error || !result.address) return null;
  return result.address;
}

export interface FreighterNetworkInfo {
  network: string;
  networkPassphrase: string;
}

/** Reads which network the Freighter extension is currently set to. */
export async function getFreighterNetwork(): Promise<FreighterNetworkInfo | null> {
  const result = await freighterGetNetwork();
  if (result.error || !result.networkPassphrase) return null;
  return { network: result.network, networkPassphrase: result.networkPassphrase };
}

export interface SignXdrResult {
  signedXdr: string | null;
  error: string | null;
}

// Freighter's signTransaction response shape has changed across package
// versions (a raw signed XDR string in some, an object with `signedTxXdr`
// or the older `signedXDR` field in others). Treat the installed package's
// declared return type as a guideline, not a guarantee, and check defensively.
type RawSignTransactionResult =
  | string
  | {
      signedTxXdr?: string;
      signedXDR?: string;
      error?: { message?: string; code?: number };
    };

/** Signs a transaction XDR with Freighter, returning the signed XDR or an error. */
export async function signXdrWithFreighter(
  xdr: string,
  address: string
): Promise<SignXdrResult> {
  const result = (await freighterSignTransaction(xdr, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    address,
  })) as unknown as RawSignTransactionResult;

  if (typeof result === "string") {
    return { signedXdr: result, error: null };
  }

  if (result?.error) {
    return {
      signedXdr: null,
      error: describeFreighterError(result.error, "Freighter declined to sign the transaction."),
    };
  }

  const signedXdr = result?.signedTxXdr || result?.signedXDR || null;
  if (!signedXdr) {
    return { signedXdr: null, error: "Unexpected response from Freighter while signing." };
  }

  return { signedXdr, error: null };
}
