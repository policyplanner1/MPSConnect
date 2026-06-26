# MPSConnect Test Documentation

Test cases, flow diagrams, and automated test skeletons for **Authentication** and **PlanWealth Calculators**.

## Files

| File | Purpose |
|------|---------|
| [MPSConnect-test-cases.csv](./MPSConnect-test-cases.csv) | **Excel-ready** test case matrix (open in Excel / Google Sheets) |
| [FLOW-DIAGRAMS.md](./FLOW-DIAGRAMS.md) | Mermaid flow diagrams for auth + calculators |

## Excel import

1. Open **Excel** → File → Open → select `MPSConnect-test-cases.csv`
2. If prompted, choose **UTF-8** encoding (file includes BOM for Windows Excel)
3. Update the **Status** column after testing: `Passed`, `Failed`, or `Blocked`

### Columns

- **Test Case ID** — Unique ID (e.g. `AUTH-M-001`, `CALC-EMI-003`)
- **Module** — Auth or Calculators
- **Type** — Mobile UI, Backend API, or Unit
- **Description/Title** — What is being tested
- **Preconditions** — System state before the test
- **Test Steps** — Step-by-step instructions
- **Test Data** — Inputs used
- **Expected Result** — Expected behavior
- **Status** — Leave blank until executed

## Automated tests

### Jest (unit) — mobile app root

```bash
npm test
```

| Path | Coverage |
|------|----------|
| `__tests__/auth/storage.test.ts` | Token save/get/remove |
| `__tests__/calculators/emiFormula.test.ts` | EMI math |
| `__tests__/calculators/sipFormula.test.ts` | SIP math |

### Jest — backend API

```bash
cd backend-api
npm test
```

| Path | Coverage |
|------|----------|
| `backend-api/__tests__/auth.validation.test.js` | Zod signup/login schemas |

### Detox (E2E skeleton)

See [e2e/README.md](../../e2e/README.md) for setup. Skeleton tests map to CSV IDs where possible.

## Test ID prefixes

| Prefix | Area |
|--------|------|
| `AUTH-M-` | Mobile auth UI |
| `AUTH-A-` | Backend auth API |
| `CALC-H-` | Calculator hub |
| `CALC-EMI-` | EMI calculator |
| `CALC-LOAN-` | Loan calculator |
| `CALC-SIP-` | SIP calculator |
| `CALC-TAX-` | Income tax calculator |
| `CALC-TODO-` | Todo list |
| `CALC-SAV-` | Savings tracker |
| `CALC-FP-` | Financial planner |
| `CALC-FG-` | Financial goal planner |

## Recent fix

`saveToken(response.token)` is restored in `LoginScreen.tsx` so session persistence and `AUTH-M-029` pass reliably.
