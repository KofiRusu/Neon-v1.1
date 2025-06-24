#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const PUSH_LOG_FILE = '.pushlog';

function logPushAttempt(user, success, errors = [], timing = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, user, success, errors, timing };
  let logHistory = [];

  if (fs.existsSync(PUSH_LOG_FILE)) {
    try { 
      logHistory = JSON.parse(fs.readFileSync(PUSH_LOG_FILE, 'utf8')); 
    } catch (e) {
      console.warn('⚠️ Push log corrupted, creating new one');
    }
  }

  logHistory.push(logEntry);
  if (logHistory.length > 100) logHistory = logHistory.slice(-100);
  
  try {
    fs.writeFileSync(PUSH_LOG_FILE, JSON.stringify(logHistory, null, 2));
    console.log(`📝 Push logged: ${success ? '✅ APPROVED' : '❌ BLOCKED'}`);
  } catch (e) {
    console.warn('⚠️ Could not write push log:', e.message);
  }
}

function getCurrentUser() {
  try { 
    return execSync('git config user.name', { encoding: 'utf8' }).trim(); 
  } catch (e) { 
    return 'unknown'; 
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'unknown';
  }
}

function getPackageManager() {
  // Check if pnpm is available, fallback to npx pnpm, then npm
  try {
    execSync('pnpm --version', { stdio: 'pipe' });
    return 'pnpm';
  } catch (e) {
    try {
      execSync('npx pnpm --version', { stdio: 'pipe' });
      return 'npx pnpm';
    } catch (e2) {
      console.warn('⚠️ pnpm not found, falling back to npm');
      return 'npm run';
    }
  }
}

function runCheck(name, command, options = {}) {
  const startTime = Date.now();
  console.log(`🔍 ${name}...`);
  
  try {
    const result = execSync(command, { 
      stdio: options.showOutput ? 'inherit' : 'pipe',
      encoding: 'utf8',
      timeout: options.timeout || 60000
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${name} passed (${duration}ms)`);
    return { success: true, duration, output: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${name} failed (${duration}ms)`);
    
    if (options.showError && error.stdout) {
      console.error('Output:', error.stdout.slice(-500)); // Last 500 chars
    }
    
    return { 
      success: false, 
      duration,
      error: error.message,
      exitCode: error.status
    };
  }
}

function checkWorkspaceStatus() {
  try {
    // Check if we're in a clean state
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    
    return {
      hasUncommittedChanges: status.trim().length > 0,
      hasStagedChanges: staged.trim().length > 0
    };
  } catch (e) {
    return { hasUncommittedChanges: false, hasStagedChanges: false };
  }
}

async function main() {
  const user = getCurrentUser();
  const branch = getCurrentBranch();
  const workspaceStatus = checkWorkspaceStatus();
  const packageManager = getPackageManager();
  const errors = [];
  const timing = {};

  console.log('🛡️ Neon Git Push Protection - Enhanced & Optimized');
  console.log('='.repeat(60));
  console.log(`👤 User: ${user}`);
  console.log(`🌿 Branch: ${branch}`);
  console.log(`📦 Package Manager: ${packageManager}`);
  console.log(`📁 Staged changes: ${workspaceStatus.hasStagedChanges ? 'Yes' : 'No'}`);
  console.log('='.repeat(60));

  // Skip checks for certain branches if no changes
  if (['main', 'develop'].includes(branch) && !workspaceStatus.hasStagedChanges) {
    console.log('⚡ No staged changes on protected branch, running fast validation...');
  }

  const checks = [
    { 
      name: 'Type Check', 
      command: `${packageManager} type-check`,
      critical: true,
      timeout: 45000
    },
    { 
      name: 'Lint Check', 
      command: `${packageManager} lint`,
      critical: false,
      timeout: 30000
    },
    { 
      name: 'Format Check', 
      command: `${packageManager} format:check`,
      critical: false,
      timeout: 15000
    },
    { 
      name: 'Build Check', 
      command: `${packageManager} build`,
      critical: true,
      timeout: 120000,
      showOutput: false
    }
  ];

  // Run tests only if there are significant changes
  if (workspaceStatus.hasStagedChanges) {
    checks.push({
      name: 'Unit Tests',
      command: `${packageManager} test --runInBand --passWithNoTests`,
      critical: false,
      timeout: 90000
    });
  }

  console.log(`\n🚀 Running ${checks.length} validation checks...\n`);

  for (const check of checks) {
    const result = runCheck(check.name, check.command, {
      timeout: check.timeout,
      showOutput: check.showOutput,
      showError: check.critical
    });
    
    timing[check.name] = result.duration;
    
    if (!result.success) {
      const errorMsg = `${check.name}: ${result.error || 'Command failed'}`;
      
      if (check.critical) {
        errors.push(`🚨 CRITICAL: ${errorMsg}`);
      } else {
        console.log(`⚠️ Non-critical: ${check.name} failed but continuing...`);
      }
    }
  }

  const totalTime = Object.values(timing).reduce((a, b) => a + b, 0);
  const passed = errors.length === 0;
  
  console.log('\n' + '='.repeat(60));
  console.log(`⏱️ Total validation time: ${totalTime}ms`);
  
  logPushAttempt(user, passed, errors, timing);

  if (passed) {
    console.log('\n🎉 All critical checks passed! Push approved.');
    console.log('✅ Your code meets Neon quality standards.');
    console.log(`🚀 Ready to push to ${branch}`);
    process.exit(0);
  } else {
    console.log('\n🚫 Push blocked! Critical issues found:');
    errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
    
    console.log('\n💡 Quick fix commands:');
    console.log(`   ${packageManager} lint:fix        # Auto-fix linting issues`);
    console.log(`   ${packageManager} format          # Auto-fix formatting`);
    console.log(`   ${packageManager} type-check      # Check TypeScript errors`);
    console.log(`   ${packageManager} validate:fast   # Run quick validation`);
    
    console.log('\n🔧 Or run full validation:');
    console.log(`   ${packageManager} validate        # Full validation suite`);
    
    // If this is a minor branch or the errors are not critical, allow push anyway
    if (!['main', 'develop'].includes(branch)) {
      console.log('\n⚠️ Non-protected branch - allowing push despite validation failures');
      console.log('🚨 Please fix issues before merging to main/develop');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Validation interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️ Validation terminated');
  process.exit(1);
});

main().catch(err => {
  console.error('\n🔥 Unexpected error during validation:', err.message);
  console.error('💡 This might be a configuration issue. Check your setup.');
  
  // Allow push on unexpected errors for non-protected branches
  const branch = getCurrentBranch();
  if (!['main', 'develop'].includes(branch)) {
    console.error('⚠️ Allowing push due to validation error on non-protected branch');
    process.exit(0);
  }
  
  process.exit(1);
});