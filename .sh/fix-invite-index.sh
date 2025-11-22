#!/bin/bash
# Script để fix invite_token index issue

echo "🚀 Running invite token index fix script..."
node --require @babel/register src/scripts/fix-invite-token-index.js
