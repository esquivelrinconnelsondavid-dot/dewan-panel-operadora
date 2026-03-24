export default function SelectorSucursal({ sucursales, sucursalSeleccionada, onSeleccionar }) {
  if (sucursales.length <= 1) return null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-3">
      <p className="text-xs font-semibold text-yellow-400 mb-2">
        ⚠️ Varias sucursales — selecciona la correcta:
      </p>
      <select
        className="w-full p-2 bg-tarjeta text-white text-xs border border-borde rounded-lg focus:border-dewan outline-none"
        value={sucursalSeleccionada?.id || ''}
        onChange={(e) => {
          const sel = sucursales.find((s) => s.id === Number(e.target.value));
          onSeleccionar(sel || null);
        }}
      >
        <option value="">-- Seleccionar sucursal --</option>
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.sucursal_nombre} - {s.direccion}
            {s._distancia ? ` (${s._distancia.toFixed(1)} km)` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
