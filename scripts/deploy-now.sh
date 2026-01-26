#!/bin/bash

# Interactive Deployment Script for Hostinger
# This script helps you deploy your Next.js app to Hostinger

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Hostinger Deployment Setup${NC}"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  echo -e "${YELLOW}Creating .env.production file...${NC}"
  cp env.production.template .env.production
  echo -e "${GREEN}✅ Created .env.production${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  Please edit .env.production with your credentials before deploying${NC}"
  echo ""
  echo "Required information:"
  echo "  1. Supabase credentials (URL, anon key, service role key)"
  echo "  2. Hostinger FTP credentials (host, username, password)"
  echo "  3. Deployment path (usually /public_html)"
  echo ""
  read -p "Press Enter to continue after you've updated .env.production..."
fi

# Load environment variables
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
fi

# Check required variables
echo -e "${BLUE}Checking configuration...${NC}"

MISSING_VARS=()

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_project_url" ]; then
  MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_URL")
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your_supabase_anon_key" ]; then
  MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
fi

if [ -z "$HOSTINGER_FTP_HOST" ] || [ "$HOSTINGER_FTP_HOST" = "ftp.yourdomain.com" ]; then
  MISSING_VARS+=("HOSTINGER_FTP_HOST")
fi

if [ -z "$HOSTINGER_FTP_USER" ] || [ "$HOSTINGER_FTP_USER" = "your_ftp_username" ]; then
  MISSING_VARS+=("HOSTINGER_FTP_USER")
fi

if [ -z "$HOSTINGER_FTP_PASSWORD" ] || [ "$HOSTINGER_FTP_PASSWORD" = "your_ftp_password" ]; then
  MISSING_VARS+=("HOSTINGER_FTP_PASSWORD")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required configuration:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo -e "${YELLOW}Please update .env.production with your credentials${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Configuration looks good!${NC}"
echo ""

# Build the application
echo -e "${BLUE}📦 Building Next.js application...${NC}"
pnpm build

if [ ! -d ".next/standalone" ]; then
  echo -e "${RED}❌ Build failed. .next/standalone directory not found.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completed!${NC}"
echo ""

# Deploy
echo -e "${BLUE}📤 Ready to deploy!${NC}"
echo ""
echo "Deployment method: ${DEPLOY_METHOD:-ftp}"
echo "Target: ${HOSTINGER_FTP_HOST}"
echo "Path: ${HOSTINGER_DEPLOY_PATH:-/public_html}"
echo ""
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  exit 0
fi

# Run deployment script
bash scripts/deploy-hostinger.sh

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Go to hPanel → Advanced → Node.js"
echo "2. Create Node.js App (version 20.x, startup: server.js)"
echo "3. Add environment variables from .env.production"
echo "4. Point your domain to the Node.js app"
echo "5. Enable SSL certificate"
