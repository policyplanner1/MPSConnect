const { signupSchema, loginSchema } = require('../src/modules/auth/auth.validation');

describe('auth.validation (AUTH-A-004, AUTH-A-005, AUTH-A-006)', () => {
  const validSignup = {
    name: 'Test User',
    email: 'user@test.com',
    contactNumber: '9876543210',
    password: 'password123',
  };

  it('accepts valid signup payload', () => {
    const parsed = signupSchema.parse(validSignup);
    expect(parsed.email).toBe('user@test.com');
    expect(parsed.name).toBe('Test User');
  });

  it('rejects invalid email on signup', () => {
    expect(() =>
      signupSchema.parse({ ...validSignup, email: 'notemail' }),
    ).toThrow();
  });

  it('rejects short password on signup', () => {
    expect(() =>
      signupSchema.parse({ ...validSignup, password: '12345' }),
    ).toThrow(/6 characters/);
  });

  it('rejects invalid contact format on signup', () => {
    expect(() =>
      signupSchema.parse({ ...validSignup, contactNumber: 'abc' }),
    ).toThrow();
  });

  it('accepts valid login payload', () => {
    const parsed = loginSchema.parse({
      email: 'user@test.com',
      password: 'secret12',
    });
    expect(parsed.email).toBe('user@test.com');
    expect(parsed.password).toBe('secret12');
  });

  it('normalizes login email to lowercase', () => {
    const parsed = loginSchema.parse({
      email: '  User@Mail.COM ',
      password: 'secret12',
    });
    expect(parsed.email).toBe('user@mail.com');
  });

  it('rejects short password on login', () => {
    expect(() =>
      loginSchema.parse({ email: 'user@test.com', password: '12345' }),
    ).toThrow();
  });
});
