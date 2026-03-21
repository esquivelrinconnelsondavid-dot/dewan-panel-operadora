export default function PedidoBuscando({ pedido }) {
  return (
    <div className="bg-tarjeta rounded-xl border-l-4 border-buscando p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-buscando">#{pedido.id}</span>
          <h3 className="text-sm font-bold text-white leading-tight">
            {pedido.restaurante}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-buscando animate-ping" />
          <span className="text-xs text-buscando font-bold">Buscando moto</span>
        </div>
      </div>
      <p className="text-xs text-gray-300 line-clamp-1">{pedido.detalle_pedido}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">{pedido.cliente_nombre}</span>
        {pedido.cliente_telefono && (
          <a href={`tel:${pedido.cliente_telefono}`} className="text-[11px] text-buscando font-semibold active:opacity-70">
            📞
          </a>
        )}
      </div>
    </div>
  );
}
