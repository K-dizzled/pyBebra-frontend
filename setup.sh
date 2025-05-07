#!/bin/bash
set -e

echo "📦 Installing NVM as root..."
export NVM_DIR="/root/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="/root/.nvm"
source "$NVM_DIR/nvm.sh"
source "$NVM_DIR/bash_completion"

echo "📦 Installing Node.js LTS..."
nvm install --lts
nvm use --lts

echo "📦 Installing pm2 globally..."
npm install -g pm2

echo "📂 Entering project..."

echo "📦 Installing deps..."
npm install

echo "🏗️ Building..."
npm run build

echo "🚀 Starting with pm2..."
pm2 start npm --name next-app -- run start
pm2 startup systemd -u root
pm2 save

echo "✅ Running at http://<your-server-ip>:3000"
