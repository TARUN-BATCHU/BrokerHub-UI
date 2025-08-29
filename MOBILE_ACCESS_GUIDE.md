# Mobile Access Setup Guide

## Problem
The React frontend works perfectly on the laptop but fails when accessed from mobile devices on the same network because API endpoints were hardcoded to `localhost:8080`.

## Solution
Updated the API configuration to use environment variables and your laptop's network IP address.

## Your Network Configuration
- **Laptop IP Address**: `192.168.0.104`
- **Backend Port**: `8080`
- **Frontend Port**: `3000`

## How to Start the App

### For Mobile Access (External Devices)
```bash
# Option 1: Use npm script
npm run start:mobile

# Option 2: Use batch file
start-mobile.bat

# Option 3: Manual command
set REACT_APP_API_URL=http://192.168.0.104:8080/BrokerHub && set HOST=0.0.0.0 && npm start
```

### For Local Development (Laptop Only)
```bash
# Option 1: Use npm script
npm run start:local

# Option 2: Use batch file
start-local.bat

# Option 3: Regular start (will use .env.development)
npm start
```

## Access URLs

### From Laptop
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080/BrokerHub

### From Mobile/Other Devices
- **Frontend**: http://192.168.0.104:3000
- **Backend**: http://192.168.0.104:8080/BrokerHub

## Environment Files Created

1. **`.env.development`** - Uses network IP for mobile access
2. **`.env.local`** - Uses localhost for local development
3. **`.env.production`** - For production deployment

## Troubleshooting

### If Mobile Still Can't Access:

1. **Check Windows Firewall**:
   - Allow Node.js through Windows Firewall
   - Allow port 3000 and 8080

2. **Verify Network Connection**:
   - Ensure mobile device is on the same WiFi network
   - Test by pinging: `ping 192.168.0.104` from mobile

3. **Check Backend Server**:
   - Ensure your backend is running on `0.0.0.0:8080` not just `localhost:8080`
   - Backend should accept connections from any IP, not just localhost

4. **Update IP Address**:
   - If your laptop's IP changes, update the `.env.development` file
   - Run `ipconfig` to get current IP address

### Common Commands

```bash
# Get current IP address
ipconfig

# Start with mobile access
npm run start:mobile

# Start with local access
npm run start:local

# Check if ports are open
netstat -an | findstr :3000
netstat -an | findstr :8080
```

## Files Modified

1. `src/services/api.js` - Updated to use environment variables
2. `package.json` - Added mobile and local start scripts
3. `.env.development` - Network IP configuration
4. `.env.local` - Localhost configuration

## Next Steps

1. Start your backend server ensuring it binds to `0.0.0.0:8080`
2. Use `npm run start:mobile` to start the frontend
3. Access from mobile using `http://192.168.0.104:3000`
4. Test login functionality from mobile device