# Production Deployment Guide

This guide shows how to deploy the MCCOD React app in production with your FastAPI proxy service.

## 🏗️ Architecture Overview

```
Production Server (192.168.1.155)
├── FastAPI Proxy Service (Port 5001) ✅ CORS enabled
├── ICD-API Service (Port 8382)
├── MCCOD React App (Port 80/443 or static files)
└── Tablets connect to: http://192.168.1.155:5001
```

## 🚀 Option 1: FastAPI + Static Files (Recommended)

Serve your React app directly from your FastAPI service:

### Step 1: Modify Your FastAPI Service

```python
import requests
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import uvicorn
from typing import Optional, Dict, Any
import json

# Set up logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="DHIS2 Proxy API")

# Add CORS middleware (you already have this!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your existing DHIS2 configuration
REMOTE_URL = "https://migration-dhis.sante.gov.bf"
USERNAME = 'admin_simon'
PASSWORD = 'Admin@1234'
AUTH = (USERNAME, PASSWORD)

# ✨ NEW: Serve React app static files
app.mount("/static", StaticFiles(directory="dist"), name="static")

# ✨ NEW: Serve React app at root for any non-API routes
@app.get("/{path:path}")
async def serve_react_app(path: str):
    """Serve the React app for any route that doesn't match /api/"""
    if path.startswith("api/"):
        # Let API routes pass through to the proxy handler
        return
    
    # Serve index.html for all other routes (React Router)
    return FileResponse('dist/index.html')

# Your existing API proxy routes
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(path: str, request: Request):
    """Your existing proxy function - unchanged"""
    # ... your existing proxy code ...

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=False)
```

### Step 2: Build and Deploy React App

```bash
# 1. Build the React app
npm run build

# 2. Copy dist folder to your FastAPI server directory
# The dist folder should be in the same directory as your FastAPI main.py

# 3. Install additional FastAPI dependency
pip install python-multipart

# 4. Start your FastAPI service
python main.py
```

### Step 3: Access Your App

- **React App**: `http://192.168.1.155:5001`
- **API Endpoints**: `http://192.168.1.155:5001/api/...`
- **Tablets**: Can access everything from the same origin (no CORS issues!)

---

## 🌐 Option 2: Separate Web Server (Alternative)

Host React app on a separate web server:

### Using Nginx

```nginx
server {
    listen 80;
    server_name 192.168.1.155;

    # Serve React app
    location / {
        root /var/www/mccod/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to FastAPI
    location /api/ {
        proxy_pass http://localhost:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy ICD-API calls
    location /icd-api/ {
        proxy_pass http://localhost:8382/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Apache

```apache
<VirtualHost *:80>
    ServerName 192.168.1.155
    DocumentRoot /var/www/mccod/dist

    # Serve React app
    <Directory /var/www/mccod/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API calls
    ProxyPass /api/ http://localhost:5001/
    ProxyPassReverse /api/ http://localhost:5001/
    
    # Proxy ICD-API calls  
    ProxyPass /icd-api/ http://localhost:8382/
    ProxyPassReverse /icd-api/ http://localhost:8382/
</VirtualHost>
```

---

## 📱 Option 3: Docker Deployment

Create a complete containerized solution:

### Dockerfile for React App
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  mccod-app:
    build: .
    ports:
      - "80:80"
    depends_on:
      - proxy-service

  proxy-service:
    build: ./proxy
    ports:
      - "5001:5001"
    environment:
      - DHIS2_URL=https://migration-dhis.sante.gov.bf
      - USERNAME=admin_simon
      - PASSWORD=Admin@1234

  icd-api:
    # Your ICD-API service configuration
    ports:
      - "8382:8382"
```

---

## 🔧 Configuration Updates for Production

### Update Service URLs for Production

Your React app is already configured correctly! It will:

1. **Development**: Use proxy URLs (`/icd-api/ct`, `/proxy-api/api/`)
2. **Production**: Use direct URLs (`http://serverip:8382/ct`, `http://serverip:5001/api/`)

### Test Production Build Locally

```bash
# 1. Build the app
npm run build

# 2. Test with a simple HTTP server
npx serve dist -p 3000

# 3. Test with tablet mode
http://localhost:3000/?device=tablet
```

---

## 🛡️ Security Considerations for Production

### 1. Restrict CORS Origins
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.1.155",
        "http://192.168.1.155:5001", 
        "https://your-domain.com"
    ],  # ✅ More restrictive
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 2. Add HTTPS
```python
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=5001,
        ssl_keyfile="path/to/key.pem",
        ssl_certfile="path/to/cert.pem"
    )
```

### 3. Environment Variables
```python
import os

REMOTE_URL = os.getenv("DHIS2_URL", "https://migration-dhis.sante.gov.bf")
USERNAME = os.getenv("DHIS2_USERNAME", "admin_simon")
PASSWORD = os.getenv("DHIS2_PASSWORD", "Admin@1234")
```

---

## 🎯 Recommended Production Setup

**For your use case, I recommend Option 1 (FastAPI + Static Files):**

1. ✅ **Simple deployment** - everything in one service
2. ✅ **No CORS issues** - same origin for everything  
3. ✅ **Your FastAPI already configured correctly**
4. ✅ **Easy to maintain** - single service to manage

Just add the static file serving to your existing FastAPI service and you're ready to go! 🚀 