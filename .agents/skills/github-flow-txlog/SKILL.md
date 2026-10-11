---
name: github-flow-txlog
description: Automates creating atomic feature branches, managing structured descriptive commits for hackathon judging requirements, maintaining TX_LOG.md, and interfacing with the GitHub MCP server.
---

# GitHub Flow & Transaction Log Skill

This skill enforces strict version control hygiene, structured commit logs, and hackathon judging artifact compliance.

## 1. Atomic Feature Branches
- Always branch out from `master`/`main` using semantic naming:
  - `feat/<feature-name>`
  - `fix/<issue-name>`
  - `chore/<task-name>`
- Isolate commits per logical unit of work.

## 2. Commit Message Standards
- Follow Conventional Commits: `<type>(<scope>): <concise description>`
- Include a descriptive body detailing:
  - Why the change was necessary.
  - What architectural constraints were respected.
  - Test validation status.

## 3. TX_LOG.md Maintenance
- For every state-mutating contract deployment, transaction call, or protocol rebalance:
  - Append an entry to `TX_LOG.md` in the project root.
  - Structure:
    ```markdown
    | Timestamp | Chain ID | Action | Tx Hash / State | Status |
    |-----------|----------|--------|-----------------|--------|
    ```
- Commit `TX_LOG.md` synchronously with corresponding code changes.
