import { useTimer } from '../hooks/useTimer';

export default function TimerDisplay({ timerLanzamiento }) {
  const { texto, minutos, expirado } = useTimer(timerLanzamiento);

  if (expirado) {
    return (
      <span className="text-encamino font-black text-sm animate-pulse">
        🚀 Lanzando...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl font-black text-dewan tabular-nums">{texto}</span>
      <span className="text-[10px] text-gray-400">
        {minutos > 0 ? `${minutos}min` : 'seg'}
      </span>
    </div>
  );
}
