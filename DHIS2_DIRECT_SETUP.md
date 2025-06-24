# 🚀 DHIS2 Direct Integration for Tablet Mode

## Overview
When running in tablet mode, the app can now make direct requests to your DHIS2 server through Vite's proxy, bypassing your FastAPI proxy service. This provides better performance and simpler configuration for tablet deployments.

## 🔄 How It Works

### **Desktop/Laptop Mode (Default)**
```
React App → FastAPI Proxy → DHIS2 Server
```
- Uses your existing FastAPI proxy service on port 5001
- All authentication handled by your FastAPI service

### **Tablet Mode (New Direct Integration)**
```
React App → Vite Proxy → DHIS2 Server (Direct)
```
- Bypasses FastAPI proxy entirely
- Vite development server proxies requests directly to DHIS2
- Authentication handled by Vite proxy configuration

## ⚙️ Setup Instructions

### 1. Configure DHIS2 Credentials

Edit `src/config/dhis2.config.ts` and replace the placeholder credentials:

```typescript
export const DHIS2_CONFIG = {
  baseUrl: 'https://migration-dhis.sante.gov.bf',
  auth: {
    username: 'your_actual_dhis2_username', // Replace this
    password: 'your_actual_dhis2_password', // Replace this
  },
  // ... rest of config
};
```

### 2. Update Vite Proxy Configurations

#### In `vite.config.ts` (for regular development):
```typescript
'/dhis2-direct': {
  target: 'https://migration-dhis.sante.gov.bf',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/dhis2-direct/, ''),
  secure: true,
  headers: {
    'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64'),
    'Content-Type': 'application/json'
  }
}
```

#### In `vite.config.tablet.ts` (for tablet mode):
```typescript
'/dhis2-direct': {
  target: 'https://migration-dhis.sante.gov.bf',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/dhis2-direct/, ''),
  secure: true,
  headers: {
    'Authorization': 'Basic ' + btoa('username:password'),
    'Content-Type': 'application/json'
  }
}
```

**Replace `username:password` with your actual DHIS2 credentials in both files.**

### 3. Test the Setup

#### For Desktop Mode (uses FastAPI proxy):
```bash
npm run dev
# Access: http://localhost:5173/
# Device shows as: "desktop" or "laptop"
# DHIS2 requests go through: FastAPI proxy
```

#### For Tablet Mode (direct DHIS2):
```bash
npm run dev:tablet
# Access: http://192.168.1.155:5173/
# Or add ?device=tablet to force tablet mode
# Device shows as: "tablet"
# DHIS2 requests go directly to: DHIS2 server
```

## 🔍 How to Verify It's Working

### 1. Check Console Logs
Look for these messages in browser console:

```
ServiceConfigManager: Updated server IP: 192.168.1.155 Direct mode: true
[DHIS2] Using direct mode: /dhis2-direct/api/32/events
```

### 2. Network Tab
In browser DevTools → Network tab, look for requests to:
- **Tablet mode**: `/dhis2-direct/api/32/events`
- **Desktop mode**: `http://localhost:5001/api/32/events`

### 3. Header Display
The app header should show:
- **Device**: tablet (when in tablet mode)
- **Server**: 192.168.1.155 (or your network IP)

## 🛠️ Troubleshooting

### **DHIS2 Authentication Errors**
- Verify credentials in both `vite.config.ts` and `vite.config.tablet.ts`
- Test credentials manually: `curl -u username:password https://migration-dhis.sante.gov.bf/api/32/events`

### **CORS Errors**
- The Vite proxy should handle CORS automatically
- If still getting CORS errors, check DHIS2 server configuration

### **Device Not Detected as Tablet**
- Add `?device=tablet` to URL: `http://192.168.1.155:5173/?device=tablet`
- Check browser console for device detection logs

### **Proxy Not Working**
- Ensure you're using the correct Vite config: `npm run dev:tablet`
- Check that the target DHIS2 server is accessible from your network

## 🚨 Security Considerations

### **Development vs Production**
- **Development**: Vite proxy handles authentication
- **Production**: Build static files and serve via FastAPI or web server

### **Credential Management**
- Never commit real credentials to version control
- Use environment variables in production:
  ```typescript
  username: process.env.DHIS2_USERNAME || 'fallback_username'
  password: process.env.DHIS2_PASSWORD || 'fallback_password'
  ```

### **Network Security**
- Direct DHIS2 access only works on private networks (192.168.x.x)
- Public network detection will block tablet mode automatically

## 📱 Usage Workflow

### **For Tablet Deployment:**

1. **Connect to private network** (192.168.x.x)
2. **Start tablet mode**: `npm run dev:tablet`
3. **Access on tablet**: `http://192.168.1.155:5173/`
4. **Verify tablet mode**: Header shows "Device: tablet"
5. **Test DHIS2 sync**: Use "Sync with DHIS2" button

### **Automatic Mode Detection:**
- **Laptop**: Always uses FastAPI proxy (localhost)
- **Tablet**: Uses direct DHIS2 (network IP + Vite proxy)
- **Public Network**: Tablet mode disabled for security

## 🔧 Advanced Configuration

### **Custom DHIS2 Server**
To point to a different DHIS2 server, update:
```typescript
// In src/config/dhis2.config.ts
baseUrl: 'https://your-dhis2-server.com'

// In both vite.config.ts files
target: 'https://your-dhis2-server.com'
```

### **Different API Version**
To use a different DHIS2 API version:
```typescript
// In src/config/dhis2.config.ts
endpoints: {
  events: '/api/40/events', // Changed from 32 to 40
}
```

## 📊 Performance Benefits

**Direct Mode (Tablet) vs Proxy Mode (Desktop):**
- ⚡ **Faster**: One less network hop
- 🔧 **Simpler**: No FastAPI dependency for DHIS2 
- 📱 **Optimized**: Designed for mobile/tablet performance
- 🛡️ **Secure**: Authentication handled by Vite proxy

---

**Ready to test!** Start with `npm run dev:tablet` and access via your network IP. 🚀 