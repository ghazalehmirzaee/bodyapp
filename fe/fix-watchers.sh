#!/bin/bash
# Fix file watcher limit for Next.js development
# Run this script before starting the dev server if you encounter ENOSPC errors

echo "Current file watcher limit:"
cat /proc/sys/fs/inotify/max_user_watches

echo ""
echo "Increasing file watcher limit to 524288..."
sudo sysctl -w fs.inotify.max_user_watches=524288

echo ""
echo "To make this permanent, add the following to /etc/sysctl.conf:"
echo "fs.inotify.max_user_watches=524288"

