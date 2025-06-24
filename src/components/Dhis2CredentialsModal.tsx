import React, { useState, useEffect } from 'react';
import './FormHeader.css';

interface Dhis2CredentialsModalProps {
  isOpen: boolean;
  onSave: (credentials: { username: string; password: string }) => void;
  onTest: (credentials: { username: string; password: string }) => Promise<boolean>;
}

const Dhis2CredentialsModal: React.FC<Dhis2CredentialsModalProps> = ({
  isOpen,
  onSave,
  onTest,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load saved credentials if they exist
    const saved = localStorage.getItem('dhis2_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUsername(parsed.username || '');
        // Don't pre-fill password for security
      } catch (error) {
        console.error('Failed to parse saved credentials:', error);
      }
    }
  }, []);

  const handleTest = async () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      setTestResult('error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const isValid = await onTest({ username, password });
      setTestResult(isValid ? 'success' : 'error');
      setErrorMessage(isValid ? '' : 'Invalid credentials or connection failed');
    } catch {
      setTestResult('error');
      setErrorMessage('Connection test failed. Please check your network and credentials.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      setTestResult('error');
      return;
    }

    if (testResult !== 'success') {
      setErrorMessage('Please test your credentials before saving');
      return;
    }

    onSave({ username, password });
  };

  const togglePasswordVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>
          🔐 DHIS2 Credentials Setup
        </h2>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please enter your DHIS2 credentials to enable data synchronization. 
          Your credentials will be stored securely on this device only.
        </p>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            DHIS2 Username:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your DHIS2 username"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            DHIS2 Password:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={isVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your DHIS2 password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isVisible ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
            <strong>Server:</strong> https://migration-dhis.sante.gov.bf
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            ❌ {errorMessage}
          </div>
        )}

        {testResult === 'success' && (
          <div style={{
            backgroundColor: '#efe',
            color: '#393',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            ✅ Credentials verified successfully!
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleTest}
            disabled={isTesting || !username || !password}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isTesting ? '#ccc' : '#3498db',
              color: 'white',
              cursor: isTesting || !username || !password ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isTesting ? '🔄 Testing...' : '🧪 Test Connection'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={testResult !== 'success'}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: testResult === 'success' ? '#27ae60' : '#ccc',
              color: 'white',
              cursor: testResult === 'success' ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            💾 Save & Continue
          </button>
        </div>

        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            <strong>🔒 Security Note:</strong> Credentials are encrypted and stored locally on your device only. 
            They are never transmitted to any server other than DHIS2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dhis2CredentialsModal; 