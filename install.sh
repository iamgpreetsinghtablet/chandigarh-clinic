#!/data/data/com.termux/files/usr/bin/bash

# Chandigarh Clinic Patients - Termux One-Click Installer
# This script installs Node.js, sets up the app, and starts the server.

echo -e "\n\e[1;34m================================================\e[0m"
echo -e "\e[1;32m   Installing Chandigarh Clinic Patients App    \e[0m"
echo -e "\e[1;34m================================================\e[0m\n"

# 1. Update system and install required tools
echo -e "\e[1;33m[1/4] Updating Termux packages...\e[0m"
apt update -y

echo -e "\e[1;33m[2/4] Installing Node.js (this might take a minute)...\e[0m"
apt install -y nodejs

# 2. Install app dependencies
echo -e "\e[1;33m[3/4] Installing application dependencies...\e[0m"
npm install

# 3. Build the app for production
echo -e "\e[1;33m[4/4] Building the app for production...\e[0m"
npm run build

# 4. Install serve globally to host the static files
echo -e "\e[1;33m[*] Setting up local server...\e[0m"
npm install -g serve

echo -e "\n\e[1;32m================================================\e[0m"
echo -e "\e[1;32m             INSTALLATION COMPLETE!             \e[0m"
echo -e "\e[1;32m================================================\e[0m\n"

echo -e "You can now access your app from your browser at: \e[1;36mhttp://localhost:5173\e[0m"
echo -e "To stop the server, press \e[1;31mCTRL + C\e[0m."
echo -e "\n\e[1;33mStarting the app now...\e[0m"

# Serve the production build on port 5173
serve -s dist -l 5173
