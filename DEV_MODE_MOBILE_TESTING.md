# 📱 Testing React App from Phone (Development Mode)

## Problem
When running `npm start` (localhost:3000), you can't access it from your phone because:
1. React dev server runs on localhost:3000 (only accessible from your PC)
2. API calls need to reach your backend at localhost:8080

## ✅ Solution - 2 Options

### Option 1: Quick Test (Recommended for Testing)
Use the mobile script with your actual IP:

**Step 1:** Find your PC's IP address
```bash
ipconfig
# Look for IPv4 Address, e.g., 192.168.1.100
```

**Step 2:** Update the IP in package.json
Edit `package.json` and update the `start:mobile` script:
```json
"start:mobile": "cross-env REACT_APP_API_URL=http://YOUR_IP:8080/BrokerHub HOST=0.0.0.0 react-scripts start"
```
Replace `YOUR_IP` with your actual IP (e.g., 192.168.1.100)

**Step 3:** Run the mobile script
```bash
npm run start:mobile
```

**Step 4:** Access from phone
Open on your phone: `http://YOUR_IP:3000`

---

### Option 2: Use Proxy (Better for Development)

I've already added `"proxy": "http://localhost:8080"` to package.json.

**For localhost testing:**
```bash
npm start
# Access: http://localhost:3000
```

**For mobile testing:**
1. Find your IP: `ipconfig`
2. Edit `.env.development` and uncomment:
   ```
   REACT_APP_API_URL=http://192.168.1.100:8080/BrokerHub
   ```
3. Run with HOST binding:
   ```bash
   cross-env HOST=0.0.0.0 npm start
   ```
4. Access from phone: `http://YOUR_IP:3000`

---

## 🔧 Current Setup Explanation

### What We Fixed:
1. ✅ Added `"proxy": "http://localhost:8080"` to package.json
2. ✅ Changed API URLs from `http://localhost:8080/BrokerHub` to `/BrokerHub`
3. ✅ Created `.env.development` for easy configuration

### How It Works:

**On PC (localhost:3000):**
- React app runs on port 3000
- API call to `/BrokerHub/Broker/login`
- Proxy forwards to `http://localhost:8080/BrokerHub/Broker/login`
- ✅ Works!

**On Phone (192.168.1.100:3000):**
- React app runs on your PC's IP:3000
- API call to `/BrokerHub/Broker/login`
- Browser tries `http://192.168.1.100:3000/BrokerHub/Broker/login`
- ❌ Fails! (React dev server doesn't have this endpoint)

**Solution for Phone:**
- Set `REACT_APP_API_URL=http://192.168.1.100:8080/BrokerHub`
- API call uses full URL
- Goes directly to backend
- ✅ Works!

---

## 🚀 Quick Commands

### Test on PC only:
```bash
npm start
# Access: http://localhost:3000
```

### Test from phone (after updating IP in package.json):
```bash
npm run start:mobile
# Access from phone: http://YOUR_IP:3000
```

### Test from phone (manual):
```bash
# Windows
set REACT_APP_API_URL=http://192.168.1.100:8080/BrokerHub
set HOST=0.0.0.0
npm start

# Or use cross-env
cross-env REACT_APP_API_URL=http://192.168.1.100:8080/BrokerHub HOST=0.0.0.0 npm start
```

---

## 🐛 Troubleshooting

### Issue: "Cannot access from phone"
**Check:**
1. Is React dev server running with `HOST=0.0.0.0`?
2. Is Windows Firewall blocking port 3000?
3. Are both devices on same Wi-Fi?

**Fix Firewall:**
```bash
netsh advfirewall firewall add rule name="React Dev Server" dir=in action=allow protocol=TCP localport=3000
```

### Issue: "API calls fail from phone"
**Check:**
1. Is `REACT_APP_API_URL` set to your PC's IP?
2. Is backend running on port 8080?
3. Is Windows Firewall blocking port 8080?

**Fix:**
```bash
netsh advfirewall firewall add rule name="Spring Boot" dir=in action=allow protocol=TCP localport=8080
```

### Issue: "Login works on PC but not phone"
**Cause:** Using proxy on PC, but phone needs direct backend URL

**Fix:** Set environment variable:
```bash
cross-env REACT_APP_API_URL=http://YOUR_IP:8080/BrokerHub HOST=0.0.0.0 npm start
```

---

## 📝 Production Build (For Final Deployment)

When ready to deploy:

```bash
# Build the app
npm run build

# Copy build/* to Spring Boot src/main/resources/static/

# Restart Spring Boot

# Access from anywhere: http://YOUR_IP:8080
```

In production, relative URLs work perfectly because React and backend are served from the same origin!

---

## 🎯 Summary

| Scenario | Command | Access URL | API URL |
|----------|---------|------------|---------|
| PC Development | `npm start` | `http://localhost:3000` | Proxied to `localhost:8080` |
| Phone Testing | `npm run start:mobile` | `http://YOUR_IP:3000` | Direct to `YOUR_IP:8080` |
| Production | `npm run build` | `http://YOUR_IP:8080` | Relative URLs (same origin) |

**Key Point:** Development mode needs special handling for cross-device testing. Production build works seamlessly!
