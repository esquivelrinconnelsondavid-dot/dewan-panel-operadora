import { useState } from 'react';

export default function SeccionPedidos({ titulo, color, count, children, defaultOpen = true }) {
  const [abierto, setAbierto] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-4 py-2 w-full text-left active:opacity-70"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm font-bold text-white flex-1">{titulo}</span>
        {count > 0 && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${color} text-black`}
          >
            {count}
          </span>
        )}
        <span className="text-gray-500 text-xs">{abierto ? '▾' : '▸'}</span>
      </button>
      {abierto && <div className="px-4 space-y-3">{children}</div>}
    </div>
  );
}
