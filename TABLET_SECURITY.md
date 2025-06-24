# 🔒 Tablet Mode Security Guide

## Overview
This guide explains how to securely run the MCCOD app on tablets while protecting against network-based attacks.

## 🚫 Security Risks of Development Servers on Public Networks

### Why `--host` is Dangerous on Public Networks:
- **No Authentication**: Anyone can access your development server
- **Development Features Exposed**: Source maps, hot reload endpoints, dev tools
- **File System Access**: Potential access to your project files
- **Open Proxy**: Vite proxy can be exploited to access internal services
- **No HTTPS**: Data transmitted in plain text

## ✅ Secure Deployment Options

### Option 1: Network-Restricted Vite (Recommended for Development)
```bash
# Only allow specific private network IP
npm run dev:tablet
```

**Features:**
- Binds only to your specific IP (192.168.1.155)
- Security headers enabled
- CSP (Content Security Policy) protection
- CORS restricted to known origins
- Network type detection

### Option 2: Production Build with Static Server
```bash
# Build and serve securely
npm run build
npx serve dist -l 5200 -s 192.168.1.155
```

### Option 3: FastAPI Integration (Most Secure)
Serve the React app directly from your FastAPI service:

```python
from fastapi.staticfiles import StaticFiles

# Add to your FastAPI app
app.mount("/", StaticFiles(directory="dist", html=True), name="static")
```

## 🛡️ Built-in Security Features

### Network Detection
The app automatically detects:
- **Localhost**: Full access, all features enabled
- **Private Network**: Tablet mode allowed with warnings
- **Public Network**: Tablet mode blocked, security warnings

### Device-Based Security
- **Laptop/Desktop**: Always uses localhost, ignores network settings
- **Tablet/Mobile**: Checks network security before enabling network features

### Security Headers (Tablet Mode)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: Restricted to private networks
```

## 🔧 Usage Instructions

### For Development Testing:
```bash
# Secure tablet mode (private network only)
npm run dev:tablet

# Regular development (localhost only)
npm run dev
```

### For Production:
```bash
# Build for production
npm run build

# Serve securely
npx serve dist -l 5200 --host 192.168.1.155
```

## ⚠️ Security Warnings

The app will show different warnings based on network detection:

- **🟢 Localhost**: No warnings
- **🟡 Private Network**: "Connected to private network - Tablet mode available"
- **🔴 Public Network**: "WARNING: Public network detected - Tablet mode disabled for security"

## 🚨 What NOT to Do

❌ **Never run these on public networks:**
```bash
npm run dev -- --host 0.0.0.0    # Exposes to ALL networks
npm run dev -- --host            # Same as above
vite --host                       # Dangerous
```

❌ **Never disable security features for convenience**

❌ **Never use development mode in production**

## 🎯 Best Practices

1. **Always use private networks** (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
2. **Use production builds** for tablet deployment
3. **Enable firewall** on the host machine
4. **Monitor network connections** regularly
5. **Use HTTPS** in production (certificate required)
6. **Regularly update dependencies** for security patches

## 🔍 Network Validation

The app includes automatic network validation:

```typescript
// Checks if current network is safe
isTabletModeAllowed() // Returns true only for private networks

// Gets current network type
getNetworkType() // 'localhost' | 'private' | 'public'
```

## 📱 Tablet Deployment Checklist

- [ ] Connected to private network (192.168.x.x)
- [ ] FastAPI proxy service running
- [ ] ICD-API service running
- [ ] Firewall configured properly
- [ ] Using production build or secure Vite config
- [ ] Network security warnings acknowledged
- [ ] Testing on tablet device completed

## 🆘 Emergency Procedures

If you suspect security compromise:

1. **Immediately stop** the development server
2. **Check network logs** for unauthorized access
3. **Rotate any exposed credentials**
4. **Switch to production deployment**
5. **Review firewall rules**

## 📞 Support

For security concerns or questions about tablet deployment, refer to:
- Network administrator
- IT security team
- This documentation

---

**Remember: Security is everyone's responsibility. When in doubt, choose the more secure option.** 