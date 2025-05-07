#!/bin/bash

set -e

sudo apt update
sudo apt install -y curl git build-essential

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2

cd /path/to/your/project

npm install
npm run build

pm2 start npm --name next-app -- run start

pm2 startup
pm2 save

echo "✅ App deployed. Check it on http://<server-ip>:3000"
