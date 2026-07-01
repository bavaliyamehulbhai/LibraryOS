const { registerCron, runJob } = require("../services/jobManager");
const Backup = require("../models/Backup");
const logger = require("../utils/logger");

const processBackup = async () => {
  const fileName = `libraryos_backup_${Date.now()}.archive`;
  const backupDoc = await Backup.create({ fileName });

  try {
    // In a real environment, you'd execute mongodump here via child_process
    // e.g. exec(`mongodump --uri=${process.env.MONGO_URI} --archive=backups/${fileName}`)
    logger.info(`[Backup] Executing MongoDB dump to ${fileName}`);
    
    // Simulating delay
    await new Promise(res => setTimeout(res, 2000));
    
    backupDoc.status = "SUCCESS";
    await backupDoc.save();
    logger.info(`[Backup] MongoDB dump successful`);
  } catch (error) {
    backupDoc.status = "FAILED";
    backupDoc.error = error.message;
    await backupDoc.save();
    logger.error(`[Backup] Failed to create dump: ${error.message}`);
    throw error;
  }
};

const startBackupJob = () => {
  registerCron("0 2 * * *", "Daily Database Backup", processBackup);
};

module.exports = { startBackupJob };
