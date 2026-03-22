import { useState, useEffect } from 'react';
import { requestPushPermission, unlockAudio } from '../lib/notifications';

export default function Header() {
  const [permisoNotif, setPermisoNotif] = useState('default');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermisoNotif(Notification.permission);
    }
  }, []);

  const activarNotificaciones = async () => {
    unlockAudio();
    const ok = await requestPushPermission();
    setPermisoNotif(ok ? 'granted' : 'denied');
  };

  return (
    <header className="sticky top-0 z-50 bg-fondo/95 backdrop-blur border-b border-borde px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-dewan font-black text-lg tracking-wide">DEWAN</span>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Panel</span>
      </div>
      <div className="flex items-center gap-2">
        {permisoNotif !== 'granted' ? (
          <button
            onClick={activarNotificaciones}
            className="text-[11px] font-bold bg-nuevo/20 text-nuevo px-2.5 py-1 rounded-full animate-pulse active:scale-95"
          >
            🔔 Activar
          </button>
        ) : (
          <span className="text-[11px] text-encamino font-semibold">🔔 On</span>
        )}
        <span className="w-2 h-2 rounded-full bg-encamino" />
      </div>
    </header>
  );
}
