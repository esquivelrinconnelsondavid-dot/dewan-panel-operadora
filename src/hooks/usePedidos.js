import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { startAlertLoop, stopAlertLoop, showPushNotification } from '../lib/notifications';

const HOY = () => new Date().toISOString().split('T')[0];

export function usePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const pedidosAnterioresRef = useRef(new Set());

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('pedidos_delivery')
      .select('*')
      .eq('intencion', 'pedido_comida')
      .gte('fecha_creacion', HOY())
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('[PEDIDOS] Error cargando:', error);
      return;
    }
    setPedidos(data || []);
    // Guardar IDs conocidos para no alertar en carga inicial
    if (pedidosAnterioresRef.current.size === 0) {
      (data || []).forEach((p) => pedidosAnterioresRef.current.add(p.id));
    }
    setCargando(false);
  }, []);

  // Carga inicial
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Realtime
  useEffect(() => {
    const canal = supabase
      .channel('pedidos-operadora')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos_delivery',
          filter: 'intencion=eq.pedido_comida',
        },
        (payload) => {
          const { eventType, new: nuevo, old: viejo } = payload;

          if (eventType === 'INSERT') {
            setPedidos((prev) => {
              if (prev.find((p) => p.id === nuevo.id)) return prev;
              return [nuevo, ...prev];
            });
            // Alerta solo si es pedido nuevo que no conocíamos
            if (!pedidosAnterioresRef.current.has(nuevo.id)) {
              pedidosAnterioresRef.current.add(nuevo.id);
              if (nuevo.estado_pedido === 'pendiente_restaurante') {
                startAlertLoop(nuevo.id);
                showPushNotification(
                  `🔔 Nuevo Pedido #${nuevo.id}`,
                  `${nuevo.restaurante} - ${nuevo.detalle_pedido}`
                );
              }
            }
          }

          if (eventType === 'UPDATE') {
            setPedidos((prev) =>
              prev.map((p) => (p.id === nuevo.id ? { ...p, ...nuevo } : p))
            );
            // Si la operadora lo atendió, parar alerta
            if (nuevo.operadora_atendido && !viejo?.operadora_atendido) {
              stopAlertLoop(nuevo.id);
            }
            // Si cambió a pendiente_restaurante (nuevo), alertar
            if (
              nuevo.estado_pedido === 'pendiente_restaurante' &&
              viejo?.estado_pedido !== 'pendiente_restaurante' &&
              !pedidosAnterioresRef.current.has(nuevo.id)
            ) {
              pedidosAnterioresRef.current.add(nuevo.id);
              startAlertLoop(nuevo.id);
              showPushNotification(
                `🔔 Nuevo Pedido #${nuevo.id}`,
                `${nuevo.restaurante} - ${nuevo.detalle_pedido}`
              );
            }
          }

          if (eventType === 'DELETE') {
            setPedidos((prev) => prev.filter((p) => p.id !== viejo.id));
            stopAlertLoop(viejo.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Estado:', status);
        if (status === 'SUBSCRIBED') console.log('[REALTIME] Conectado');
      });

    return () => {
      canal.unsubscribe();
    };
  }, []);

  // Reconexión: recargar cada 30s como respaldo
  useEffect(() => {
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  // Clasificar por estado
  const nuevos = pedidos.filter(
    (p) => p.estado_pedido === 'pendiente_restaurante'
  );
  const preparando = pedidos.filter((p) => p.estado_pedido === 'preparando');
  const buscando = pedidos.filter(
    (p) => p.estado_pedido === 'confirmado' && !p.motorizado_id
  );
  const enCamino = pedidos.filter((p) =>
    ['aceptado', 'en_camino', 'en_camino_entrega', 'llegado'].includes(p.estado_pedido)
  );
  const entregados = pedidos.filter((p) => p.estado_pedido === 'entregado');

  return {
    pedidos,
    nuevos,
    preparando,
    buscando,
    enCamino,
    entregados,
    cargando,
    recargar: cargar,
  };
}
