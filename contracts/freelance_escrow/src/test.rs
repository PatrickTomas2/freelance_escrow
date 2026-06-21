//! Test suite for FreelanceEscrowContract.
//! Exactly 5 tests as required: happy path, edge/failure case, and state
//! verification, plus two supporting flow tests for dispute handling.
#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _},
    Address, Env, Vec,
};

// Helper: deploys a standard Stellar Asset Contract (SAC) test token and
// mints an initial balance to `to`. Returns (token_address, admin_address).
fn create_token_contract(env: &Env, admin: &Address) -> Address {
    env.register_stellar_asset_contract_v2(admin.clone())
        .address()
}

fn mint(env: &Env, token: &Address, to: &Address, amount: i128) {
    let client = token::StellarAssetClient::new(env, token);
    client.mint(to, &amount);
}

// ---------------------------------------------------------------------
// Test 1 — Happy path: full MVP flow executes end-to-end
// ---------------------------------------------------------------------
#[test]
fn test_happy_path_full_milestone_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FreelanceEscrowContract, ());
    let client_handle = FreelanceEscrowContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = create_token_contract(&env, &token_admin);

    mint(&env, &token, &client_addr, 1_000_0000000);

    let mut amounts: Vec<i128> = Vec::new(&env);
    amounts.push_back(200_0000000);
    amounts.push_back(200_0000000);

    let escrow_id = client_handle.create_contract(
        &client_addr,
        &freelancer,
        &arbitrator,
        &token,
        &amounts,
    );

    client_handle.submit_milestone(&escrow_id, &0, &freelancer);
    client_handle.approve_milestone(&escrow_id, &0, &client_addr);

    let token_client = token::Client::new(&env, &token);
    assert_eq!(token_client.balance(&freelancer), 200_0000000);

    let escrow = client_handle.get_contract(&escrow_id);
    assert_eq!(escrow.milestones.get(0).unwrap().status, MilestoneStatus::Approved);
    assert_eq!(escrow.status, ContractStatus::Active);
}

// ---------------------------------------------------------------------
// Test 2 — Edge case: unauthorized caller cannot approve a milestone
// ---------------------------------------------------------------------
#[test]
fn test_unauthorized_approver_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FreelanceEscrowContract, ());
    let client_handle = FreelanceEscrowContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let stranger = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = create_token_contract(&env, &token_admin);

    mint(&env, &token, &client_addr, 500_0000000);

    let mut amounts: Vec<i128> = Vec::new(&env);
    amounts.push_back(500_0000000);

    let escrow_id = client_handle.create_contract(
        &client_addr,
        &freelancer,
        &arbitrator,
        &token,
        &amounts,
    );

    client_handle.submit_milestone(&escrow_id, &0, &freelancer);

    // `stranger` is not the client on this contract; approval must fail.
    let result = client_handle.try_approve_milestone(&escrow_id, &0, &stranger);
    assert_eq!(result, Err(Ok(Error::NotAuthorized)));
}

// ---------------------------------------------------------------------
// Test 3 — State verification: storage reflects correct state after
// the MVP transaction (partial payout, remaining milestone still pending)
// ---------------------------------------------------------------------
#[test]
fn test_state_after_single_milestone_payout() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FreelanceEscrowContract, ());
    let client_handle = FreelanceEscrowContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = create_token_contract(&env, &token_admin);

    mint(&env, &token, &client_addr, 400_0000000);

    let mut amounts: Vec<i128> = Vec::new(&env);
    amounts.push_back(200_0000000);
    amounts.push_back(200_0000000);

    let escrow_id = client_handle.create_contract(
        &client_addr,
        &freelancer,
        &arbitrator,
        &token,
        &amounts,
    );

    client_handle.submit_milestone(&escrow_id, &0, &freelancer);
    client_handle.approve_milestone(&escrow_id, &0, &client_addr);

    let escrow = client_handle.get_contract(&escrow_id);

    // Milestone 0 paid out and approved.
    assert_eq!(escrow.milestones.get(0).unwrap().status, MilestoneStatus::Approved);
    // Milestone 1 untouched, still pending.
    assert_eq!(escrow.milestones.get(1).unwrap().status, MilestoneStatus::Pending);
    // Contract not yet completed since one milestone remains.
    assert_eq!(escrow.status, ContractStatus::Active);

    let token_client = token::Client::new(&env, &token);
    // Contract still holds the second milestone's funds in escrow.
    assert_eq!(token_client.balance(&contract_id), 200_0000000);
}

// ---------------------------------------------------------------------
// Test 4 — Dispute flow: raising a dispute locks the contract, and
// arbitrator resolution releases funds and reactivates the contract
// ---------------------------------------------------------------------
#[test]
fn test_dispute_raised_and_resolved_to_freelancer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FreelanceEscrowContract, ());
    let client_handle = FreelanceEscrowContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = create_token_contract(&env, &token_admin);

    mint(&env, &token, &client_addr, 300_0000000);

    let mut amounts: Vec<i128> = Vec::new(&env);
    amounts.push_back(300_0000000);

    let escrow_id = client_handle.create_contract(
        &client_addr,
        &freelancer,
        &arbitrator,
        &token,
        &amounts,
    );

    client_handle.submit_milestone(&escrow_id, &0, &freelancer);
    client_handle.raise_dispute(&escrow_id, &0, &client_addr);

    let escrow_mid = client_handle.get_contract(&escrow_id);
    assert_eq!(escrow_mid.status, ContractStatus::Disputed);
    assert_eq!(escrow_mid.milestones.get(0).unwrap().status, MilestoneStatus::Disputed);

    client_handle.resolve_dispute(&escrow_id, &0, &arbitrator, &true);

    let token_client = token::Client::new(&env, &token);
    assert_eq!(token_client.balance(&freelancer), 300_0000000);

    let escrow_final = client_handle.get_contract(&escrow_id);
    assert_eq!(escrow_final.status, ContractStatus::Active);
    assert_eq!(escrow_final.milestones.get(0).unwrap().status, MilestoneStatus::Approved);
}

// ---------------------------------------------------------------------
// Test 5 — Edge case: cannot submit a milestone that's already approved
// ---------------------------------------------------------------------
#[test]
fn test_cannot_resubmit_approved_milestone() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(FreelanceEscrowContract, ());
    let client_handle = FreelanceEscrowContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token = create_token_contract(&env, &token_admin);

    mint(&env, &token, &client_addr, 100_0000000);

    let mut amounts: Vec<i128> = Vec::new(&env);
    amounts.push_back(100_0000000);

    let escrow_id = client_handle.create_contract(
        &client_addr,
        &freelancer,
        &arbitrator,
        &token,
        &amounts,
    );

    client_handle.submit_milestone(&escrow_id, &0, &freelancer);
    client_handle.approve_milestone(&escrow_id, &0, &client_addr);

    // Milestone already approved; resubmitting must fail.
    let result = client_handle.try_submit_milestone(&escrow_id, &0, &freelancer);
    assert_eq!(result, Err(Ok(Error::InvalidMilestoneState)));
}
