#!/bin/bash

# Add all changed files
git add .

# Ask for a commit message, or use a default one with the current date/time
echo "Enter commit message (or press enter for default):"
read message

if [ -z "$message" ]
then
    message="Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Commit the changes
git commit -m "$message"

# Push to GitHub
git push origin main

echo "✅ Successfully pushed to GitHub!"
