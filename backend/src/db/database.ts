import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { PositionModel } from '@counter-yield/shared';

export interface GuardAuditRecord {
  id: string;
  positionId: string;
  tier: number;
  marginRatioBps: number;
  action: string;
  timestamp: number;
  txHash?: string;
}

export interface RebalanceAuditRecord {
  id: string;
  positionId: string;
  oldSpotQty: string;
  newSpotQty: string;
  oldPerpQty: string;
  newPerpQty: string;
  reason: string;
  timestamp: number;
  txHash?: string;
}

export interface DatabaseState {
  positions: Record<string, PositionModel>;
  guardRecords: GuardAuditRecord[];
  rebalanceRecords: RebalanceAuditRecord[];
  policies: Record<string, any>;
  balances: Record<string, number>;
  lastUpdated: number;
}

export class Database {
  private dbPath: string;
  private state: DatabaseState;

  constructor(filePath?: string) {
    this.dbPath = filePath || path.resolve(process.cwd(), 'data', 'counter_yield_db.json');
    this.state = {
      positions: {},
      guardRecords: [],
      rebalanceRecords: [],
      policies: {},
      balances: {},
      lastUpdated: Date.now(),
    };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.state = JSON.parse(raw);
        logger.info({ count: Object.keys(this.state.positions).length }, 'Loaded database from disk');
      } else {
        this.persist();
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to initialize database from file, using in-memory fallback');
    }
  }

  private persist() {
    try {
      this.state.lastUpdated = Date.now();
      fs.writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      logger.error({ err }, 'Failed to persist database state to disk');
    }
  }

  // --- Positions ---

  public savePosition(position: PositionModel): void {
    this.state.positions[position.positionId] = { ...position };
    this.persist();
  }

  public getPosition(positionId: string): PositionModel | undefined {
    return this.state.positions[positionId];
  }

  public getAllPositions(ownerAddress?: string): PositionModel[] {
    const all = Object.values(this.state.positions);
    if (!ownerAddress) return all;
    return all.filter((p) => p.ownerAddress.toLowerCase() === ownerAddress.toLowerCase());
  }

  // --- Guard Records ---

  public recordGuardEvent(record: Omit<GuardAuditRecord, 'id'>): GuardAuditRecord {
    const fullRecord: GuardAuditRecord = {
      ...record,
      id: `guard-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.state.guardRecords.push(fullRecord);
    this.persist();
    return fullRecord;
  }

  public getGuardRecords(positionId?: string): GuardAuditRecord[] {
    if (!positionId) return this.state.guardRecords;
    return this.state.guardRecords.filter((r) => r.positionId === positionId);
  }

  // --- Rebalance Records ---

  public recordRebalance(record: Omit<RebalanceAuditRecord, 'id'>): RebalanceAuditRecord {
    const fullRecord: RebalanceAuditRecord = {
      ...record,
      id: `rebal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    this.state.rebalanceRecords.push(fullRecord);
    this.persist();
    return fullRecord;
  }

  public getRebalanceRecords(positionId?: string): RebalanceAuditRecord[] {
    if (!positionId) return this.state.rebalanceRecords;
    return this.state.rebalanceRecords.filter((r) => r.positionId === positionId);
  }

  // --- Policies ---

  public savePolicy(owner: string, policy: any): void {
    this.state.policies[owner.toLowerCase()] = policy;
    this.persist();
  }

  public getPolicy(owner: string): any | undefined {
    return this.state.policies[owner.toLowerCase()];
  }

  // --- Balances ---

  public getBalance(address: string): number {
    return this.state.balances?.[address.toLowerCase()] ?? 0;
  }

  public setBalance(address: string, amount: number): void {
    if (!this.state.balances) this.state.balances = {};
    this.state.balances[address.toLowerCase()] = Math.max(0, amount);
    this.persist();
  }

  public deductBalance(address: string, amount: number): number {
    const current = this.getBalance(address);
    const updated = Math.max(0, current - amount);
    this.setBalance(address, updated);
    return updated;
  }

  public creditBalance(address: string, amount: number): number {
    const current = this.getBalance(address);
    const updated = current + amount;
    this.setBalance(address, updated);
    return updated;
  }
}

export const db = new Database();
