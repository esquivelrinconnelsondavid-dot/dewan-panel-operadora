export default function StatsBar({ nuevos, preparando, buscando, enCamino, entregados }) {
  const items = [
    { label: 'Pend', count: nuevos, color: 'bg-nuevo' },
    { label: 'Prep', count: preparando, color: 'bg-preparando' },
    { label: 'Moto', count: buscando + enCamino, color: 'bg-buscando' },
    { label: '✅', count: entregados, color: 'bg-encamino' },
  ];

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 bg-tarjeta rounded-full px-3 py-1.5 min-w-fit"
        >
          <span className={`w-2 h-2 rounded-full ${item.color}`} />
          <span className="text-xs font-bold text-white">{item.count}</span>
          <span className="text-xs text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
