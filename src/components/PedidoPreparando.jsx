import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { lanzarMotorizado, cancelarPedido } from '../lib/webhooks';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from './TimerDisplay';

export default function PedidoPreparando({ pedido }) {
  const [cargando, setCargando] = useState(false);
  const { expirado } = useTimer(pedido.timer_lanzamiento);
  const lanzadoRef = useRef(false);

  // Auto-lanzar cuando timer llega a 0
  useEffect(() => {
    if (expirado && !lanzadoRef.current) {
      lanzadoRef.current = true;
      lanzar(true);
    }
  }, [expirado]);

  const lanzar = async (auto = false) => {
    setCargando(true);
    try {
      // Actualizar estado a confirmado para que n8n lance el broadcast
      await supabase
        .from('pedidos_delivery')
        .update({ estado_pedido: 'confirmado' })
        .eq('id', pedido.id);

      await lanzarMotorizado(pedido.id, auto).catch((e) =>
        console.warn('Webhook lanzar falló:', e)
      );
    } catch (e) {
      console.error('Error lanzando:', e);
      lanzadoRef.current = false;
    }
    setCargando(false);
  };

  const agregar5Min = async () => {
    const nuevoTimer = new Date(
      new Date(pedido.timer_lanzamiento).getTime() + 5 * 60000
    ).toISOString();
    await supabase
      .from('pedidos_delivery')
      .update({
        timer_lanzamiento: nuevoTimer,
        tiempo_preparacion: (pedido.tiempo_preparacion || 0) + 5,
      })
      .eq('id', pedido.id);
  };

  const cancelar = async () => {
    if (!confirm('¿Cancelar este pedido?')) return;
    setCargando(true);
    try {
      await supabase
        .from('pedidos_delivery')
        .update({ estado_pedido: 'cancelado' })
        .eq('id', pedido.id);
      await cancelarPedido(pedido).catch(() => {});
    } catch (e) {
      console.error('Error:', e);
    }
    setCargando(false);
  };

  return (
    <div
      className={`bg-tarjeta rounded-xl border-l-4 border-preparando p-4 ${
        cargando ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-preparando">#{pedido.id}</span>
          <h3 className="text-sm font-bold text-white leading-tight">
            {pedido.restaurante}
          </h3>
        </div>
        <TimerDisplay timerLanzamiento={pedido.timer_lanzamiento} />
      </div>

      <p className="text-xs text-gray-300 mb-1 line-clamp-2">{pedido.detalle_pedido}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">{pedido.cliente_nombre}</span>
        {pedido.cliente_telefono && (
          <a href={`tel:${pedido.cliente_telefono}`} className="text-[11px] text-buscando font-semibold active:opacity-70">
            {pedido.cliente_telefono}
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => lanzar(false)}
          className="flex-1 bg-encamino text-white text-xs font-bold py-2.5 rounded-lg active:scale-95 transition-transform"
        >
          🚀 Lanzar ahora
        </button>
        <button
          onClick={agregar5Min}
          className="bg-preparando/15 text-preparando text-xs font-bold px-3 py-2.5 rounded-lg active:scale-95"
        >
          +5'
        </button>
        <button
          onClick={cancelar}
          className="bg-nuevo/15 text-nuevo text-xs font-bold px-3 py-2.5 rounded-lg active:scale-95"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
