#!/usr/bin/env node

/**
 * Upload Missing Files Script
 * Uploads app and public directories that might be missing
 */

const fs = require('fs');

// Load environment variables
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

async function uploadMissing() {
  console.log('📤 Uploading missing files...\n');

  try {
    const ftp = require('basic-ftp');
    const client = new ftp.Client();
    client.ftp.verbose = false;

    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: false,
    });

    console.log('✅ Connected!');
    await client.cd(FTP_PATH);

    // Upload app directory if it exists
    if (fs.existsSync('.next/standalone/app')) {
      console.log('\n📤 Uploading app/ directory...');
      await client.ensureDir('app');
      await client.uploadFromDir('.next/standalone/app', 'app');
      console.log('✅ app/ uploaded');
    } else if (fs.existsSync('app')) {
      console.log('\n📤 Uploading app/ directory...');
      await client.ensureDir('app');
      await client.uploadFromDir('app', 'app');
      console.log('✅ app/ uploaded');
    }

    // Upload public directory
    if (fs.existsSync('public')) {
      console.log('\n📤 Uploading public/ directory...');
      await client.ensureDir('public');
      await client.uploadFromDir('public', 'public');
      console.log('✅ public/ uploaded');
    } else if (fs.existsSync('.next/standalone/public')) {
      console.log('\n📤 Uploading public/ directory...');
      await client.ensureDir('public');
      await client.uploadFromDir('.next/standalone/public', 'public');
      console.log('✅ public/ uploaded');
    }

    client.close();
    console.log('\n✅ Missing files uploaded!\n');
    console.log('Run: pnpm deploy:check to verify');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

uploadMissing();
