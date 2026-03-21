import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { timerRestaurante, restauranteNoPuede } from '../lib/webhooks';
import { stopAlertLoop } from '../lib/notifications';

function tiempoSinAtender(fechaCreacion) {
  const diff = Date.now() - new Date(fechaCreacion).getTime();
  const seg = Math.floor(diff / 1000);
  if (seg < 60) return `${seg}s`;
  return `${Math.floor(seg / 60)}m ${seg % 60}s`;
}

export default function PedidoNuevo({ pedido }) {
  const [cargando, setCargando] = useState(false);
  const [tiempoTexto, setTiempoTexto] = useState(tiempoSinAtender(pedido.fecha_creacion));

  // Actualizar tiempo sin atender cada segundo
  useState(() => {
    const id = setInterval(() => {
      setTiempoTexto(tiempoSinAtender(pedido.fecha_creacion));
    }, 1000);
    return () => clearInterval(id);
  });

  const sinAtenderMinutos = (Date.now() - new Date(pedido.fecha_creacion).getTime()) / 60000;

  const seleccionarTiempo = async (minutos) => {
    setCargando(true);
    try {
      // 1. Actualizar Supabase
      await supabase
        .from('pedidos_delivery')
        .update({
          estado_pedido: 'preparando',
          tiempo_preparacion: minutos,
          timer_lanzamiento: new Date(Date.now() + minutos * 60000).toISOString(),
          operadora_atendido: true,
          operadora_atendido_at: new Date().toISOString(),
        })
        .eq('id', pedido.id);

      // 2. Notificar a n8n (avisa al cliente por WhatsApp)
      await timerRestaurante(pedido, minutos).catch((e) =>
        console.warn('Webhook timer falló:', e)
      );

      stopAlertLoop(pedido.id);
    } catch (e) {
      console.error('Error:', e);
      alert('Error al procesar. Intenta de nuevo.');
    }
    setCargando(false);
  };

  const noPuede = async () => {
    if (!confirm('¿Seguro que el restaurante NO puede preparar este pedido?')) return;
    setCargando(true);
    try {
      await supabase
        .from('pedidos_delivery')
        .update({ estado_pedido: 'cancelado' })
        .eq('id', pedido.id);
      await restauranteNoPuede(pedido).catch(() => {});
      stopAlertLoop(pedido.id);
    } catch (e) {
      console.error('Error:', e);
    }
    setCargando(false);
  };

  const llamar = () => {
    const tel = pedido.cliente_telefono || '';
    if (tel) window.open(`tel:${tel}`, '_self');
  };

  return (
    <div
      className={`bg-tarjeta rounded-xl border-l-4 border-nuevo p-4 ${
        !pedido.operadora_atendido ? 'animate-pulso' : ''
      } ${cargando ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-nuevo">#{pedido.id}</span>
          <h3 className="text-sm font-bold text-white leading-tight">
            {pedido.restaurante || 'Sin restaurante'}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">{tiempoTexto}</span>
          {sinAtenderMinutos >= 2 && (
            <div className="text-[10px] text-nuevo font-bold mt-0.5 animate-pulse">
              ⚠️ Sin atender
            </div>
          )}
        </div>
      </div>

      {/* Detalle */}
      <p className="text-xs text-gray-300 mb-1 line-clamp-2">{pedido.detalle_pedido}</p>

      {/* Cliente con teléfono */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">{pedido.cliente_nombre}</span>
        {pedido.cliente_telefono && (
          <a
            href={`tel:${pedido.cliente_telefono}`}
            className="text-[11px] text-buscando font-semibold active:opacity-70"
          >
            {pedido.cliente_telefono}
          </a>
        )}
      </div>

      {/* Direcciones */}
      <div className="text-[11px] text-gray-400 mb-3 space-y-0.5">
        {pedido.direccion_retiro && (
          <div className="truncate">📍 <span className="text-gray-300">{pedido.direccion_retiro}</span></div>
        )}
        {pedido.direccion_entrega && (
          <div className="truncate">🏠 <span className="text-gray-300">{pedido.direccion_entrega}</span></div>
        )}
      </div>

      {/* Botones */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={llamar}
          className="bg-buscando/20 text-buscando text-xs font-bold px-3 py-2 rounded-lg active:scale-95"
        >
          📞
        </button>
        {[5, 10, 15, 20].map((min) => (
          <button
            key={min}
            onClick={() => seleccionarTiempo(min)}
            className="bg-dewan/15 text-dewan text-xs font-bold px-3 py-2 rounded-lg active:scale-95 transition-transform"
          >
            {min}'
          </button>
        ))}
        <button
          onClick={noPuede}
          className="bg-nuevo/15 text-nuevo text-xs font-bold px-2.5 py-2 rounded-lg active:scale-95 ml-auto"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
