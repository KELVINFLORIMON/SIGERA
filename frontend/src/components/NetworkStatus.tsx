import React, { useState, useEffect } from 'react';
import { syncQueue } from '../services/syncQueue';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Al volver la conexión, procesamos la cola de sincronización
      syncQueue.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpieza
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#f59e0b',
      color: 'white',
      textAlign: 'center',
      padding: '8px',
      fontWeight: 'bold',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      width: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      ⚠️ Estás trabajando sin conexión. Los cambios se guardarán localmente y se sincronizarán al reconectar.
    </div>
  );
};
