#!/bin/bash
# Script to create GitHub repo and push code

echo "Creating GitHub repository 'bodyapp'..."

# Check if repo already exists
if curl -s -o /dev/null -w "%{http_code}" https://api.github.com/repos/ghazalehmirzaee/bodyapp | grep -q "200"; then
    echo "Repository already exists. Pushing code..."
    git push -u origin main
else
    echo "Repository does not exist. Please create it manually:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: bodyapp"
    echo "3. Description: Real-time body composition scanner with pose detection"
    echo "4. Choose Public or Private"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run this script again, or run:"
    echo "  git push -u origin main"
fi

