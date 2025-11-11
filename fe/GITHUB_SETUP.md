# GitHub Repository Setup Instructions

## Step 1: Create the GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `bodyapp`
3. **Description**: `Real-time body composition scanner with pose detection, analysis, and personalized fitness recommendations`
4. Choose **Public** or **Private**
5. **IMPORTANT**: Do NOT check any of these boxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, run:

```bash
git push -u origin main
```

If you're prompted for credentials:
- Use a **Personal Access Token** (not your password)
- Create one at: https://github.com/settings/tokens
- Select scopes: `repo` (full control of private repositories)

## Alternative: Use SSH (if configured)

If you have SSH keys set up with GitHub:

```bash
git remote set-url origin git@github.com:ghazalehmirzaee/bodyapp.git
git push -u origin main
```

