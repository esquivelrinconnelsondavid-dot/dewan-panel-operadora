import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import SeccionPedidos from './components/SeccionPedidos';
import PedidoNuevo from './components/PedidoNuevo';
import PedidoPreparando from './components/PedidoPreparando';
import PedidoBuscando from './components/PedidoBuscando';
import PedidoEnCamino from './components/PedidoEnCamino';
import PedidoEntregado from './components/PedidoEntregado';
import { usePedidos } from './hooks/usePedidos';
import { requestPushPermission, unlockAudio } from './lib/notifications';

const PIN = import.meta.env.VITE_APP_PIN || '1234';

function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const verificar = () => {
    if (pin === PIN) {
      localStorage.setItem('dewan_pin', 'ok');
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-dewan font-black text-3xl tracking-wide">DEWAN</h1>
        <p className="text-gray-400 text-sm mt-1">Panel Operadora</p>
      </div>
      <div className="w-full max-w-[240px]">
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && verificar()}
          className={`w-full text-center text-2xl font-bold tracking-[0.5em] bg-tarjeta border ${
            error ? 'border-nuevo' : 'border-borde'
          } rounded-xl px-4 py-4 text-white focus:outline-none focus:border-dewan transition-colors`}
        />
        <button
          onClick={verificar}
          className="w-full mt-4 bg-dewan text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
        >
          Entrar
        </button>
        {error && (
          <p className="text-nuevo text-xs text-center mt-2 animate-pulse">PIN incorrecto</p>
        )}
      </div>
    </div>
  );
}

function Panel() {
  const { nuevos, preparando, buscando, enCamino, entregados, cargando } = usePedidos();

  // Pedir permisos de notificación al montar
  useEffect(() => {
    requestPushPermission();
  }, []);

  // Desbloquear audio con primer toque
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, []);

  if (cargando) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <span className="text-dewan font-black text-2xl">DEWAN</span>
          <div className="mt-4 w-6 h-6 border-2 border-dewan border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header />
      <StatsBar
        nuevos={nuevos.length}
        preparando={preparando.length}
        buscando={buscando.length}
        enCamino={enCamino.length}
        entregados={entregados.length}
      />

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Nuevos pedidos */}
        {nuevos.length > 0 && (
          <SeccionPedidos titulo="Nuevos pedidos" color="bg-nuevo" count={nuevos.length}>
            {nuevos.map((p) => (
              <PedidoNuevo key={p.id} pedido={p} />
            ))}
          </SeccionPedidos>
        )}

        {/* En preparación */}
        {preparando.length > 0 && (
          <SeccionPedidos titulo="En preparación" color="bg-preparando" count={preparando.length}>
            {preparando.map((p) => (
              <PedidoPreparando key={p.id} pedido={p} />
            ))}
          </SeccionPedidos>
        )}

        {/* Buscando motorizado */}
        {buscando.length > 0 && (
          <SeccionPedidos titulo="Buscando motorizado" color="bg-buscando" count={buscando.length}>
            {buscando.map((p) => (
              <PedidoBuscando key={p.id} pedido={p} />
            ))}
          </SeccionPedidos>
        )}

        {/* En camino */}
        {enCamino.length > 0 && (
          <SeccionPedidos titulo="En camino" color="bg-encamino" count={enCamino.length}>
            {enCamino.map((p) => (
              <PedidoEnCamino key={p.id} pedido={p} />
            ))}
          </SeccionPedidos>
        )}

        {/* Entregados */}
        {entregados.length > 0 && (
          <SeccionPedidos
            titulo={`Entregados hoy: ${entregados.length}`}
            color="bg-gray-600"
            count={0}
            defaultOpen={false}
          >
            <div className="space-y-1.5">
              {entregados.map((p) => (
                <PedidoEntregado key={p.id} pedido={p} />
              ))}
            </div>
          </SeccionPedidos>
        )}

        {/* Vacío */}
        {nuevos.length === 0 &&
          preparando.length === 0 &&
          buscando.length === 0 &&
          enCamino.length === 0 &&
          entregados.length === 0 && (
            <div className="text-center mt-20 text-gray-500">
              <p className="text-4xl mb-3">☕</p>
              <p className="text-sm">No hay pedidos de comida hoy</p>
            </div>
          )}
      </div>
    </div>
  );
}

export default function App() {
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem('dewan_pin') === 'ok'
  );

  if (!autenticado) {
    return <PinScreen onUnlock={() => setAutenticado(true)} />;
  }

  return <Panel />;
}
