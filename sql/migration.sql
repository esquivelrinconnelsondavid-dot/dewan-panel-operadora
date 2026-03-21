-- Migración: Campos para Panel de Operadora
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevos campos
ALTER TABLE pedidos_delivery
  ADD COLUMN IF NOT EXISTS tiempo_preparacion INTEGER,
  ADD COLUMN IF NOT EXISTS timer_lanzamiento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS operadora_atendido BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS operadora_atendido_at TIMESTAMPTZ;

-- 2. Habilitar Realtime para la tabla (si no está ya)
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos_delivery;

-- 3. Índice para consultas de la operadora
CREATE INDEX IF NOT EXISTS idx_pedidos_operadora
  ON pedidos_delivery (intencion, estado_pedido, fecha_creacion DESC)
  WHERE intencion = 'pedido_comida';
