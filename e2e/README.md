# Detox E2E Tests (Skeleton)

End-to-end tests for auth and calculators. Tests are **placeholders** until `testID` props are added to screens.

## Prerequisites

1. Android emulator or iOS simulator running
2. Metro bundler: `npm start`
3. Debug app built for your platform

## Install Detox (one-time)

```bash
npm install --save-dev detox jest-circus
```

Update `.detoxrc.js` `avdName` / simulator type to match your machine.

## Build & run

```bash
# Android
npx detox build -c android.emu.debug
npx detox test -c android.emu.debug

# iOS (macOS only)
npx detox build -c ios.sim.debug
npx detox test -c ios.sim.debug
```

## Test files

| File | CSV mapping |
|------|-------------|
| `auth-calculators.e2e.ts` | `AUTH-M-*`, `CALC-H-*`, `CALC-EMI-*` |

## Adding testIDs (recommended)

| Screen | Suggested testID |
|--------|------------------|
| Onboarding skip | `onboarding-skip` |
| Login screen root | `login-screen` |
| Login email / password / submit | `login-email`, `login-password`, `login-submit` |
| Services home | `services-home` |
| PlanWealth tile | `planwealth-tile` |
| Calculator hub | `calculator-hub` |
| Calculator tiles | `calc-tile-emi`, `calc-tile-loan`, etc. |

Uncomment test bodies in `auth-calculators.e2e.ts` as you add testIDs.

## Related docs

- Test matrix: [docs/test-cases/MPSConnect-test-cases.csv](../docs/test-cases/MPSConnect-test-cases.csv)
- Flow diagrams: [docs/test-cases/FLOW-DIAGRAMS.md](../docs/test-cases/FLOW-DIAGRAMS.md)
