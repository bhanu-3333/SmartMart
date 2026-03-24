import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, RefreshCw, Keyboard, CheckCircle } from 'lucide-react';

const Scanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const lastResultRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.RSS_14,
    BarcodeFormat.ITF
  ]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader(hints);
    codeReaderRef.current = codeReader;

    codeReader.listVideoInputDevices()
      .then(devices => {
        if (devices.length > 0) {
          setCameras(devices);
          // Try to find a back camera
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
          setSelectedCamera(backCam ? backCam.deviceId : devices[0].deviceId);
        } else {
          setError('No cameras found');
        }
      })
      .catch(err => {
        console.error('Camera Error:', err);
        setError('Camera access denied');
      });

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const startScanning = useCallback(async (deviceId) => {
    if (!codeReaderRef.current || !videoRef.current) return;
    
    try {
      setIsScanning(true);
      setError('');
      
      console.log("Starting ZXing Scanner on device:", deviceId);
      
      codeReaderRef.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText();
          const now = Date.now();
          
          // Debugging
          console.log("ZXing Scanned:", code);

          // Cooldown for SAME code: 1.5 seconds (Reduced from 2.0s for speed)
          if (code === lastResultRef.current && (now - lastScanTimeRef.current < 1500)) {
            return;
          }

          lastResultRef.current = code;
          lastScanTimeRef.current = now;

          // Haptic-like visual feedback (Green Flash)
          if (videoRef.current) {
            videoRef.current.style.transition = 'none';
            videoRef.current.style.filter = 'brightness(2) sepia(1) hue-rotate(80deg)';
            setTimeout(() => { if(videoRef.current) {
              videoRef.current.style.transition = 'filter 0.3s';
              videoRef.current.style.filter = 'none'; 
            }}, 200);
          }

          onScan(code);
        }
      });
    } catch (err) {
      console.error('Scanner Start Error:', err);
      setError('Failed to start scanner');
      setIsScanning(false);
    }
  }, [onScan]);

  useEffect(() => {
    if (selectedCamera && !manualMode) {
      startScanning(selectedCamera);
    } else if (manualMode && codeReaderRef.current) {
      codeReaderRef.current.reset();
      setIsScanning(false);
    }
  }, [selectedCamera, manualMode, startScanning]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="glass-card" style={{ background: '#0f172a', color: '#fff', position: 'relative', overflow: 'hidden', padding: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          {manualMode ? <Keyboard size={20} className="fade-in" /> : <Camera size={20} className="fade-in" />}
          <span style={{ textTransform: 'uppercase', fontStyle: 'italic', fontWeight: 800 }}>SmartScan AI</span>
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-icon" 
            style={{ 
              background: manualMode ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => setManualMode(!manualMode)}
          >
            {manualMode ? <Camera size={20} /> : <Keyboard size={20} />}
          </button>
          <button 
            className="btn-icon" 
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: '#f87171', 
              border: 'none', 
              borderRadius: '10px', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }} 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {manualMode ? (
          <div style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px' }} className="fade-in">
            <form onSubmit={handleManualSubmit}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="label" style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', width: '100%' }}>BARCODE INPUT</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="0000000000000" 
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', 
                    border: '2px solid rgba(255,255,255,0.1)', 
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '4px',
                    padding: '1.5rem'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>IDENTIFY PRODUCT</button>
            </form>
          </div>
        ) : (
          <>
            {error ? (
              <div style={{ padding: '2rem', textAlign: 'center' }} className="fade-in">
                <RefreshCw size={48} style={{ color: 'var(--danger)', marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
                <p style={{ color: '#fca5a5', fontWeight: 500 }}>{error}</p>
                <button className="btn btn-outline" onClick={() => startScanning(selectedCamera)} style={{ marginTop: '1.5rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>RETRY CONNECTION</button>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '450px', background: '#000' }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ 
                  position: 'absolute', 
                  top: '20%', 
                  left: '10%', 
                  right: '10%', 
                  bottom: '20%', 
                  border: '2px solid rgba(99, 102, 241, 0.5)', 
                  borderRadius: '24px',
                  boxShadow: '0 0 0 1000px rgba(15, 23, 42, 0.7)',
                  pointerEvents: 'none'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '5%', 
                    right: '5%', 
                    height: '3px', 
                    background: 'var(--primary)', 
                    boxShadow: '0 0 20px var(--primary), 0 0 40px var(--primary)',
                    animation: 'scan-line 2.5s ease-in-out infinite',
                    borderRadius: '50%'
                  }} />
                  
                  {/* Corner Accents */}
                  <div style={{ position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '12px 0 0 0' }} />
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 12px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0 0 12px' }} />
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 0 12px 0' }} />
                </div>
              </div>
            )}
            
            {cameras.length > 1 && (
              <div style={{ padding: '1.25rem', width: '100%', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <select 
                  value={selectedCamera} 
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', height: '48px', margin: 0 }}
                >
                  {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || `LENS ${c.deviceId.slice(0,5).toUpperCase()}`}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '1rem', background: '#111', color: '#888', textAlign: 'center', fontSize: '0.8rem' }}>
        {manualMode ? 'Type the barcode and press Enter' : 'Point camera at any standard 1D barcode'}
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
