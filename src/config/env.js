function loadEnv() {
  const problems = [];
  const env = process.env;

  function str(name, { required = true } = {}) {
    const value = env[name];
    if (required && (value === undefined || value === '')) {
      problems.push(`${name} is missing`);
      return undefined;
    }
    return value;
  }

  function int(name, { min } = {}) {
    const raw = str(name);
    if (raw === undefined) return undefined;
    const value = Number(raw);
    if (!Number.isInteger(value) || (min !== undefined && value < min)) {
      problems.push(`${name}="${raw}" must be an integer${min !== undefined ? ` >= ${min}` : ''}`);
      return undefined;
    }
    return value;
  }

  const port = int('PORT', { min: 1 });
  const mongodbUri = str('MONGODB_URI');
  const sessionSecret = str('SESSION_SECRET');
  if (sessionSecret && sessionSecret.length < 32) {
    problems.push('SESSION_SECRET must be at least 32 characters long');
  }

  if (problems.length > 0) {
    const message = [
      'its-forms cannot start: .env is missing or invalid.',
      ...problems.map((p) => `  - ${p}`),
      'Copy .env.example to .env and fill in the missing values.',
    ].join('\n');
    throw new Error(message);
  }

  return { port, mongodbUri, sessionSecret };
}

export const env = loadEnv();
