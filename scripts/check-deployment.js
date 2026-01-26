#!/usr/bin/env node

/**
 * Check Deployment Status Script
 * Verifies what files have been uploaded to Hostinger
 */

const fs = require('fs');

// Load environment variables from .env.production
function loadEnv() {
  const envFile = '.env.production';
  if (!fs.existsSync(envFile)) {
    throw new Error('.env.production not found');
  }
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

loadEnv();

const FTP_HOST = process.env.HOSTINGER_FTP_HOST;
const FTP_USER = process.env.HOSTINGER_FTP_USER;
const FTP_PASS = process.env.HOSTINGER_FTP_PASSWORD;
const FTP_PATH = process.env.HOSTINGER_DEPLOY_PATH || '/public_html';

if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
  console.error('❌ Missing FTP credentials in .env.production');
  process.exit(1);
}

async function checkDeployment() {
  console.log('🔍 Checking deployment status...\n');
  console.log(`📍 Server: ${FTP_HOST}`);
  console.log(`📁 Path: ${FTP_PATH}\n`);

  try {
    const ftp = require('basic-ftp');
    const client = new ftp.Client();
    client.ftp.verbose = false;

    console.log('🔌 Connecting...');
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: false,
    });

    console.log('✅ Connected!\n');

    // Change to deployment directory
    await client.cd(FTP_PATH);

    // List files
    console.log('📋 Checking uploaded files...\n');
    const files = await client.list();
    
    // Check for essential files
    const essentialFiles = {
      'server.js': false,
      'package.json': false,
      'app': false,
      '.next': false,
      'public': false,
      'node_modules': false,
    };

    console.log('📦 Files found on server:\n');
    files.forEach(file => {
      const name = file.name;
      console.log(`  ${file.isDirectory ? '📁' : '📄'} ${name} ${file.isDirectory ? '(dir)' : `(${formatSize(file.size)})`}`);
      
      // Check essential files
      if (essentialFiles.hasOwnProperty(name)) {
        essentialFiles[name] = true;
      }
    });

    console.log('\n✅ Deployment Status:\n');
    let allPresent = true;
    for (const [file, present] of Object.entries(essentialFiles)) {
      const status = present ? '✅' : '❌';
      console.log(`  ${status} ${file}`);
      if (!present && (file === 'server.js' || file === 'app' || file === '.next')) {
        allPresent = false;
      }
    }

    // Check subdirectories
    console.log('\n📂 Checking subdirectories...\n');
    
    if (essentialFiles['.next']) {
      try {
        await client.cd('.next');
        const nextFiles = await client.list();
        console.log('  .next/ contains:');
        nextFiles.slice(0, 10).forEach(file => {
          console.log(`    ${file.isDirectory ? '📁' : '📄'} ${file.name}`);
        });
        if (nextFiles.length > 10) {
          console.log(`    ... and ${nextFiles.length - 10} more items`);
        }
        await client.cd('..');
      } catch (e) {
        console.log('  ⚠️  Could not check .next/ directory');
      }
    }

    if (essentialFiles['app']) {
      try {
        await client.cd('app');
        const appFiles = await client.list();
        console.log('\n  app/ contains:');
        appFiles.slice(0, 10).forEach(file => {
          console.log(`    ${file.isDirectory ? '📁' : '📄'} ${file.name}`);
        });
        if (appFiles.length > 10) {
          console.log(`    ... and ${appFiles.length - 10} more items`);
        }
        await client.cd('..');
      } catch (e) {
        console.log('  ⚠️  Could not check app/ directory');
      }
    }

    client.close();

    console.log('\n' + '='.repeat(50));
    if (allPresent) {
      console.log('✅ DEPLOYMENT COMPLETE!');
      console.log('\n📋 Next steps:');
      console.log('1. Go to hPanel → Advanced → Node.js');
      console.log('2. Create Node.js App (version 20.x, startup: server.js)');
      console.log('3. Add environment variables');
      console.log('4. Start the app');
    } else {
      console.log('⚠️  DEPLOYMENT IN PROGRESS or INCOMPLETE');
      console.log('\nSome essential files are missing.');
      console.log('You may need to run the deployment again:');
      console.log('  node scripts/deploy-ftp-fast.js');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error checking deployment:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

checkDeployment();
