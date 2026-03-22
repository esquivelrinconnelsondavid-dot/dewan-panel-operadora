let audioCtx = null;
let swRegistration = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Registrar Service Worker para notificaciones en móvil
async function registrarSW() {
  if (swRegistration) return swRegistration;
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Registrado');
      return swRegistration;
    } catch (e) {
      console.warn('[SW] Error:', e);
    }
  }
  return null;
}

// Genera un beep urgente con Web Audio API (funciona en silencio)
export async function playBeep() {
  try {
    const ctx = getAudioCtx();
    // Asegurar que AudioContext está activo
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Doble check
    if (ctx.state !== 'running') {
      console.warn('[AUDIO] AudioContext no está running:', ctx.state);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 3 beeps rápidos y fuertes
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.setValueAtTime(0, now + 0.15);
    gain.gain.setValueAtTime(0.6, now + 0.25);
    gain.gain.setValueAtTime(0, now + 0.4);
    gain.gain.setValueAtTime(0.6, now + 0.5);
    gain.gain.setValueAtTime(0, now + 0.7);

    osc.start(now);
    osc.stop(now + 0.75);
    console.log('[AUDIO] Beep reproducido');
  } catch (e) {
    console.warn('[AUDIO] Error:', e);
  }
}

// Intervalo que repite sonido cada 15s para pedidos sin atender
const alertIntervals = new Map();

export function startAlertLoop(pedidoId) {
  if (alertIntervals.has(pedidoId)) return;
  playBeep();
  vibrar();
  const id = setInterval(() => {
    playBeep();
    vibrar();
  }, 15000);
  alertIntervals.set(pedidoId, id);
}

export function stopAlertLoop(pedidoId) {
  const id = alertIntervals.get(pedidoId);
  if (id) {
    clearInterval(id);
    alertIntervals.delete(pedidoId);
  }
}

export function stopAllAlerts() {
  alertIntervals.forEach((id) => clearInterval(id));
  alertIntervals.clear();
}

export function vibrar() {
  if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
}

// Push notification — usa Service Worker para móvil
export async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') {
    await registrarSW();
    return true;
  }
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    await registrarSW();
    return true;
  }
  return false;
}

export async function showPushNotification(title, body) {
  if (Notification.permission !== 'granted') return;

  try {
    // Intentar via Service Worker (funciona en móvil)
    const sw = await registrarSW();
    if (sw) {
      await sw.showNotification(title, {
        body,
        icon: '/favicon.ico',
        vibrate: [300, 100, 300],
        tag: 'dewan-pedido-' + Date.now(),
        renotify: true,
      });
      return;
    }
  } catch (e) {
    console.warn('[PUSH-SW] Fallback a Notification API:', e);
  }

  // Fallback: Notification API (funciona en desktop)
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch (e) {
    console.warn('[PUSH] Error:', e);
  }
}

// Desbloquear AudioContext con interacción del usuario
export async function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  // Reproducir un beep corto real para confirmar que funciona
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    console.log('[AUDIO] Desbloqueado, estado:', ctx.state);
  } catch (e) {
    console.warn('[AUDIO] Error desbloqueando:', e);
  }
}

// Verificar si audio está listo
export function audioListo() {
  return audioCtx && audioCtx.state === 'running';
}
