//! KawaniPay — Milestone Escrow Contract for Freelancers
//!
//! Allows a client to deposit USDC into escrow for a freelance contract,
//! split across milestones. Freelancer submits work per milestone; client
//! approves to release funds. A designated arbitrator can resolve disputes.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol, Vec,
};

// ---------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Contract(u32), // contract_id -> EscrowContract
    NextId,        // counter for generating contract_ids
}

// ---------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum MilestoneStatus {
    Pending,
    Submitted,
    Approved,
    Disputed,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub amount: i128,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum ContractStatus {
    Active,
    Disputed,
    Completed,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowContract {
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Address,
    pub token: Address,
    pub milestones: Vec<Milestone>,
    pub status: ContractStatus,
}

// ---------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    ContractNotFound = 1,
    InvalidMilestoneIndex = 2,
    NotAuthorized = 3,
    InvalidMilestoneState = 4,
    EmptyMilestoneList = 5,
    InvalidAmount = 6,
    ContractNotActive = 7,
}

// ---------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------

#[contract]
pub struct KawaniPayContract;

#[contractimpl]
impl KawaniPayContract {
    /// Creates a new escrow contract and pulls the total milestone amount
    /// from the client's wallet into this contract's custody.
    ///
    /// `milestone_amounts` is a list of USDC amounts (in stroops, i128)
    /// for each milestone in order. The client must authorize this call
    /// and must hold a trustline + sufficient balance of `token`.
    pub fn create_contract(
        env: Env,
        client: Address,
        freelancer: Address,
        arbitrator: Address,
        token: Address,
        milestone_amounts: Vec<i128>,
    ) -> Result<u32, Error> {
        client.require_auth();

        if milestone_amounts.is_empty() {
            return Err(Error::EmptyMilestoneList);
        }

        let mut total: i128 = 0;
        let mut milestones: Vec<Milestone> = Vec::new(&env);
        for amount in milestone_amounts.iter() {
            if amount <= 0 {
                return Err(Error::InvalidAmount);
            }
            total += amount;
            milestones.push_back(Milestone {
                amount,
                status: MilestoneStatus::Pending,
            });
        }

        // Pull funds from client into this contract's address (escrow custody).
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &total);

        // Generate next contract id.
        let next_id: u32 = env
            .storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(0);

        let escrow = EscrowContract {
            client,
            freelancer,
            arbitrator,
            token,
            milestones,
            status: ContractStatus::Active,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Contract(next_id), &escrow);
        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));

        env.events().publish(
            (Symbol::new(&env, "contract_created"), next_id),
            total,
        );

        Ok(next_id)
    }

    /// Freelancer marks a milestone as submitted (work delivered), moving
    /// it from Pending -> Submitted so the client can review and approve.
    pub fn submit_milestone(
        env: Env,
        contract_id: u32,
        milestone_index: u32,
        freelancer: Address,
    ) -> Result<(), Error> {
        freelancer.require_auth();

        let mut escrow: EscrowContract = env
            .storage()
            .persistent()
            .get(&DataKey::Contract(contract_id))
            .ok_or(Error::ContractNotFound)?;

        if escrow.freelancer != freelancer {
            return Err(Error::NotAuthorized);
        }
        if escrow.status != ContractStatus::Active {
            return Err(Error::ContractNotActive);
        }

        let idx = milestone_index as u32;
        if idx >= escrow.milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        if milestone.status != MilestoneStatus::Pending {
            return Err(Error::InvalidMilestoneState);
        }
        milestone.status = MilestoneStatus::Submitted;
        escrow.milestones.set(idx, milestone);

        env.storage()
            .persistent()
            .set(&DataKey::Contract(contract_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "milestone_submitted"), contract_id),
            milestone_index,
        );

        Ok(())
    }

    /// Client approves a submitted milestone, releasing the escrowed funds
    /// for that milestone directly to the freelancer on-chain.
    pub fn approve_milestone(
        env: Env,
        contract_id: u32,
        milestone_index: u32,
        client: Address,
    ) -> Result<(), Error> {
        client.require_auth();

        let mut escrow: EscrowContract = env
            .storage()
            .persistent()
            .get(&DataKey::Contract(contract_id))
            .ok_or(Error::ContractNotFound)?;

        if escrow.client != client {
            return Err(Error::NotAuthorized);
        }
        if escrow.status != ContractStatus::Active {
            return Err(Error::ContractNotActive);
        }

        let idx = milestone_index as u32;
        if idx >= escrow.milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        if milestone.status != MilestoneStatus::Submitted {
            return Err(Error::InvalidMilestoneState);
        }

        // Release funds: contract -> freelancer.
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.freelancer,
            &milestone.amount,
        );

        milestone.status = MilestoneStatus::Approved;
        escrow.milestones.set(idx, milestone);

        // If all milestones approved, mark contract Completed.
        let mut all_done = true;
        for m in escrow.milestones.iter() {
            if m.status != MilestoneStatus::Approved {
                all_done = false;
                break;
            }
        }
        if all_done {
            escrow.status = ContractStatus::Completed;
        }

        env.storage()
            .persistent()
            .set(&DataKey::Contract(contract_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "milestone_approved"), contract_id),
            milestone_index,
        );

        Ok(())
    }

    /// Either client or freelancer can flag a milestone as disputed,
    /// freezing the whole contract pending arbitrator resolution.
    pub fn raise_dispute(
        env: Env,
        contract_id: u32,
        milestone_index: u32,
        caller: Address,
    ) -> Result<(), Error> {
        caller.require_auth();

        let mut escrow: EscrowContract = env
            .storage()
            .persistent()
            .get(&DataKey::Contract(contract_id))
            .ok_or(Error::ContractNotFound)?;

        if caller != escrow.client && caller != escrow.freelancer {
            return Err(Error::NotAuthorized);
        }
        if escrow.status != ContractStatus::Active {
            return Err(Error::ContractNotActive);
        }

        let idx = milestone_index as u32;
        if idx >= escrow.milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        milestone.status = MilestoneStatus::Disputed;
        escrow.milestones.set(idx, milestone);
        escrow.status = ContractStatus::Disputed;

        env.storage()
            .persistent()
            .set(&DataKey::Contract(contract_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "dispute_raised"), contract_id),
            milestone_index,
        );

        Ok(())
    }

    /// Arbitrator resolves a disputed milestone, sending funds to either
    /// the freelancer (release) or back to the client (refund).
    pub fn resolve_dispute(
        env: Env,
        contract_id: u32,
        milestone_index: u32,
        arbitrator: Address,
        release_to_freelancer: bool,
    ) -> Result<(), Error> {
        arbitrator.require_auth();

        let mut escrow: EscrowContract = env
            .storage()
            .persistent()
            .get(&DataKey::Contract(contract_id))
            .ok_or(Error::ContractNotFound)?;

        if escrow.arbitrator != arbitrator {
            return Err(Error::NotAuthorized);
        }

        let idx = milestone_index as u32;
        if idx >= escrow.milestones.len() {
            return Err(Error::InvalidMilestoneIndex);
        }

        let mut milestone = escrow.milestones.get(idx).unwrap();
        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::InvalidMilestoneState);
        }

        let token_client = token::Client::new(&env, &escrow.token);
        let recipient = if release_to_freelancer {
            &escrow.freelancer
        } else {
            &escrow.client
        };
        token_client.transfer(&env.current_contract_address(), recipient, &milestone.amount);

        milestone.status = MilestoneStatus::Approved;
        escrow.milestones.set(idx, milestone);

        // Re-check if remaining milestones are still active anywhere; for
        // simplicity, a resolved contract returns to Active so other
        // pending milestones can continue normally.
        escrow.status = ContractStatus::Active;

        env.storage()
            .persistent()
            .set(&DataKey::Contract(contract_id), &escrow);

        env.events().publish(
            (Symbol::new(&env, "dispute_resolved"), contract_id),
            release_to_freelancer,
        );

        Ok(())
    }

    /// Read-only view of a contract's full state.
    pub fn get_contract(env: Env, contract_id: u32) -> Result<EscrowContract, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Contract(contract_id))
            .ok_or(Error::ContractNotFound)
    }
}

mod test;
