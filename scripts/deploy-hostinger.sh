#!/bin/bash

# Hostinger Deployment Script
# This script builds and deploys your Next.js app to Hostinger

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

echo -e "${GREEN}🚀 Starting Hostinger deployment...${NC}"

# Check if required environment variables are set
if [ -z "$HOSTINGER_FTP_HOST" ] && [ -z "$HOSTINGER_SSH_HOST" ]; then
  echo -e "${RED}❌ Error: Hostinger credentials not found.${NC}"
  echo "Please set HOSTINGER_FTP_HOST or HOSTINGER_SSH_HOST in .env.production"
  exit 1
fi

# Build the application
echo -e "${YELLOW}📦 Building Next.js application...${NC}"
pnpm build

if [ ! -d ".next/standalone" ]; then
  echo -e "${RED}❌ Error: Build failed. .next/standalone directory not found.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Deployment method selection
DEPLOY_METHOD=${DEPLOY_METHOD:-"ftp"}

if [ "$DEPLOY_METHOD" = "ssh" ]; then
  echo -e "${YELLOW}📤 Deploying via SSH...${NC}"
  
  # Create deployment archive
  tar -czf deployment.tar.gz \
    .next/standalone \
    .next/static \
    public \
    package.json \
    pnpm-lock.yaml
  
  # Upload via SCP
  scp -P ${HOSTINGER_SSH_PORT:-22} deployment.tar.gz \
    ${HOSTINGER_SSH_USER}@${HOSTINGER_SSH_HOST}:${HOSTINGER_DEPLOY_PATH:-/home/username/public_html}/
  
  # Extract and setup on server
  ssh -p ${HOSTINGER_SSH_PORT:-22} ${HOSTINGER_SSH_USER}@${HOSTINGER_SSH_HOST} << EOF
    cd ${HOSTINGER_DEPLOY_PATH:-/home/username/public_html}
    tar -xzf deployment.tar.gz
    rm deployment.tar.gz
    pnpm install --prod --frozen-lockfile || npm install --production
    pm2 restart nextjs || pm2 start npm --name "nextjs" -- start
EOF

  rm deployment.tar.gz
  echo -e "${GREEN}✅ Deployment via SSH completed!${NC}"
  
else
  echo -e "${YELLOW}📤 Deploying via FTP...${NC}"
  
  # Check if lftp is installed
  if ! command -v lftp &> /dev/null; then
    echo -e "${YELLOW}⚠️  lftp not found. Installing...${NC}"
    sudo apt-get update && sudo apt-get install -y lftp
  fi
  
  # Deploy via FTP
  lftp -c "
    set ftp:ssl-allow no
    open -u ${HOSTINGER_FTP_USER},${HOSTINGER_FTP_PASSWORD} ${HOSTINGER_FTP_HOST}
    cd ${HOSTINGER_DEPLOY_PATH:-/public_html}
    mirror -R --delete --verbose .next/standalone .next/standalone
    mirror -R --delete --verbose .next/static .next/static
    mirror -R --delete --verbose public public
    put package.json
    put pnpm-lock.yaml
    bye
  "
  
  echo -e "${GREEN}✅ Deployment via FTP completed!${NC}"
fi

echo -e "${GREEN}🎉 Deployment finished successfully!${NC}"
