const LABEL = {
  aceptado: { text: 'Aceptado', color: 'text-encamino' },
  en_camino: { text: 'En camino retiro', color: 'text-encamino' },
  en_camino_entrega: { text: 'En camino entrega', color: 'text-buscando' },
  llegado: { text: 'Llegó al destino', color: 'text-dewan' },
};

export default function PedidoEnCamino({ pedido }) {
  const info = LABEL[pedido.estado_pedido] || { text: pedido.estado_pedido, color: 'text-gray-400' };

  return (
    <div className="bg-tarjeta rounded-xl border-l-4 border-encamino p-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className="text-xs font-bold text-encamino">#{pedido.id}</span>
          <h3 className="text-sm font-bold text-white leading-tight">
            {pedido.restaurante}
          </h3>
        </div>
        <span className={`text-xs font-bold ${info.color}`}>{info.text}</span>
      </div>
      <p className="text-xs text-gray-300 line-clamp-1">{pedido.detalle_pedido}</p>

      {/* Cliente */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500">{pedido.cliente_nombre}</span>
        {pedido.cliente_telefono && (
          <a href={`tel:${pedido.cliente_telefono}`} className="text-[11px] text-buscando font-semibold active:opacity-70">
            📞 Cliente
          </a>
        )}
      </div>

      {/* Motorizado */}
      {pedido.nombre_moto && (
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-borde">
          <span className="text-xs font-bold text-encamino">
            🏍️ {pedido.nombre_moto}
          </span>
          {pedido.telefono_moto && (
            <a href={`tel:${pedido.telefono_moto}`} className="text-[11px] text-encamino font-semibold active:opacity-70">
              📞 {pedido.telefono_moto}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
