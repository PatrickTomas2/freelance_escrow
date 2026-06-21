import { Networks } from "@stellar/stellar-sdk";

/**
 * Stellar Testnet only. Never point this app at Mainnet/Public network —
 * Level 1 of this integration is Testnet-scoped by design.
 */
export const STELLAR_NETWORK = "TESTNET";
export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;
export const STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_FRIENDBOT_URL = "https://friendbot.stellar.org";
export const STELLAR_EXPLORER_TX_BASE_URL =
  "https://stellar.expert/explorer/testnet/tx";

/** Horizon withholds this many XLM per base reserve (account + each subentry). */
export const STELLAR_BASE_RESERVE_XLM = 0.5;
/** Every account is charged 2 base reserves before any subentries (trustlines, offers, etc). */
export const STELLAR_BASE_RESERVE_COUNT = 2;
