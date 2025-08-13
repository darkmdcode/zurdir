const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../database/connection');

const BACKUP_DIR = path.join(__dirname, '../backups');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const encrypt = (text) => {
  if (!ENCRYPTION_KEY) return text;
  
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const createBackup = async () => {
  try {
    console.log('Starting database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Create database dump
    const dumpCommand = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
    
    return new Promise((resolve, reject) => {
      exec(dumpCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error('Backup failed:', error);
          reject(error);
          return;
        }
        
        try {
          // Get file size
          const stats = fs.statSync(backupPath);
          const fileSize = stats.size;
          
          // Encrypt if encryption key is provided
          if (ENCRYPTION_KEY) {
            const data = fs.readFileSync(backupPath, 'utf8');
            const encryptedData = encrypt(data);
            fs.writeFileSync(backupPath, encryptedData);
          }
          
          // Record backup in database
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 60); // 60 days retention
          
          await db.query(
            'INSERT INTO database_backups (backup_path, file_size, expires_at) VALUES ($1, $2, $3)',
            [backupPath, fileSize, expiresAt]
          );
          
          console.log(`Backup created successfully: ${backupFileName}`);
          
          // Clean up old backups
          await cleanupOldBackups();
          
          resolve();
        } catch (dbError) {
          console.error('Error recording backup:', dbError);
          reject(dbError);
        }
      });
    });
  } catch (error) {
    console.error('Backup process failed:', error);
    throw error;
  }
};

const cleanupOldBackups = async () => {
  try {
    // Get expired backups
    const expiredBackups = await db.query(
      'SELECT * FROM database_backups WHERE expires_at < NOW()'
    );
    
    for (const backup of expiredBackups.rows) {
      try {
        // Delete physical file
        if (fs.existsSync(backup.backup_path)) {
          fs.unlinkSync(backup.backup_path);
        }
        
        // Remove from database
        await db.query('DELETE FROM database_backups WHERE id = $1', [backup.id]);
        
        console.log(`Cleaned up expired backup: ${backup.backup_path}`);
      } catch (error) {
        console.error(`Error cleaning up backup ${backup.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Backup cleanup failed:', error);
  }
};

// Schedule daily backups at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled backup...');
  try {
    await createBackup();
    console.log('Scheduled backup completed successfully');
  } catch (error) {
    console.error('Scheduled backup failed:', error);
  }
});

// Run backup immediately if this script is run directly
if (require.main === module) {
  createBackup().then(() => {
    console.log('Manual backup completed');
    process.exit(0);
  }).catch(error => {
    console.error('Manual backup failed:', error);
    process.exit(1);
  });
}

console.log('Backup worker started - Daily backups scheduled at 2 AM');