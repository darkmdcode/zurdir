// scripts/validate-env.js
require('dotenv').config();
const requiredVars = [
  'DATABASE_TYPE',
  'DATABASE_PATH',
  'JWT_SECRET',
  'ADMIN_PASSCODE',
  'ENCRYPTION_KEY',
  'NEXT_PUBLIC_API_URL',
];

const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
} else {
  console.log('All required environment variables are set.');
}
