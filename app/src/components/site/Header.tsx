import { GithubIcon, LockIcon } from "./icons";

const REPO_URL = "https://github.com/PatrickTomas2/freelance_escrow";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
            <LockIcon className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Freelance Escrow
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
            Testnet
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-surface hover:text-foreground"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
