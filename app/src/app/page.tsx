import { HowItWorks } from "@/components/site/HowItWorks";
import { BoltIcon, LockIcon } from "@/components/site/icons";
import { StellarWalletPanel } from "@/components/wallet/StellarWalletPanel";

export default function Home() {
  return (
    <div id="top">
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
            Milestone escrow &middot; built on Soroban
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Get paid for every milestone. Automatically.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-primary-foreground/80 sm:text-base">
            A client&rsquo;s USDC locks into a Soroban contract at the start
            of the engagement, split into milestones. Funds release to the
            freelancer the moment a milestone is approved, and either side
            can raise a dispute for arbitrator review.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-primary-foreground/85">
            <span className="inline-flex items-center gap-1.5">
              <BoltIcon className="h-4 w-4" />
              3-5s settlement
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockIcon className="h-4 w-4" />
              Funds held until approved
            </span>
            <span>Fees under a cent</span>
          </div>

          <a
            href="#wallet"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-medium text-primary transition-opacity hover:opacity-90"
          >
            Try it on Testnet
          </a>
        </div>
      </section>

      <HowItWorks />

      <section id="wallet" className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Try it on testnet
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            This is the wallet layer the escrow contract settles on.
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/65">
            Connect Freighter, check a Testnet balance, and send a payment to
            see the settlement rail in action. The escrow contract itself
            (create, submit, approve, dispute) runs on Soroban and is
            invoked via the Stellar CLI today.
          </p>

          <div className="mt-10 max-w-xl">
            <StellarWalletPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
