# Product

## Register

product

## Users

Three roles, all transacting in USDC on Stellar:

- **Freelancers** in the Philippines, Vietnam, and Indonesia delivering contract work, who need certainty they'll be paid for completed milestones without a client disappearing.
- **Clients** who want assurance that funds only leave their custody once they've approved delivered work.
- **Arbitrators** who step in only when a milestone is disputed, to release funds to one party or the other.

All three connect a Freighter wallet and interact with the on-chain escrow contract directly; there is no custodial intermediary.

## Product Purpose

A Soroban smart-contract escrow system: a client locks USDC into a contract split across milestones, a freelancer submits each milestone for review, and approval releases that milestone's funds automatically, on-chain, in 3-5 seconds. Either party can raise a dispute, which freezes the contract until the named arbitrator resolves it. This replaces freelance platforms that charge 10-20% in fees, settle in 5-7 days, and offer no real protection against non-payment.

Success looks like: a freelancer trusts they'll get paid the moment a client approves their work, and a client trusts their funds are provably locked and only released against approved deliverables, both verifiable on-chain without needing to trust a platform operator.

## Brand Personality

Crypto-native but never trader-coded: bold, modern, a little playful, the wallet-first confidence of Phantom or Rainbow, applied to a tool for working people rather than speculators. Borrows Stripe's clarity around money and trust, and Linear's sharp, no-wasted-motion product polish. The interface should be comfortable being visibly "on-chain" (addresses, tx hashes, contract state) rather than hiding the mechanics behind vague status text.

## Anti-references

- Corporate bank sites: stiff navy-and-gold, bureaucratic distance, anything that feels like a treasury department rather than a tool for an individual freelancer.
- Crypto trading terminals: dense, neon-on-black, intimidating dashboards built for traders, not for someone checking if they got paid.
- Generic AI SaaS templates: gradient hero text, identical icon+heading+text card grids, big-number hero-metric blocks. The obviously-AI-generated look.

## Design Principles

1. **Show the chain, don't hide it.** Milestone status, contract state, and transactions are real on-chain facts; surface addresses, tx hashes, and explorer links with confidence instead of abstracting them into vague "processing" language.
2. **Trust through clarity, not decoration.** Every escrow/milestone state (Pending, Submitted, Approved, Disputed) must be unambiguous at a glance, using consistent semantic color and language, not novelty.
3. **One primary action per screen.** A freelancer or client should never have to guess what to do next; secondary actions stay visually secondary.
4. **Friendly over corporate.** Copy speaks to one freelancer or one client at a time, never to an enterprise treasury team.

## Accessibility & Inclusion

WCAG AA baseline: solid contrast ratios in both light and dark mode, full keyboard navigation, visible focus states, semantic HTML throughout.
