#!/bin/bash

# Script to fix 403 error when pushing to GitHub

echo "🔧 Fixing 403 Error - GitHub Authentication Issue"
echo ""

echo "A 403 error usually means:"
echo "  1. Wrong credentials"
echo "  2. Token doesn't have 'repo' permission"
echo "  3. Token expired"
echo "  4. Repository access issue"
echo ""

echo "📝 Solution Options:"
echo ""

echo "Option 1: Create a NEW Personal Access Token (Recommended)"
echo "  1. Go to: https://github.com/settings/tokens/new"
echo "  2. Name: 'Argan Project Push'"
echo "  3. Expiration: Choose 90 days or No expiration"
echo "  4. Scopes: Check 'repo' (this gives full repository access)"
echo "  5. Click 'Generate token'"
echo "  6. Copy the token"
echo ""
read -p "Press Enter after you've created the token..."

echo ""
echo "Option 2: Use SSH instead (More secure)"
echo "  This avoids token issues completely"
echo ""
read -p "Do you want to switch to SSH? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🔐 Setting up SSH..."
  
  # Check if SSH key exists
  if [ ! -f ~/.ssh/id_ed25519.pub ] && [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo "Generating SSH key..."
    read -p "Enter your GitHub email: " EMAIL
    ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""
    KEY_FILE=~/.ssh/id_ed25519.pub
  else
    KEY_FILE=$(ls ~/.ssh/id_*.pub | head -1)
  fi
  
  echo ""
  echo "📋 Your SSH public key:"
  echo "----------------------------------------"
  cat "$KEY_FILE"
  echo "----------------------------------------"
  echo ""
  echo "📝 Add this key to GitHub:"
  echo "  1. Go to: https://github.com/settings/keys"
  echo "  2. Click 'New SSH key'"
  echo "  3. Paste the key above"
  echo "  4. Save"
  echo ""
  read -p "Press Enter after adding the key to GitHub..."
  
  # Change remote to SSH
  echo ""
  echo "🔄 Switching to SSH..."
  git remote set-url origin git@github.com:Nadimsalah/Argan.git
  
  echo "✅ Remote updated to SSH"
  echo ""
  echo "🚀 Pushing..."
  git push -u origin main
  
else
  echo ""
  echo "📝 Using Personal Access Token method"
  echo ""
  echo "Make sure your token has 'repo' scope checked!"
  echo ""
  echo "Try pushing again:"
  echo "  git push -u origin main"
  echo ""
  echo "When prompted:"
  echo "  Username: Nadimsalah"
  echo "  Password: [paste your token]"
fi

echo ""
echo "✅ Done!"
