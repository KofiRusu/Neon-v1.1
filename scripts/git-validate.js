#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const PUSH_LOG_FILE = '.pushlog';

function logPushAttempt(user, success, errors = []) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, user, success, errors };
  let logHistory = [];

  if (fs.existsSync(PUSH_LOG_FILE)) {
    try { logHistory = JSON.parse(fs.readFileSync(PUSH_LOG_FILE, 'utf8')); } catch (e) {}
  }

  logHistory.push(logEntry);
  if (logHistory.length > 100) logHistory = logHistory.slice(-100);
  fs.writeFileSync(PUSH_LOG_FILE, JSON.stringify(logHistory, null, 2));
  console.log(`📝 Push logged: ${success ? '✅ PASS' : '❌ BLOCKED'}`);
}

function getCurrentUser() {
  try { return execSync('git config user.name', { encoding: 'utf8' }).trim(); } catch (e) { return 'unknown'; }
}

function runCheck(name, command) {
  console.log(`🔍 ${name}...`);
  try {
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ ${name} passed`);
    return { success: true };
  } catch (error) {
    console.error(`❌ ${name} failed`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const user = getCurrentUser();
  const errors = [];

  console.log(`🛡️ NeonHub Git Push Protection - User: ${user}`);
  console.log('=' * 50);

  const checks = [
    { name: 'Type Check', command: 'npm run type-check' },
    { name: 'Lint Check', command: 'npm run lint' },
    { name: 'Unit Tests', command: 'npm run test' },
    { name: 'Build Check', command: 'node scripts/build-changed-workspaces.js' }
  ];

  for (const check of checks) {
    const result = runCheck(check.name, check.command);
    if (!result.success) errors.push(`${check.name}: ${result.error}`);
  }

  const passed = errors.length === 0;
  logPushAttempt(user, passed, errors);

  if (passed) {
    console.log('\n🎉 All checks passed! Push approved.');
    console.log('✅ Your code meets NeonHub quality standards.');
    process.exit(0);
  } else {
    console.log('\n🚫 Push blocked! Fix the following issues:');
    errors.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    console.log('\n💡 Run the checks individually to debug:');
    console.log('   npm run type-check');
    console.log('   npm run lint');
    console.log('   npm run test');
    console.log('   npm run build');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('🔥 Unexpected error during validation:', err);
  process.exit(1);
});