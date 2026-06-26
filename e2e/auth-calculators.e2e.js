/**
 * Detox E2E skeleton — maps to CSV test IDs in docs/test-cases/MPSConnect-test-cases.csv
 *
 * Setup: see e2e/README.md
 * Uncomment bodies after adding testID props to screens.
 */

describe('Auth E2E skeleton', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it.todo('AUTH-M-003: onboarding skip navigates to login');
  // await element(by.id('onboarding-skip')).tap();
  // await expect(element(by.id('login-screen'))).toBeVisible();

  it.todo('AUTH-M-005: login shows validation for invalid email');
  // await element(by.id('login-email')).typeText('notanemail');
  // await element(by.id('login-password')).typeText('password1');
  // await element(by.id('login-submit')).tap();
  // await expect(element(by.text('Please enter a valid email address.'))).toBeVisible();

  it.todo('AUTH-M-008: successful login reaches home');
  // Requires test backend + MPS OAuth; testID="services-home"

  it.todo('AUTH-M-027: logout returns to login');
});

describe('Calculators E2E skeleton', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it.todo('CALC-H-001: open PlanWealth from services');
  it.todo('CALC-H-002: all four calculators reachable');
  it.todo('CALC-EMI-003: EMI shows numeric result for 10L loan');
});
