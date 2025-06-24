# Network Setup Guide for Tablet Usage

This guide explains how to configure the MCCOD app to work on tablets/mobile devices when the ICD-API and Proxy services are running on another computer in the same network.

## 🎯 Use Case

When you want to use the MCCOD app on a tablet, but the ICD-API and Proxy services are running on a desktop/laptop computer in the same WiFi network.

## 🏗️ Architecture

```
Desktop/Laptop Computer (Server)
├── ICD-API Service (Port 8382)
├── Proxy Service (Port 5001)
└── WiFi Network: 192.168.1.100

Tablet/Mobile Device (Client)
├── MCCOD React App
├── WiFi Network: 192.168.1.xxx
└── Connects to: 192.168.1.100:8382 & 192.168.1.100:5001
```

## 📋 Prerequisites

### On the Server Computer (Desktop/Laptop):
1. **ICD-API service** running on port 8382
2. **Proxy service** running on port 5001
3. **Same WiFi network** as the tablet
4. **Firewall configured** to allow incoming connections on ports 8382 and 5001

### On the Client Device (Tablet):
1. **Same WiFi network** as the server
2. **MCCOD app** loaded in a web browser

## 🔧 Setup Steps

### Step 1: Prepare the Server Computer

1. **Start the required services:**
   ```bash
   # Start ICD-API on port 8382
   # Start Proxy service on port 5001
   ```

2. **Find the server's IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```
   Look for the local network IP (usually 192.168.x.x or 10.0.x.x)

3. **Configure Windows Firewall (if needed):**
   - Open Windows Defender Firewall
   - Allow apps through firewall
   - Add exceptions for ports 8382 and 5001
   - Or temporarily disable firewall for testing

### Step 2: Configure the Tablet App

1. **Open the MCCOD app** on your tablet's web browser

2. **The app will automatically detect it's running on a tablet** and show a **"🌐 Server Settings"** panel in the top-right corner

3. **Click on the Server Settings panel** to expand it

4. **Configure the server IP:**
   - Enter the server computer's IP address (e.g., `192.168.1.100`)
   - Or click on one of the suggested common IPs to test them
   - Click **"Test Connection"** to verify connectivity
   - Click **"Save"** when the connection test succeeds

## 🔍 Features

### Automatic Device Detection
- **Laptop/Desktop**: Uses `localhost` for services
- **Tablet/Mobile**: Shows server configuration panel and uses network IP

### Server Settings Panel (Tablet Only)
- **IP Address Input**: Manual entry of server IP
- **Connection Testing**: Test connectivity before saving
- **Common IP Suggestions**: Quick-test common network IPs
- **Real-time Status**: Shows current server being used in header

### Service Integration
All network-dependent services automatically use the configured IP:
- **ICD-API calls** (port 8382) - for cause of death coding
- **Proxy service calls** (port 5001) - for DHIS2 sync
- **Service status monitoring** - real-time connection status

### Persistent Configuration
- Settings are **saved to browser storage**
- Configuration **persists across app restarts**
- Each device can have **independent server settings**

## 🌐 Network Configuration Examples

### Home Network (192.168.1.x)
```
Router: 192.168.1.1
Server: 192.168.1.100
Tablet: 192.168.1.105
Services: http://192.168.1.100:8382 & http://192.168.1.100:5001
```

### Office Network (10.0.x.x)
```
Router: 10.0.0.1
Server: 10.0.0.50
Tablet: 10.0.0.75
Services: http://10.0.0.50:8382 & http://10.0.0.50:5001
```

## 🔧 Troubleshooting

### Connection Issues

1. **"Connection failed" errors:**
   - Verify both devices are on the same WiFi network
   - Check if services are running on the server
   - Test with firewall temporarily disabled
   - Try pinging the server from tablet: `ping 192.168.1.100`

2. **Services show "Stopped":**
   - Verify ICD-API is running on port 8382
   - Verify Proxy service is running on port 5001
   - Check Windows Firewall settings
   - Ensure no other applications are using these ports

3. **Can't find server IP:**
   - On Windows: Run `ipconfig` in Command Prompt
   - Look for "IPv4 Address" under your network adapter
   - Common ranges: 192.168.1.x, 192.168.0.x, 10.0.x.x

### Network Discovery

1. **Find all devices on network:**
   ```bash
   # Windows
   arp -a
   
   # Or use network scanner apps on mobile
   ```

2. **Test port connectivity:**
   ```bash
   # Test if port is open (from another computer)
   telnet 192.168.1.100 8382
   telnet 192.168.1.100 5001
   ```

## 🔒 Security Considerations

### Network Security
- Ensure you're on a **trusted WiFi network**
- Consider using **WPA3 encryption** on your WiFi
- **Don't use on public WiFi** without VPN

### Firewall Configuration
- Only open required ports (8382, 5001)
- Consider **IP range restrictions** if possible
- **Close ports** when not needed

### Access Control
- Services should have **authentication** if possible
- Consider **VPN access** for remote usage
- **Monitor access logs** for unusual activity

## 📱 Usage Tips

### For Optimal Performance
- Keep **tablet and server on same network**
- Use **5GHz WiFi** for better performance
- Ensure **stable WiFi connection**
- Test connectivity before important data entry

### Data Management
- **Save work frequently** (auto-save enabled)
- Sync data when **connectivity is good**
- **Check sync status** in the header regularly

### Multi-Device Setup
- **Each tablet can have different server settings**
- **Multiple tablets can connect to same server**
- **Configure each device independently**

## 🆘 Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify network connectivity** between devices
3. **Test with different IP addresses**
4. **Temporarily disable firewall** for testing
5. **Check service logs** on the server computer

The app includes real-time connection status monitoring in the header, so you can always see if services are reachable. 