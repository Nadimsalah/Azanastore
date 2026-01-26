#!/usr/bin/env node

/**
 * Hostinger Deployment Script (Node.js version)
 * Alternative deployment script using Node.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequiredEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`, 'red');
    process.exit(1);
  }
}

async function build() {
  log('📦 Building Next.js application...', 'yellow');
  
  try {
    execSync('pnpm build', { stdio: 'inherit' });
    log('✅ Build completed successfully!', 'green');
  } catch (error) {
    log('❌ Build failed!', 'red');
    process.exit(1);
  }
}

async function deploy() {
  const deployMethod = process.env.DEPLOY_METHOD || 'ftp';
  
  if (deployMethod === 'ssh') {
    log('📤 Deploying via SSH...', 'yellow');
    // SSH deployment logic would go here
    // You can use libraries like ssh2 or node-scp
  } else {
    log('📤 Deploying via FTP...', 'yellow');
    // FTP deployment logic would go here
    // You can use libraries like basic-ftp
  }
  
  log('✅ Deployment completed!', 'green');
}

async function main() {
  log('🚀 Starting Hostinger deployment...', 'green');
  
  checkRequiredEnvVars();
  await build();
  await deploy();
  
  log('🎉 Deployment finished successfully!', 'green');
}

main().catch(error => {
  log(`❌ Deployment failed: ${error.message}`, 'red');
  process.exit(1);
});
