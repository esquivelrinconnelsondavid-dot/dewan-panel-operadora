export default function PedidoEntregado({ pedido }) {
  const hora = pedido.fecha_entregado
    ? new Date(pedido.fecha_entregado).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="bg-tarjeta/50 rounded-lg px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-gray-500">#{pedido.id}</span>
        <span className="text-xs text-gray-300 truncate">{pedido.restaurante}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {pedido.nombre_moto && (
          <span className="text-[10px] text-gray-500">{pedido.nombre_moto}</span>
        )}
        <span className="text-[10px] text-gray-500">{hora}</span>
        <span className="text-xs">✅</span>
      </div>
    </div>
  );
}
