#!/bin/bash

set -e  # exit on any error
cd /home/clove/butterfly-network-websites

echo "[$(date)] Pulling latest changes..."

# Ensure we're on the right branch (adjust 'main' if different)
git checkout main

# Pull with rebase to keep history cleaner
git pull --rebase origin main

echo "[$(date)] Update complete."
