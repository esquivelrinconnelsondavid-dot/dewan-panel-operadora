import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { lanzarMotorizado, cancelarPedido } from '../lib/webhooks';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from './TimerDisplay';
import { useSucursales } from '../hooks/useSucursales';
import SelectorSucursal from './SelectorSucursal';

export default function PedidoPreparando({ pedido }) {
  const [cargando, setCargando] = useState(false);
  const { expirado } = useTimer(pedido.timer_lanzamiento);
  const lanzadoRef = useRef(false);
  const { sucursales, sucursalSeleccionada, setSucursalSeleccionada, requiereSucursal } = useSucursales(pedido);

  // Auto-lanzar cuando timer llega a 0 (solo si no requiere selección de sucursal)
  useEffect(() => {
    if (expirado && !lanzadoRef.current && !requiereSucursal) {
      lanzadoRef.current = true;
      lanzar(true);
    }
  }, [expirado, requiereSucursal]);

  const lanzar = async (auto = false) => {
    setCargando(true);
    try {
      // Actualizar estado a confirmado (incluir sucursal si fue seleccionada)
      const updateData = { estado_pedido: 'confirmado' };
      if (sucursalSeleccionada) {
        updateData.sucursal_id = sucursalSeleccionada.id;
        updateData.sucursal_nombre = sucursalSeleccionada.nombre_completo;
        updateData.direccion_retiro = sucursalSeleccionada.direccion;
      }
      await supabase
        .from('pedidos_delivery')
        .update(updateData)
        .eq('id', pedido.id);

      await lanzarMotorizado(pedido, auto, sucursalSeleccionada).catch((e) =>
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

      {/* Selector de sucursal */}
      <SelectorSucursal
        sucursales={sucursales}
        sucursalSeleccionada={sucursalSeleccionada}
        onSeleccionar={setSucursalSeleccionada}
      />

      {/* Alerta si timer expiró pero falta sucursal */}
      {expirado && requiereSucursal && (
        <div className="bg-nuevo/20 border border-nuevo/50 rounded-lg p-2 mb-2">
          <p className="text-xs font-bold text-nuevo text-center animate-pulse">
            ⚠️ Selecciona sucursal para lanzar motorizado
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => lanzar(false)}
          disabled={requiereSucursal}
          className={`flex-1 bg-encamino text-white text-xs font-bold py-2.5 rounded-lg active:scale-95 transition-transform ${
            requiereSucursal ? 'opacity-40 cursor-not-allowed' : ''
          }`}
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
