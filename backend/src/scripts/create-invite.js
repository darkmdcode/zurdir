const db = require('../database/connection');
const crypto = require('crypto');
const { initializeDatabase } = require('../database/migrate');

async function createInitialInvitationCode() {
  // Initialize the database first
  await initializeDatabase();
  try {
    // Generate a random 15-character invitation code
    const code = crypto.randomBytes(8).toString('hex').slice(0, 15);
    
    // Insert the invitation code
    await db.query(
      'INSERT INTO invitation_codes (code, is_active) VALUES (?, ?)',
      [code, 1]
    );
    
    console.log('✅ Created initial invitation code:', code);
    console.log('Use this code to create your first user account');
    
  } catch (error) {
    console.error('Failed to create invitation code:', error);
  } finally {
    process.exit();
  }
}

createInitialInvitationCode();
