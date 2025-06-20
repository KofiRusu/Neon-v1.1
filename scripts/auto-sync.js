#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Auto-sync script for multi-device workspace synchronization
 * This script handles automatic commits and syncing across devices
 */

class AutoSync {
  constructor() {
    this.deviceId = this.getDeviceId();
    this.syncBranch = 'workspace-sync';
    this.logFile = path.join(process.cwd(), '.sync-log.json');
  }

  getDeviceId() {
    // Generate a unique device identifier
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    return `${hostname}-${platform}-${arch}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, device: this.deviceId };
    
    console.log(`[${level.toUpperCase()}] ${timestamp} [${this.deviceId}]: ${message}`);
    
    // Append to log file
    let logs = [];
    if (fs.existsSync(this.logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      } catch (e) {
        logs = [];
      }
    }
    
    logs.push(logEntry);
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
  }

  async checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.trim().length > 0;
    } catch (error) {
      this.log(`Git status check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      this.log(`Failed to get current branch: ${error.message}`, 'error');
      return 'main';
    }
  }

  async createAutoCommit() {
    try {
      const hasChanges = await this.checkGitStatus();
      if (!hasChanges) {
        this.log('No changes to commit');
        return false;
      }

      // Add all changes
      execSync('git add .', { encoding: 'utf8' });
      
      // Create commit message with device info and timestamp
      const timestamp = new Date().toISOString();
      const commitMessage = `Auto-commit from device ${this.deviceId} at ${timestamp}

- Workspace sync: automatic commit
- Device: ${this.deviceId}
- Platform: ${os.platform()} ${os.arch()}
- Node: ${process.version}`;

      execSync(`git commit -m "${commitMessage}"`, { encoding: 'utf8' });
      this.log('Auto-commit created successfully');
      return true;
    } catch (error) {
      this.log(`Auto-commit failed: ${error.message}`, 'error');
      return false;
    }
  }

  async pushChanges() {
    try {
      const currentBranch = await this.getCurrentBranch();
      execSync(`git push origin ${currentBranch}`, { encoding: 'utf8' });
      this.log(`Changes pushed to origin/${currentBranch}`);
      return true;
    } catch (error) {
      this.log(`Push failed: ${error.message}`, 'error');
      return false;
    }
  }

  async pullLatest() {
    try {
      const currentBranch = await this.getCurrentBranch();
      execSync(`git pull origin ${currentBranch}`, { encoding: 'utf8' });
      this.log(`Pulled latest changes from origin/${currentBranch}`);
      return true;
    } catch (error) {
      this.log(`Pull failed: ${error.message}`, 'error');
      return false;
    }
  }

  async syncWorkspace() {
    this.log('Starting workspace sync...');
    
    try {
      // 1. Pull latest changes first
      await this.pullLatest();
      
      // 2. Create auto-commit if there are changes
      const committed = await this.createAutoCommit();
      
      // 3. Push changes if commit was created
      if (committed) {
        await this.pushChanges();
      }
      
      this.log('Workspace sync completed successfully');
      return true;
    } catch (error) {
      this.log(`Workspace sync failed: ${error.message}`, 'error');
      return false;
    }
  }

  async watchMode() {
    this.log('Starting watch mode for continuous sync...');
    
    const syncInterval = 5 * 60 * 1000; // 5 minutes
    
    setInterval(async () => {
      await this.syncWorkspace();
    }, syncInterval);
    
    // Initial sync
    await this.syncWorkspace();
  }
}

// CLI interface
if (require.main === module) {
  const autoSync = new AutoSync();
  const command = process.argv[2];
  
  switch (command) {
    case 'sync':
      autoSync.syncWorkspace();
      break;
    case 'watch':
      autoSync.watchMode();
      break;
    case 'commit':
      autoSync.createAutoCommit();
      break;
    default:
      console.log(`
Usage: node auto-sync.js <command>

Commands:
  sync    - Perform one-time workspace sync
  watch   - Start continuous sync mode (every 5 minutes)
  commit  - Create auto-commit only

Examples:
  node scripts/auto-sync.js sync
  node scripts/auto-sync.js watch
      `);
  }
}

module.exports = AutoSync; 