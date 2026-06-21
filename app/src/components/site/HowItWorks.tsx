import type { ComponentType } from "react";
import { BoltIcon, CheckCircleIcon, LockIcon, ScaleIcon } from "./icons";

interface Step {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  tone: "neutral" | "dispute";
}

const STEPS: Step[] = [
  {
    title: "Lock funds",
    description:
      "The client deposits USDC into the contract, split across the milestones agreed for the engagement.",
    Icon: LockIcon,
    tone: "neutral",
  },
  {
    title: "Submit milestone",
    description:
      "The freelancer marks a milestone as delivered, moving it from pending to awaiting client review.",
    Icon: BoltIcon,
    tone: "neutral",
  },
  {
    title: "Approve & release",
    description:
      "Once the client approves, that milestone's funds release to the freelancer on-chain, in 3-5 seconds.",
    Icon: CheckCircleIcon,
    tone: "neutral",
  },
  {
    title: "Dispute & arbitrate",
    description:
      "Either side can raise a dispute instead, freezing the contract until the named arbitrator resolves it.",
    Icon: ScaleIcon,
    tone: "dispute",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        How it works
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        From locked funds to a finished job, on-chain.
      </h2>

      <ol className="mt-12 space-y-10">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative flex gap-5 pl-0">
            <div className="flex flex-col items-center">
              <span
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border " +
                  (step.tone === "dispute"
                    ? "border-danger/30 bg-danger-bg text-danger"
                    : "border-border bg-surface text-foreground/70")
                }
              >
                <step.Icon className="h-[18px] w-[18px]" />
              </span>
              {index < STEPS.length - 1 && (
                <span className="mt-2 w-px flex-1 bg-border" aria-hidden="true" />
              )}
            </div>

            <div className="pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-foreground/65">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
