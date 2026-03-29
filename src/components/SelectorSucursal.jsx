export default function SelectorSucursal({ sucursales, sucursalSeleccionada, onSeleccionar }) {
  if (sucursales.length <= 1) return null;

  const masСercana = sucursales[0]?._distancia != null ? sucursales[0] : null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-3">
      <p className="text-xs font-semibold text-yellow-400 mb-2">
        ⚠️ Varias sucursales — selecciona la correcta:
      </p>

      {/* Indicador de sucursal recomendada */}
      {masСercana && (
        <div className="bg-green-900/40 border border-green-600/50 rounded-lg p-2 mb-2">
          <p className="text-[10px] text-green-400 font-bold mb-0.5">
            ✅ MÁS CERCANA AL CLIENTE:
          </p>
          <p className="text-xs text-white font-semibold">
            {masСercana.sucursal_nombre} — {masСercana._distancia.toFixed(1)} km
          </p>
          <p className="text-[10px] text-gray-400">{masСercana.direccion}</p>
        </div>
      )}

      <select
        className="w-full p-2 bg-tarjeta text-white text-xs border border-borde rounded-lg focus:border-dewan outline-none"
        value={sucursalSeleccionada?.id || ''}
        onChange={(e) => {
          const sel = sucursales.find((s) => s.id === Number(e.target.value));
          onSeleccionar(sel || null);
        }}
      >
        <option value="">-- Seleccionar sucursal --</option>
        {sucursales.map((s, i) => (
          <option key={s.id} value={s.id}>
            {i === 0 && s._distancia != null ? '⭐ ' : ''}
            {s.sucursal_nombre} - {s.direccion}
            {s._distancia != null ? ` (${s._distancia.toFixed(1)} km)` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
