-- Migración: Sistema de Sucursales de Restaurantes
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla de sucursales
CREATE TABLE IF NOT EXISTS restaurantes_sucursales (
  id SERIAL PRIMARY KEY,
  restaurante_nombre TEXT NOT NULL,
  sucursal_nombre TEXT NOT NULL,
  nombre_completo TEXT GENERATED ALWAYS AS (restaurante_nombre || ' - ' || sucursal_nombre) STORED,
  direccion TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índice para búsqueda rápida por nombre de restaurante
CREATE INDEX IF NOT EXISTS idx_restaurante_nombre ON restaurantes_sucursales(restaurante_nombre);

-- 3. Agregar columnas de sucursal a pedidos_delivery
ALTER TABLE pedidos_delivery
  ADD COLUMN IF NOT EXISTS sucursal_id INTEGER REFERENCES restaurantes_sucursales(id),
  ADD COLUMN IF NOT EXISTS sucursal_nombre TEXT;

-- 4. Datos de ejemplo (ajustar con datos reales)
INSERT INTO restaurantes_sucursales (restaurante_nombre, sucursal_nombre, direccion, latitud, longitud, telefono)
VALUES
  ('Pollos GUS', 'Centro', 'Av. Principal 123, Centro', -1.6635, -78.6545, '0991234567'),
  ('Pollos GUS', 'Norte', 'Calle Norte 456, Sector Norte', -1.6550, -78.6500, '0997654321'),
  ('Pollos GUS', 'Sur', 'Av. Sur 789, Sector Sur', -1.6720, -78.6580, '0993334444');
