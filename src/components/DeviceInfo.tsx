import { useDeviceDetection } from '../hooks/useDeviceDetection';

const DeviceInfo = () => {
  const deviceInfo = useDeviceDetection();

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '10px',
      fontSize: '12px',
      color: '#333',
      zIndex: 1000,
      maxWidth: '300px',
    }}>
      <div><strong>Device Type:</strong> {deviceInfo.deviceType}</div>
      <div><strong>Screen Size:</strong> {deviceInfo.screenSize.width} x {deviceInfo.screenSize.height}</div>
      <div><strong>Has Touch:</strong> {deviceInfo.hasTouch ? 'Yes' : 'No'}</div>
      <div><strong>Orientation:</strong> {deviceInfo.isPortrait ? 'Portrait' : 'Landscape'}</div>
      <div><strong>User Agent:</strong> {deviceInfo.userAgent.substring(0, 50)}...</div>
    </div>
  );
};

export default DeviceInfo; 