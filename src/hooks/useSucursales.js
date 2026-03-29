import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useSucursales(pedido) {
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

  useEffect(() => {
    if (!pedido?.restaurante) return;

    const fetchSucursales = async () => {
      const { data } = await supabase
        .from('restaurantes_sucursales')
        .select('*')
        .eq('restaurante_nombre', pedido.restaurante)
        .eq('activo', true);

      if (!data || data.length === 0) {
        setSucursales([]);
        setSucursalSeleccionada(null);
        return;
      }

      if (data.length === 1) {
        setSucursales([]);
        setSucursalSeleccionada(data[0]);
        return;
      }

      // Múltiples sucursales: ordenar por distancia si hay coordenadas del cliente
      if (pedido.latitud_cliente && pedido.longitud_cliente) {
        data.forEach((s) => {
          if (s.latitud && s.longitud) {
            s._distancia = calcularDistancia(
              pedido.latitud_cliente,
              pedido.longitud_cliente,
              s.latitud,
              s.longitud
            );
          }
        });
        data.sort((a, b) => (a._distancia || 999) - (b._distancia || 999));
      }

      setSucursales(data);

      // Auto-seleccionar la sucursal más cercana si hay coordenadas
      if (data[0]?._distancia != null) {
        setSucursalSeleccionada(data[0]);
      }
    };

    // Si el pedido ya tiene sucursal_id seleccionada, usarla
    if (pedido.sucursal_id) {
      supabase
        .from('restaurantes_sucursales')
        .select('*')
        .eq('id', pedido.sucursal_id)
        .single()
        .then(({ data }) => {
          if (data) setSucursalSeleccionada(data);
        });
    } else {
      fetchSucursales();
    }
  }, [pedido?.restaurante, pedido?.sucursal_id]);

  const requiereSucursal = sucursales.length > 1 && !sucursalSeleccionada;

  return { sucursales, sucursalSeleccionada, setSucursalSeleccionada, requiereSucursal };
}
