#!/bin/bash

# Hostinger MCP Server Setup Script
# This script helps you configure the Hostinger MCP server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Hostinger MCP Server Setup${NC}"
echo ""

# Check if .cursor directory exists
if [ ! -d ".cursor" ]; then
  echo -e "${YELLOW}Creating .cursor directory...${NC}"
  mkdir -p .cursor
fi

# Check if mcp.json already exists
if [ -f ".cursor/mcp.json" ]; then
  echo -e "${YELLOW}⚠️  .cursor/mcp.json already exists${NC}"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled.${NC}"
    exit 0
  fi
fi

# Get API token
echo -e "${BLUE}Enter your Hostinger API Token:${NC}"
echo -e "${YELLOW}(Get it from: https://hpanel.hostinger.com/ → Account Settings → API)${NC}"
read -s API_TOKEN

if [ -z "$API_TOKEN" ]; then
  echo -e "${RED}❌ Error: API token cannot be empty${NC}"
  exit 1
fi

# Create mcp.json from template
if [ -f ".cursor/mcp.json.template" ]; then
  sed "s/ENTER_TOKEN_HERE/$API_TOKEN/g" .cursor/mcp.json.template > .cursor/mcp.json
else
  # Create from scratch
  cat > .cursor/mcp.json << EOF
{
  "mcpServers": {
    "hostinger-mcp": {
      "command": "npx",
      "args": [
        "hostinger-api-mcp@latest"
      ],
      "env": {
        "API_TOKEN": "$API_TOKEN"
      }
    }
  }
}
EOF
fi

echo ""
echo -e "${GREEN}✅ MCP configuration created successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Restart Cursor to load the MCP server"
echo "2. The MCP server will automatically install on first use"
echo "3. You can now use natural language commands to manage your Hostinger account"
echo ""
echo -e "${YELLOW}Example commands:${NC}"
echo "  - 'Deploy this app to my Hostinger account'"
echo "  - 'List my Hostinger domains'"
echo "  - 'Check my server status'"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
