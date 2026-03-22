import { useState, useEffect } from 'react';
import { requestPushPermission, unlockAudio, playBeep, audioListo } from '../lib/notifications';

export default function Header() {
  const [permisoNotif, setPermisoNotif] = useState('default');
  const [audioOk, setAudioOk] = useState(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermisoNotif(Notification.permission);
    }
  }, []);

  // Verificar audio cada segundo
  useEffect(() => {
    const id = setInterval(() => setAudioOk(audioListo()), 1000);
    return () => clearInterval(id);
  }, []);

  const activar = async () => {
    // Desbloquear audio (suena un beep corto de confirmación)
    await unlockAudio();
    setAudioOk(audioListo());

    // Pedir permiso de notificaciones
    const ok = await requestPushPermission();
    setPermisoNotif(ok ? 'granted' : Notification.permission);
  };

  const probarSonido = async () => {
    await unlockAudio();
    await playBeep();
    setAudioOk(audioListo());
  };

  const todoActivo = permisoNotif === 'granted' && audioOk;

  return (
    <header className="sticky top-0 z-50 bg-fondo/95 backdrop-blur border-b border-borde px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-dewan font-black text-lg tracking-wide">DEWAN</span>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Panel</span>
      </div>
      <div className="flex items-center gap-1.5">
        {!todoActivo ? (
          <button
            onClick={activar}
            className="text-[11px] font-bold bg-nuevo/20 text-nuevo px-2.5 py-1 rounded-full animate-pulse active:scale-95"
          >
            🔔 Activar
          </button>
        ) : (
          <button
            onClick={probarSonido}
            className="text-[11px] text-encamino font-semibold active:scale-95"
          >
            🔔 On
          </button>
        )}
        <span className={`w-2 h-2 rounded-full ${audioOk ? 'bg-encamino' : 'bg-nuevo animate-pulse'}`} />
      </div>
    </header>
  );
}
