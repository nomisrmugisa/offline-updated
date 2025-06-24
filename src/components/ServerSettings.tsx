import { useState, useEffect } from 'react';
import { useServiceConfig } from '../hooks/useServiceConfig';

const ServerSettings = () => {
  const { config, updateServerIp, getNetworkIpSuggestions, testConnectivity } = useServiceConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputIp, setInputIp] = useState(config.serverIp);
  const [testResults, setTestResults] = useState<{ [key: string]: boolean | 'testing' }>({});

  // Update input field when config changes
  useEffect(() => {
    setInputIp(config.serverIp);
  }, [config.serverIp]);

  // Only show on tablet/mobile devices
  if (!config.isTabletMode) {
    return null;
  }

  const handleSaveIp = () => {
    updateServerIp(inputIp);
    setIsExpanded(false);
  };

  const handleTestIp = async (ip: string) => {
    setTestResults(prev => ({ ...prev, [ip]: 'testing' }));
    const isConnected = await testConnectivity(ip);
    setTestResults(prev => ({ ...prev, [ip]: isConnected }));
    
    if (isConnected) {
      setInputIp(ip);
    }
  };

  const suggestions = getNetworkIpSuggestions();

  return (
    <div style={{
      position: 'fixed',
      top: '60px', // Below header
      right: '10px',
      backgroundColor: '#ffffff',
      border: '2px solid #1f6bdb',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 1001,
      minWidth: '300px',
      maxWidth: '400px',
    }}>
      {/* Header */}
      <div 
        style={{
          backgroundColor: '#1f6bdb',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '6px 6px 0 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span style={{ fontWeight: 'bold' }}>🌐 Server Settings</span>
        <span style={{ fontSize: '18px' }}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{ padding: '15px' }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>
              Current Server: <strong>{config.serverIp}</strong>
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              Enter the IP address of the computer running ICD-API and Proxy services
            </div>
          </div>

          {/* IP Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Server IP Address:
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                placeholder="e.g., 192.168.1.100"
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSaveIp}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Quick Test Button */}
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => handleTestIp(inputIp)}
              disabled={testResults[inputIp] === 'testing'}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {testResults[inputIp] === 'testing' ? '🔄 Testing...' : '🔍 Test Connection'}
            </button>
            {testResults[inputIp] === true && (
              <div style={{ color: '#28a745', fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>
                ✅ Connection successful!
              </div>
            )}
            {testResults[inputIp] === false && (
              <div style={{ color: '#dc3545', fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>
                ❌ Connection failed
              </div>
            )}
          </div>

          {/* IP Suggestions */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
              Common Network IPs (click to test):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {suggestions.map((ip) => (
                <button
                  key={ip}
                  onClick={() => handleTestIp(ip)}
                  disabled={testResults[ip] === 'testing'}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    backgroundColor: 
                      testResults[ip] === true ? '#d4edda' :
                      testResults[ip] === false ? '#f8d7da' :
                      testResults[ip] === 'testing' ? '#fff3cd' : '#f8f9fa',
                    color: 
                      testResults[ip] === true ? '#155724' :
                      testResults[ip] === false ? '#721c24' :
                      testResults[ip] === 'testing' ? '#856404' : '#333',
                  }}
                >
                  {testResults[ip] === 'testing' ? '🔄' : 
                   testResults[ip] === true ? '✅' : 
                   testResults[ip] === false ? '❌' : ''} {ip}
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '11px',
            color: '#666'
          }}>
            <strong>💡 Tips:</strong><br />
            • Make sure both computers are on the same WiFi network<br />
            • The server computer should have ICD-API (port 8382) and Proxy (port 5001) running<br />
            • Try common router addresses like 192.168.1.1 first
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerSettings; 