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

          // Debounce same code for 2 seconds
          if (code === lastResultRef.current && (now - lastScanTimeRef.current < 2000)) {
            return;
          }

          lastResultRef.current = code;
          lastScanTimeRef.current = now;

          // Flash UI Effect
          if (videoRef.current) {
            videoRef.current.style.filter = 'brightness(1.5) contrast(1.2)';
            setTimeout(() => { if(videoRef.current) videoRef.current.style.filter = 'none'; }, 150);
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
    <div className="card" style={{ background: '#000', color: '#fff', position: 'relative', overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {manualMode ? <Keyboard size={20} /> : <Camera size={20} />}
          {manualMode ? 'Manual Entry' : 'Smart Barcode Scanner'}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ color: '#fff', border: '1px solid #444', padding: '0.3rem' }}
            onClick={() => setManualMode(!manualMode)}
            title={manualMode ? "Switch to Camera" : "Switch to Manual"}
          >
            {manualMode ? <Camera size={20} /> : <Keyboard size={20} />}
          </button>
          <button className="btn btn-outline" style={{ color: '#fff', border: '1px solid #444', padding: '0.3rem' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: '3.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {manualMode ? (
          <div style={{ padding: '2rem', width: '100%' }}>
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label className="label" style={{ color: '#aaa' }}>Enter Barcode Manually</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Type or paste barcode..." 
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  style={{ background: '#222', color: '#fff', borderColor: '#444' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Barcode</button>
            </form>
          </div>
        ) : (
          <>
            {error ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <RefreshCw size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--danger)' }}>{error}</p>
                <button className="btn btn-outline" onClick={() => startScanning(selectedCamera)} style={{ marginTop: '1rem', color: '#fff' }}>Retry</button>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '350px', background: '#000' }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px dashed rgba(255,255,255,0.3)', pointerEvents: 'none', margin: '40px' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: 0, 
                    right: 0, 
                    height: '2px', 
                    background: 'var(--primary)', 
                    boxShadow: '0 0 10px var(--primary)',
                    animation: 'scan-line 3s linear infinite'
                  }} />
                </div>
              </div>
            )}
            
            {cameras.length > 1 && (
              <div style={{ padding: '1rem', width: '100%', background: '#111' }}>
                <select 
                  value={selectedCamera} 
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  style={{ background: '#222', color: '#fff', border: '1px solid #444', height: '40px' }}
                >
                  {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || `Camera ${c.deviceId.slice(0,5)}`}</option>)}
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
