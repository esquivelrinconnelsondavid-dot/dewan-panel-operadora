import { useState, useEffect } from 'react';

export function useTimer(timerLanzamiento) {
  const [restante, setRestante] = useState(calcular(timerLanzamiento));

  function calcular(ts) {
    if (!ts) return null;
    const diff = new Date(ts).getTime() - Date.now();
    return diff > 0 ? diff : 0;
  }

  useEffect(() => {
    if (!timerLanzamiento) return;
    setRestante(calcular(timerLanzamiento));
    const id = setInterval(() => {
      setRestante(calcular(timerLanzamiento));
    }, 1000);
    return () => clearInterval(id);
  }, [timerLanzamiento]);

  if (restante === null) return { minutos: 0, segundos: 0, texto: '--:--', expirado: false, restanteMs: 0 };

  const min = Math.floor(restante / 60000);
  const seg = Math.floor((restante % 60000) / 1000);
  const texto = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;

  return { minutos: min, segundos: seg, texto, expirado: restante <= 0, restanteMs: restante };
}
