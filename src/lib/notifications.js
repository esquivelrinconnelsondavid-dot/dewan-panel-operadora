let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Genera un beep urgente con Web Audio API (funciona en silencio)
export function playBeep() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 3 beeps rápidos
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.setValueAtTime(0, now + 0.15);
    gain.gain.setValueAtTime(0.4, now + 0.25);
    gain.gain.setValueAtTime(0, now + 0.4);
    gain.gain.setValueAtTime(0.4, now + 0.5);
    gain.gain.setValueAtTime(0, now + 0.65);

    osc.start(now);
    osc.stop(now + 0.7);
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

// Push notification del navegador
export async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showPushNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico', vibrate: [300, 100, 300] });
  } catch (e) {
    console.warn('[PUSH]', e);
  }
}

// Desbloquear AudioContext con primer toque del usuario
export function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  // Crear un sonido silencioso para desbloquear en iOS/Android
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
}
