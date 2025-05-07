#!/bin/bash

set -e

echo "🔧 Updating system..."
sudo apt update
sudo apt install -y curl git build-essential

echo "📦 Installing NVM..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

echo "📦 Installing Node.js LTS with NVM..."
nvm install --lts
nvm use --lts

echo "📦 Installing pm2 globally..."
npm install -g pm2

echo "📂 Entering your project directory..."

echo "📦 Installing project dependencies..."
npm install

echo "🏗️ Building Next.js app..."
npm run build

echo "🚀 Starting app with pm2..."
pm2 start npm --name next-app -- run start

echo "💾 Saving pm2 startup config..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save

echo "✅ Setup complete. Your app should be running at http://<server-ip>:3000"
