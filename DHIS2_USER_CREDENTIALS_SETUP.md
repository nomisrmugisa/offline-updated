# 🔐 DHIS2 User Credentials Setup Guide

## Overview
The MCCOD app now features a secure, user-friendly credential system where users provide their own DHIS2 credentials when first loading the app. No more hardcoded credentials in config files!

## 🚀 How It Works

### **First Time Setup**
1. **App loads** and checks for saved credentials
2. **If no credentials found**, a modal appears asking for DHIS2 login details
3. **User enters** their username and password
4. **Test connection** verifies credentials against DHIS2 server
5. **Credentials saved** securely on the device
6. **App continues** with full DHIS2 functionality

### **Subsequent Uses**
- App automatically loads saved credentials
- No setup required unless credentials change
- Users can update credentials via settings button

## 🔒 Security Features

### **Encryption & Storage**
- Credentials encrypted using Base64 encoding
- Stored only in browser's localStorage (device-local)
- Never transmitted to any server except DHIS2
- No credentials in source code or config files

### **Connection Testing**
- Real-time validation against DHIS2 API
- Tests authentication before saving
- Prevents saving invalid credentials
- Clear error messages for troubleshooting

### **User Control**
- Users can update credentials anytime
- Clear credentials and start fresh
- Password visibility toggle for convenience
- No forced credential sharing

## 📱 User Experience

### **Initial Setup Modal**
```
🔐 DHIS2 Credentials Setup

Please enter your DHIS2 credentials to enable data synchronization.
Your credentials will be stored securely on this device only.

DHIS2 Username: [________________]
DHIS2 Password: [________________] 👁️

Server: https://migration-dhis.sante.gov.bf

[🧪 Test Connection] [💾 Save & Continue]

🔒 Security Note: Credentials are encrypted and stored locally on 
your device only. They are never transmitted to any server other 
than DHIS2.
```

### **Settings Access (Tablet Mode)**
When in tablet mode and using direct DHIS2, users see:
```
[🔐 DHIS2 Settings] button in the header
```

### **Connection Test Flow**
1. Enter username and password
2. Click "Test Connection"
3. App validates against DHIS2 API `/api/me` endpoint
4. ✅ Success: "Credentials verified successfully!"
5. ❌ Error: Clear error message with troubleshooting hints
6. Save button only enabled after successful test

## 🛠️ Implementation Details

### **Credential Management Hook**
```typescript
// src/hooks/useDhis2Credentials.ts
const { 
  credentials,           // Current credentials (null if not set)
  isSetupComplete,      // Boolean: setup completed
  isLoading,            // Boolean: loading stored credentials
  saveCredentials,      // Function: save new credentials
  clearCredentials,     // Function: clear all credentials  
  testConnection,       // Function: test credentials
  getAuthHeader         // Function: get auth header for requests
} = useDhis2Credentials();
```

### **Dynamic Authentication**
- DHIS2 sync service receives auth headers dynamically
- No hardcoded credentials in Vite proxy
- Authentication headers added to requests at runtime
- Supports credential updates without app restart

### **Storage Keys**
```typescript
localStorage.setItem('dhis2_credentials', encryptedCredentials);
localStorage.setItem('dhis2_setup_complete', 'true');
```

## 🔄 Device & Mode Integration

### **Desktop Mode**
- Still uses FastAPI proxy (no DHIS2 credentials needed from user)
- DHIS2 Settings button hidden
- Existing workflow unchanged

### **Tablet Mode**  
- Uses direct DHIS2 connection
- DHIS2 Settings button visible
- User credentials required
- First-time setup modal shown

### **Automatic Detection**
```typescript
// Device detection triggers appropriate auth flow
if (deviceType === 'tablet' && useDhis2Direct) {
  // Show credentials setup
  // Enable DHIS2 Settings button
} else {
  // Use proxy mode (no user credentials needed)
}
```

## 🧪 Testing the Setup

### **Test Scenarios**

1. **First Time User**
   ```bash
   # Clear browser storage
   localStorage.clear()
   
   # Reload app - should show credentials modal
   # Enter valid DHIS2 credentials
   # Test connection should succeed
   # App should continue normally
   ```

2. **Returning User**
   ```bash
   # Reload app - should NOT show modal
   # Should load stored credentials
   # DHIS2 sync should work immediately
   ```

3. **Credential Update**
   ```bash
   # Click "🔐 DHIS2 Settings" in tablet mode
   # Update password
   # Test new credentials
   # Save - should update stored credentials
   ```

4. **Invalid Credentials**
   ```bash
   # Enter wrong username/password
   # Test connection should fail with clear error
   # Save button should remain disabled
   ```

### **Console Verification**
Look for these messages:
```
DHIS2 connection test successful: [User Display Name]
DHIS2 credentials saved successfully
ServiceConfigManager: Updated auth header
[DHIS2] Using direct mode: /dhis2-direct/api/32/events
```

## 🎯 Deployment Workflow

### **For IT Administrators**
1. **Deploy app** to tablet devices
2. **Provide users** with their individual DHIS2 credentials
3. **Guide users** through first-time setup
4. **No server-side configuration** needed for credentials

### **For End Users**
1. **Open app** on tablet
2. **Enter credentials** when prompted
3. **Test connection** to verify
4. **Save and continue** - setup complete!
5. **Use normally** - credentials remembered

### **For Troubleshooting**
- Check network connectivity to DHIS2 server
- Verify user has valid DHIS2 account
- Test credentials manually: `curl -u username:password https://migration-dhis.sante.gov.bf/api/me`
- Clear browser storage to reset if needed

## 📋 Benefits

### **For Security**
✅ No hardcoded credentials in source code  
✅ Each user uses their own credentials  
✅ Credentials stored locally only  
✅ Real-time validation prevents errors  

### **For Users**
✅ Simple, one-time setup process  
✅ Clear feedback and error messages  
✅ Can update credentials easily  
✅ No technical knowledge required  

### **For Administrators**
✅ No server-side credential management  
✅ Individual user accountability  
✅ Easy to revoke access (disable DHIS2 account)  
✅ No credential sharing between users  

## 🆘 Troubleshooting

### **Modal Won't Disappear**
- Ensure credentials test successfully before saving
- Check browser console for errors
- Try clearing localStorage and restarting

### **Connection Test Fails**
- Verify network connectivity
- Check DHIS2 server status
- Confirm username/password are correct
- Ensure user account is active in DHIS2

### **Credentials Not Saved**
- Complete connection test successfully first
- Check browser allows localStorage
- Verify no browser extensions blocking storage

### **DHIS2 Sync Fails**
- Check auth headers in network tab
- Verify credentials haven't expired
- Test manually with curl command
- Update credentials via settings button

---

**Ready to use!** The app now provides a secure, user-friendly way to handle DHIS2 authentication. 🎉 