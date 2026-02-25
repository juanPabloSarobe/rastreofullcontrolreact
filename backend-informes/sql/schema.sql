-- ============================================
-- INICIALIZACIÓN DE BASE DE DATOS
-- FullControl - Informes
-- ============================================

-- Crear tabla de informes
CREATE TABLE IF NOT EXISTS informes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'borrador', -- borrador, en_proceso, completado
  usuario_id INTEGER NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  contenido_json JSONB, -- Para almacenar datos complejos del informe
  archivo_url VARCHAR(512), -- URL del archivo generado (PDF, Excel, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_informes_usuario_id ON informes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_informes_estado ON informes(estado);
CREATE INDEX IF NOT EXISTS idx_informes_fecha_modificacion ON informes(fecha_modificacion DESC);

-- Crear tabla para tracking de generación de informes
CREATE TABLE IF NOT EXISTS informes_generacion (
  id SERIAL PRIMARY KEY,
  informe_id INTEGER NOT NULL REFERENCES informes(id) ON DELETE CASCADE,
  inicio_proceso TIMESTAMP DEFAULT NOW(),
  fin_proceso TIMESTAMP,
  estado_generacion VARCHAR(50), -- en_progreso, completado, error
  porcentaje_progreso INTEGER DEFAULT 0,
  mensaje_error TEXT,
  duracion_segundos INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_generacion_informe_id ON informes_generacion(informe_id);

-- ============================================
-- DATOS INICIALES (Opcional)
-- ============================================

INSERT INTO informes (titulo, descripcion, estado, usuario_id)
VALUES (
  'Informe de Prueba Inicial',
  'Este es un informe de prueba para verificar que la base de datos está correctamente configurada',
  'borrador',
  1
) ON CONFLICT DO NOTHING;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

CREATE OR REPLACE VIEW v_informes_resumen AS
SELECT 
  i.id,
  i.titulo,
  i.estado,
  i.usuario_id,
  i.fecha_creacion,
  i.fecha_modificacion,
  COUNT(CASE WHEN ig.estado_generacion = 'en_progreso' THEN 1 END) as generaciones_activas,
  MAX(ig.fin_proceso) as ultima_generacion
FROM informes i
LEFT JOIN informes_generacion ig ON i.id = ig.informe_id
GROUP BY i.id, i.titulo, i.estado, i.usuario_id, i.fecha_creacion, i.fecha_modificacion;

-- ============================================
-- PROCEDIMIENTO: Actualizar fecha_modificacion
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_fecha_modificacion ON informes;

CREATE TRIGGER trigger_actualizar_fecha_modificacion
  BEFORE UPDATE ON informes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_modificacion();
