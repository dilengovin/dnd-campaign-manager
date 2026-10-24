import { REQUIRED_ENVIRONMENT_VARIABLES, validateEnvironment } from './environment';

const completeEnvironment = {
  DATABASE_URL: 'postgresql://dndcm:dndcm@localhost:5432/dndcm?schema=public',
  SESSION_SECRET: 'a-secret-long-enough-to-sign-a-session-with',
};

describe('validateEnvironment', () => {
  it('accepts a configuration carrying every required variable', () => {
    expect(() => validateEnvironment(completeEnvironment)).not.toThrow();
  });

  it('refuses a configuration missing a required variable, naming it', () => {
    for (const variable of REQUIRED_ENVIRONMENT_VARIABLES) {
      const incomplete = { ...completeEnvironment };
      delete incomplete[variable];

      expect(() => validateEnvironment(incomplete)).toThrow(variable);
    }
  });
});
