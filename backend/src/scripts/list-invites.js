const db = require('../database/connection');

async function listValidInvitationCodes() {
  try {
    const result = await db.query(
      'SELECT code, is_active, used_by FROM invitation_codes',
      []
    );
    console.log('All invitation codes:');
    for (const row of result.rows) {
      console.log(`Code: ${row.code} | Active: ${row.is_active} | Used by: ${row.used_by}`);
    }
  } catch (error) {
    console.error('Error fetching invitation codes:', error);
  } finally {
    process.exit();
  }
}

listValidInvitationCodes();
