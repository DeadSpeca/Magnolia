# 🔄 Renaming Repository from "reader" to "magnolia"

This guide will help you rename your GitHub repository and update all references.

## ✅ What's Already Done

I've updated all the app files:
- ✅ `package.json` - Changed name to "magnolia"
- ✅ `app.json` - Changed app name to "Magnolia" and package to "com.magnolia.app"
- ✅ `BUILD_GUIDE.md` - Updated all references
- ✅ `README.md` - Created with new name

## 📋 Step-by-Step Guide

### Step 1: Commit Local Changes

First, commit all the name changes locally:

```bash
# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Rename app from Reader to Magnolia"

# Push to current repository
git push origin master
```

### Step 2: Rename Repository on GitHub

**Option A: Via GitHub Web Interface (Easiest)**

1. Go to your repository: https://github.com/DeadSpeca/reader
2. Click on **Settings** (top right)
3. Scroll down to **Repository name** section
4. Change "reader" to "magnolia"
5. Click **Rename** button
6. GitHub will show a warning - click **I understand, rename repository**

**Option B: Via GitHub CLI (if installed)**

```bash
gh repo rename magnolia
```

### Step 3: Update Local Git Remote

After renaming on GitHub, update your local repository:

```bash
# Update the remote URL
git remote set-url origin https://github.com/DeadSpeca/magnolia.git

# Verify the change
git remote -v
```

### Step 4: Rename Local Directory (Optional)

If you want to rename your local project folder:

```bash
# Go to parent directory
cd ..

# Rename the folder
mv reader magnolia

# Go back into the project
cd magnolia
```

### Step 5: Verify Everything Works

```bash
# Pull to make sure connection works
git pull origin master

# Check status
git status
```

## 🔗 What GitHub Handles Automatically

When you rename a repository on GitHub:
- ✅ **Redirects**: GitHub automatically redirects from old URL to new URL
- ✅ **Clone URLs**: Old clone URLs will redirect to new repository
- ✅ **Issues & PRs**: All issues and pull requests remain intact
- ✅ **Stars & Watchers**: All stars and watchers are preserved
- ✅ **Forks**: Forks are automatically updated to point to new name

## ⚠️ Important Notes

### Things That Need Manual Update:

1. **Local Clones**: Anyone who has cloned the repo needs to update their remote URL:
   ```bash
   git remote set-url origin https://github.com/DeadSpeca/magnolia.git
   ```

2. **CI/CD Pipelines**: If you have any CI/CD setup, update the repository references

3. **Documentation Links**: Update any external documentation that links to the old repo

4. **Package Managers**: If published to npm/yarn, the package name in package.json is already updated

### GitHub Redirects

- Old URL: `https://github.com/DeadSpeca/reader`
- New URL: `https://github.com/DeadSpeca/magnolia`
- GitHub will redirect old → new automatically

## 🚀 Quick Command Summary

```bash
# 1. Commit changes
git add .
git commit -m "Rename app from Reader to Magnolia"
git push origin master

# 2. Rename on GitHub (via web interface)
# Go to Settings → Repository name → Change to "magnolia"

# 3. Update local remote
git remote set-url origin https://github.com/DeadSpeca/magnolia.git

# 4. Verify
git remote -v
git pull origin master

# 5. (Optional) Rename local folder
cd ..
mv reader magnolia
cd magnolia
```

## 📝 Checklist

Before renaming:
- [x] Update package.json
- [x] Update app.json
- [x] Update BUILD_GUIDE.md
- [x] Create README.md
- [ ] Commit all changes
- [ ] Push to GitHub

After renaming:
- [ ] Rename repository on GitHub
- [ ] Update local git remote URL
- [ ] Verify git pull/push works
- [ ] (Optional) Rename local folder
- [ ] Update any external references

## 🎯 Final Result

After completing all steps:
- **Repository URL**: https://github.com/DeadSpeca/magnolia
- **App Name**: Magnolia
- **Package Name**: com.magnolia.app
- **Local Folder**: magnolia (if renamed)

## 🆘 Troubleshooting

### "Repository not found" error after rename

```bash
# Update remote URL
git remote set-url origin https://github.com/DeadSpeca/magnolia.git
```

### Can't push after rename

```bash
# Fetch latest changes
git fetch origin

# Set upstream branch
git branch --set-upstream-to=origin/master master
```

### Want to undo the rename

On GitHub:
1. Go to Settings
2. Change repository name back to "reader"
3. Update local remote URL back to old URL

---

**Ready to rename? Follow the steps above!** 🚀

