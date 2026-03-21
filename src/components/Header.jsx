export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-fondo/95 backdrop-blur border-b border-borde px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-dewan font-black text-lg tracking-wide">DEWAN</span>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Panel</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Operadora</span>
        <span className="w-2 h-2 rounded-full bg-encamino animate-pulse" />
      </div>
    </header>
  );
}
