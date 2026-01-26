# Fix 403 Error - GitHub Push Authentication

## What is a 403 Error?

A 403 error means GitHub rejected your authentication. Common causes:

1. ❌ **Token doesn't have 'repo' permission**
2. ❌ **Token expired**
3. ❌ **Wrong username or token**
4. ❌ **Repository access denied**

## ✅ Solution 1: Create New Token with Correct Permissions

### Step-by-Step:

1. **Go to GitHub Token Settings:**
   - https://github.com/settings/tokens/new

2. **Fill in the form:**
   - **Note**: `Argan Project Push`
   - **Expiration**: Choose `90 days` or `No expiration`
   - **Scopes**: ✅ **Check `repo`** (this is critical!)
     - This gives full control of private repositories
     - Includes: repo:status, repo_deployment, public_repo, repo:invite, security_events

3. **Generate and Copy:**
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

4. **Push with the token:**
   ```bash
   cd /home/micro/Documents/Cursor/e-commerce-landing-page
   git push -u origin main
   ```
   - **Username**: `Nadimsalah`
   - **Password**: Paste your token (not your GitHub password!)

## ✅ Solution 2: Use SSH (Recommended - More Secure)

SSH avoids token issues completely:

### Quick Setup:

```bash
cd /home/micro/Documents/Cursor/e-commerce-landing-page
bash scripts/setup-ssh-push.sh
```

Or manually:

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept defaults
   ```

2. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Save

4. **Switch remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:Nadimsalah/Argan.git
   ```

5. **Push:**
   ```bash
   git push -u origin main
   ```

## ✅ Solution 3: Use Helper Script

Run the automated fix script:

```bash
cd /home/micro/Documents/Cursor/e-commerce-landing-page
bash scripts/fix-403-error.sh
```

This will guide you through the process.

## 🔍 Verify Your Setup

Check your remote:
```bash
git remote -v
```

Should show:
- HTTPS: `https://github.com/Nadimsalah/Argan.git`
- SSH: `git@github.com:Nadimsalah/Argan.git`

## ⚠️ Common Mistakes

1. **Using GitHub password instead of token** ❌
   - Use the Personal Access Token, not your password!

2. **Token without 'repo' scope** ❌
   - Make sure 'repo' is checked when creating token

3. **Expired token** ❌
   - Create a new token if old one expired

4. **Wrong repository URL** ❌
   - Verify: `https://github.com/Nadimsalah/Argan.git`

## 🎯 Quick Fix Command

If you have a valid token with 'repo' permission:

```bash
cd /home/micro/Documents/Cursor/e-commerce-landing-page
git push -u origin main
# Enter: Nadimsalah
# Enter: [your_token]
```

## 📞 Still Having Issues?

1. Verify repository exists: https://github.com/Nadimsalah/Argan
2. Check you have write access to the repository
3. Try SSH method (more reliable)
4. Create a fresh token with all 'repo' permissions
