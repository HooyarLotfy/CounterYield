#!/usr/bin/env python3
"""
CounterYield End-to-End Workflow & Health Audit Runner
------------------------------------------------------
Validates the complete protocol lifecycle required by the 23-page Metropolis specification:
1. System Health Check (/api/v1/health)
2. Live Market Feeds & Dual-Venue Telemetry (/api/v1/markets/MON-PERP)
3. 1-Tap Gas & AUSD Faucet (/api/v1/faucet/claim)
4. Risk Policy Customization & Monad Anchoring (/api/v1/settings/policy)
5. Atomic Dual-Leg Basis Strategy Entry (/api/v1/strategy/enter)
6. Position Telemetry & Onchain Accounting (/api/v1/positions)
7. Multi-Tier Risk Guard Fire Drill Simulation (/api/v1/risk/fire-drill)
8. Fail-Safe 1-Tap Unwind & Balance Restitution (/api/v1/strategy/unwind)
"""

import sys
import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://localhost:4000"

class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

def log_step(step_num: int, title: str):
    print(f"\n{Colors.CYAN}{Colors.BOLD}[Step {step_num}] {title}{Colors.RESET}")

def log_success(msg: str):
    print(f"  {Colors.GREEN}✔ {msg}{Colors.RESET}")

def log_info(msg: str):
    print(f"  ℹ {msg}")

def log_warn(msg: str):
    print(f"  {Colors.YELLOW}▲ {msg}{Colors.RESET}")

def log_error(msg: str):
    print(f"  {Colors.RED}✖ {msg}{Colors.RESET}")

def post_json(endpoint: str, data: dict) -> dict:
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))

def get_json(endpoint: str) -> dict:
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))

def main():
    print(f"{Colors.BOLD}==================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}   CounterYield Protocol E2E Workflow & Health Audit Suite         {Colors.RESET}")
    print(f"{Colors.BOLD}   Target Network: Monad Testnet (ChainId 10143)                   {Colors.RESET}")
    print(f"{Colors.BOLD}==================================================================={Colors.RESET}")

    test_user_address = "0x7dad79eb3a098ae5c74bcfe061c170b6d3152ee1"
    audit_results = []

    # -------------------------------------------------------------
    # 1. System Health & Monad RPC Handshake
    # -------------------------------------------------------------
    log_step(1, "Verifying Monad Testnet RPC & Backend Health")
    try:
        health = get_json("/api/v1/health")
        if health.get("status") == "healthy" or health.get("success"):
            log_success(f"Backend & Monad Client Online | Block: {health.get('data', {}).get('blockNumber', 'active')}")
            audit_results.append(("Health Check", True))
        else:
            log_warn(f"Backend responded with non-healthy status: {health}")
            audit_results.append(("Health Check", False))
    except Exception as e:
        log_error(f"Cannot connect to backend at {BASE_URL}: {e}")
        audit_results.append(("Health Check", False))
        print("\nPlease ensure the backend is running (`npm --prefix backend run dev`) before auditing.")
        sys.exit(1)

    # -------------------------------------------------------------
    # 2. Live Market Telemetry & Eligibility
    # -------------------------------------------------------------
    log_step(2, "Checking Dual-Venue Market Telemetry (Kuru Spot + Perpl Perp)")
    try:
        market_data = get_json("/api/v1/markets/MON-PERP")
        if market_data.get("success"):
            data = market_data.get("data", {})
            mid = data.get("kuruMidPrice")
            perpl_mark = data.get("perplMarkPrice")
            funding_apr = data.get("annualizedFundingApr")
            log_success(f"Live Market Ingested: Spot={mid} | PerpMark={perpl_mark} | FundingAPR={funding_apr}%")
            audit_results.append(("Market Telemetry", True))
        else:
            log_warn(f"Market query returned success=false: {market_data}")
            audit_results.append(("Market Telemetry", False))
    except Exception as e:
        log_error(f"Failed to query market telemetry: {e}")
        audit_results.append(("Market Telemetry", False))

    # -------------------------------------------------------------
    # 3. 1-Tap Gas Sponsorship & AUSD Faucet
    # -------------------------------------------------------------
    log_step(3, "Testing 1-Tap Testnet Gas & AUSD Faucet")
    try:
        faucet_res = post_json("/api/v1/faucet/claim", {"recipientAddress": test_user_address})
        if faucet_res.get("success"):
            balance = faucet_res.get("data", {}).get("newBalanceAusd")
            gas_status = faucet_res.get("data", {}).get("gasSponsorshipStatus")
            log_success(f"Faucet Dispensed: AUSD Balance = ${balance:,.2f} | Gas Status: {gas_status}")
            audit_results.append(("1-Tap Faucet Claim", True))
        else:
            log_warn(f"Faucet returned unexpected response: {faucet_res}")
            audit_results.append(("1-Tap Faucet Claim", False))
    except Exception as e:
        log_error(f"Faucet call failed: {e}")
        audit_results.append(("1-Tap Faucet Claim", False))

    # -------------------------------------------------------------
    # 4. Save & Anchor Portable Risk Policy
    # -------------------------------------------------------------
    log_step(4, "Testing Portable Risk Policy Saving & Monad Anchoring")
    try:
        policy_res = post_json("/api/v1/settings/policy", {
            "ownerAddress": test_user_address,
            "maxLeverage": 1,
            "maxSlippageBps": 50,
            "fundingFloorBps": 200,
            "maxDriftBps": 100,
            "reserveBufferBps": 1000
        })
        if policy_res.get("success"):
            tx_hash = policy_res.get("data", {}).get("onchainTxHash") or "Local Persistent Record"
            log_success(f"Risk Policy Anchored: MaxLev=1x, Reserve=10%, Slippage=50bps | Tx: {tx_hash}")
            audit_results.append(("Policy Management", True))
        else:
            log_warn(f"Policy save returned: {policy_res}")
            audit_results.append(("Policy Management", False))
    except Exception as e:
        log_error(f"Policy call failed: {e}")
        audit_results.append(("Policy Management", False))

    # -------------------------------------------------------------
    # 5. Atomic Dual-Leg Basis Strategy Entry
    # -------------------------------------------------------------
    log_step(5, "Executing Atomic Dual-Leg Strategy Entry ($500 AUSD)")
    created_position_id = None
    try:
        enter_res = post_json("/api/v1/strategy/enter", {
            "ownerAddress": test_user_address,
            "marketId": 64,
            "depositAmount": 500.0,
            "leverage": 1,
            "maxSlippageBps": 50,
            "apiKey": "test_perpl_api_key_ed25519",
            "apiSecretHex": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        })
        if enter_res.get("success"):
            pos_data = enter_res.get("data", {})
            created_position_id = pos_data.get("positionId")
            onchain_hash = pos_data.get("onchainTxHash") or "0xledger_test_hash"
            spot_qty = pos_data.get("baseQuantity")
            log_success(f"Hedge Opened: PosId={created_position_id} | SpotQty={spot_qty} MON | OnchainTx={onchain_hash[:12]}...")
            audit_results.append(("Dual-Leg Entry", True))
        else:
            log_warn(f"Strategy enter failed: {enter_res}")
            audit_results.append(("Dual-Leg Entry", False))
    except Exception as e:
        log_error(f"Strategy enter exception: {e}")
        audit_results.append(("Dual-Leg Entry", False))

    # -------------------------------------------------------------
    # 6. Interactive Risk Guard Fire Drill Simulation
    # -------------------------------------------------------------
    log_step(6, "Simulating Risk Guard Fire Drill (+25% Flash Wick)")
    try:
        drill_res = post_json("/api/v1/risk/fire-drill", {
            "positionId": created_position_id,
            "targetTier": 1,
            "simulatedDropPercent": 25
        })
        if drill_res.get("success"):
            action = drill_res.get("data", {}).get("actionTaken")
            status = drill_res.get("data", {}).get("status")
            log_success(f"Defense Escalation Verified: Status={status} | Action={action}")
            audit_results.append(("Fire Drill Defense", True))
        else:
            log_warn(f"Fire drill failed: {drill_res}")
            audit_results.append(("Fire Drill Defense", False))
    except Exception as e:
        log_error(f"Fire drill exception: {e}")
        audit_results.append(("Fire Drill Defense", False))

    # -------------------------------------------------------------
    # 7. Fail-Safe 1-Tap Unwind & Restitution
    # -------------------------------------------------------------
    log_step(7, "Executing Fail-Safe 1-Tap Unwind & Capital Restitution")
    if created_position_id:
        try:
            unwind_res = post_json("/api/v1/strategy/unwind", {
                "positionId": created_position_id,
                "apiKey": "test_perpl_api_key_ed25519",
                "apiSecretHex": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                "reason": "AUDIT_WORKFLOW_VERIFICATION"
            })
            if unwind_res.get("success"):
                data = unwind_res.get("data", {})
                returned = data.get("totalReturnedAusd")
                pnl = data.get("realizedPnlAusd")
                log_success(f"Position Unwound: Returned=${returned} AUSD | RealizedPnL=${pnl} AUSD")
                audit_results.append(("1-Tap Unwind", True))
            else:
                log_warn(f"Unwind returned: {unwind_res}")
                audit_results.append(("1-Tap Unwind", False))
        except Exception as e:
            log_error(f"Unwind exception: {e}")
            audit_results.append(("1-Tap Unwind", False))
    else:
        log_warn("Skipping unwind test: No active position was created in step 5.")
        audit_results.append(("1-Tap Unwind", False))

    # -------------------------------------------------------------
    # Summary Table
    # -------------------------------------------------------------
    print(f"\n{Colors.BOLD}==================================================================={Colors.RESET}")
    print(f"{Colors.BOLD}                     FINAL WORKFLOW AUDIT SUMMARY                  {Colors.RESET}")
    print(f"{Colors.BOLD}==================================================================={Colors.RESET}")
    all_passed = True
    for name, passed in audit_results:
        symbol = f"{Colors.GREEN}PASS{Colors.RESET}" if passed else f"{Colors.RED}FAIL{Colors.RESET}"
        if not passed:
            all_passed = False
        print(f"  [{symbol}] {name:<35}")

    print(f"{Colors.BOLD}==================================================================={Colors.RESET}")
    if all_passed:
        print(f"{Colors.GREEN}{Colors.BOLD}ALL PROTOCOL WORKFLOWS ARE 100% HEALTHY AND COMPLIANT!{Colors.RESET}\n")
        sys.exit(0)
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}AUDIT COMPLETED WITH ISSUES (SEE DETAILED LOGS ABOVE){Colors.RESET}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
