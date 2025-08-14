// scripts/validate-env.js
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_PASSCODE',
  'ENCRYPTION_KEY',
  'NEXT_PUBLIC_API_URL',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('All required environment variables are set.');
}
