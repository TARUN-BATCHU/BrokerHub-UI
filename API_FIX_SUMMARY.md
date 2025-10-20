# API URL Fix - Cross-Device Compatibility

## Problem
When accessing the app from other devices on the same Wi-Fi network using `http://<server-ip>:8080`, the login page loaded but API calls failed because the frontend was making requests to `http://localhost:8080`, which refers to the device itself, not the server.

## Solution
Changed all hardcoded `localhost` URLs to **relative URLs** so the browser automatically uses the same host and port from which the app was loaded.

## Files Modified

### 1. `src/services/api.js`
**Before:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/BrokerHub';
```

**After:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || '/BrokerHub';
```

### 2. `src/services/paymentAPI.js`
**Before:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/BrokerHub';
```

**After:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || '/BrokerHub';
```

### 3. `src/components/MerchantDetailModal.js`
**Before:**
```javascript
const response = await fetch(`http://localhost:8080/BrokerHub/user/${merchantId}`, {
```

**After:**
```javascript
const response = await fetch(`/BrokerHub/user/${merchantId}`, {
```

### 4. `src/pages/BrokerageDashboard.js`
**Before:**
```javascript
console.log('Making API call to:', `http://localhost:8080/BrokerHub/Brokerage/summary/${yearId}`);
```

**After:**
```javascript
// Removed hardcoded localhost from console.log
```

### 5. `src/pages/PaymentDemo.js`
**Before:**
```javascript
<p>API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:8080/BrokerHub'}/payments</p>
```

**After:**
```javascript
<p>API Base URL: {process.env.REACT_APP_API_URL || '/BrokerHub'}/payments</p>
```

## How It Works

### Relative URLs
When you use a relative URL like `/BrokerHub/Broker/login`, the browser automatically constructs the full URL based on the current page's origin:

- **On localhost:** `http://localhost:8080` → API calls go to `http://localhost:8080/BrokerHub/...`
- **On phone (same Wi-Fi):** `http://192.168.1.100:8080` → API calls go to `http://192.168.1.100:8080/BrokerHub/...`
- **On production domain:** `https://yourdomain.com` → API calls go to `https://yourdomain.com/BrokerHub/...`

### Environment Variable Override
You can still override the API URL using the `REACT_APP_API_URL` environment variable if needed:

```bash
# .env file
REACT_APP_API_URL=http://192.168.1.100:8080/BrokerHub
```

## Testing

### 1. Rebuild the React app
```bash
npm run build
```

### 2. Copy build files to Spring Boot static folder
Copy the contents of the `build` folder to your Spring Boot project's `src/main/resources/static` directory.

### 3. Test from different devices
- **Localhost:** `http://localhost:8080`
- **Same Wi-Fi (phone/tablet):** `http://<your-local-ip>:8080`
- Find your local IP:
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`

### 4. Verify API calls work
- Login should work
- All API actions (create, read, update, delete) should work
- Check browser DevTools Network tab to confirm API calls are going to the correct host

## Additional Notes

### CORS Configuration (Backend)
If you still face CORS issues when accessing from IP instead of localhost, ensure your Spring Boot backend allows requests from all origins or specific IPs:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")  // Or specify: "http://192.168.1.100:8080"
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
```

### Firewall Settings
Ensure your firewall allows incoming connections on port 8080:
- Windows: Check Windows Defender Firewall
- Mac: System Preferences → Security & Privacy → Firewall
- Linux: Check iptables or ufw

## Benefits
✅ Works from any device on the same network  
✅ Works with any domain or IP address  
✅ No need to rebuild when deploying to different environments  
✅ Cleaner, more maintainable code  
✅ Production-ready approach
