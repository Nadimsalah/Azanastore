#!/usr/bin/env node

/**
 * FTP Deployment Script for Hostinger
 * Uses Node.js FTP library (no system dependencies required)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

async function deploy() {
  console.log('📤 Deploying to Hostinger via FTP...\n');

  try {
    // Check if basic-ftp is installed
    let ftp;
    try {
      // Try to resolve from node_modules
      const ftpPath = require.resolve('basic-ftp');
      ftp = require(ftpPath);
    } catch (e) {
      console.log('📦 Installing basic-ftp...');
      execSync('pnpm add -D basic-ftp', { stdio: 'inherit', cwd: __dirname + '/..' });
      // Clear require cache and try again
      delete require.cache[require.resolve('basic-ftp')];
      ftp = require('basic-ftp');
    }

    const client = new ftp.Client();
    client.ftp.verbose = true;

    console.log(`🔌 Connecting to ${FTP_HOST}...`);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: false, // Use plain FTP (not FTPS)
    });

    console.log('✅ Connected successfully!\n');

    // Change to deployment directory
    console.log(`📁 Changing to ${FTP_PATH}...`);
    await client.cd(FTP_PATH);

    // Prepare deployment: copy public and static to standalone
    console.log('📦 Preparing deployment files...');
    const { execSync } = require('child_process');
    try {
      execSync('cp -r public .next/standalone/public 2>/dev/null || true', { cwd: __dirname + '/..' });
      execSync('mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static 2>/dev/null || true', { cwd: __dirname + '/..' });
      console.log('✅ Files prepared\n');
    } catch (e) {
      console.log('⚠️  Warning: Could not prepare all files, continuing...\n');
    }

    // Upload standalone build (includes everything)
    if (fs.existsSync('.next/standalone')) {
      console.log('📤 Uploading application files...');
      await client.uploadFromDir('.next/standalone', '.');
      console.log('✅ Application files uploaded\n');
    }

    // Also upload static files separately if they exist
    if (fs.existsSync('.next/static')) {
      console.log('📤 Uploading static files...');
      await client.ensureDir('.next/static');
      await client.uploadFromDir('.next/static', '.next/static');
      console.log('✅ Static files uploaded\n');
    }

    // Upload public folder separately
    if (fs.existsSync('public')) {
      console.log('📤 Uploading public folder...');
      await client.ensureDir('public');
      await client.uploadFromDir('public', 'public');
      console.log('✅ Public folder uploaded\n');
    }

    // Upload package files
    if (fs.existsSync('package.json')) {
      console.log('📤 Uploading package.json...');
      await client.uploadFrom('package.json', 'package.json');
    }
    if (fs.existsSync('pnpm-lock.yaml')) {
      console.log('📤 Uploading pnpm-lock.yaml...');
      await client.uploadFrom('pnpm-lock.yaml', 'pnpm-lock.yaml');
    }

    client.close();
    console.log('🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to hPanel → Advanced → Node.js');
    console.log('2. Create Node.js App (version 20.x, startup: server.js)');
    console.log('3. Add environment variables from .env.production');
    console.log('4. Start the app');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
