import { config as loadEnvFile } from 'dotenv';
import { join } from 'node:path';

/**
 * The variables the service cannot run without. A signing secret that silently
 * defaults is how a key of `undefined` reaches production, so an absent one is
 * a crash rather than a default.
 */
export const REQUIRED_ENVIRONMENT_VARIABLES = ['DATABASE_URL', 'SESSION_SECRET'] as const;

/**
 * The environment file, resolved against this package rather than the working
 * directory, so the service reads the same file wherever it is started from.
 */
export const ENV_FILE_PATH = join(__dirname, '..', '..', '.env');

/**
 * Thrown when the environment is missing something required. Its own class so
 * that `main.ts` can report it as the configuration problem it is and exit,
 * rather than burying the one actionable line under a stack trace.
 */
export class MissingConfigurationError extends Error {
  constructor(readonly missing: readonly string[]) {
    const subject = missing.length === 1 ? 'environment variable' : 'environment variables';
    super(
      `Missing required ${subject}: ${missing.join(', ')}. ` +
        'Copy backend/.env.example to backend/.env and set a value for each.',
    );
    this.name = 'MissingConfigurationError';
  }
}

function isAbsent(value: unknown): boolean {
  // A variable set to the empty string is as unset as one never written: an
  // empty signing secret would sign every Session with nothing at all.
  return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Validates the environment the application was handed, returning it unchanged
 * when it is complete. A plain function rather than logic inside module setup,
 * so a test can call it directly: the behaviour it guards happens at startup,
 * where no HTTP test can observe it.
 */
export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter((name) => isAbsent(config[name]));

  if (missing.length > 0) {
    throw new MissingConfigurationError(missing);
  }

  return config;
}

/**
 * Reads the environment file and validates what it leaves behind, throwing
 * `MissingConfigurationError` if anything required is absent.
 *
 * `main.ts` calls this before the application is created. It cannot be left to
 * the config module's own `validate` hook: that hook runs inside an async
 * `forRoot`, and Nest swallows the resulting rejection — the service goes on to
 * boot and serve requests with a signing secret of `undefined`. Checking here
 * is what makes the refusal real.
 */
export function loadEnvironment(): Record<string, unknown> {
  loadEnvFile({ path: ENV_FILE_PATH, quiet: true });
  return validateEnvironment({ ...process.env });
}
