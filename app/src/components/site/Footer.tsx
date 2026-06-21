const REPO_URL = "https://github.com/PatrickTomas2/freelance_escrow";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Built with Soroban smart contracts, USDC via the Stellar Asset
          Contract, and Stellar trustlines.
        </p>
        <div className="flex items-center gap-5">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Source
          </a>
          <span>Testnet only &mdash; no real funds</span>
        </div>
      </div>
    </footer>
  );
}
