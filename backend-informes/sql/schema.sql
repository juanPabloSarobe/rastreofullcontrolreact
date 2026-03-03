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

-- ============================================
-- FASE 1 - RALENTÍ V2 BASADO EN EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS idle_events_v2_raw (
  id BIGSERIAL PRIMARY KEY,
  movil_id INTEGER NOT NULL,
  equipo_id TEXT,
  persona_id INTEGER,
  event_ts_utc TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('IDLE_START', 'IDLE_REPORT', 'IDLE_END')),
  latitud NUMERIC,
  longitud NUMERIC,
  payload JSONB,
  source_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idle_events_v2_raw_movil_ts
  ON idle_events_v2_raw (movil_id, event_ts_utc);

CREATE INDEX IF NOT EXISTS idx_idle_events_v2_raw_type_ts
  ON idle_events_v2_raw (event_type, event_ts_utc);

CREATE TABLE IF NOT EXISTS idle_intervals_v2 (
  id BIGSERIAL PRIMARY KEY,
  movil_id INTEGER NOT NULL,
  equipo_id TEXT,
  persona_id INTEGER,
  start_ts_utc TIMESTAMPTZ NOT NULL,
  end_ts_utc TIMESTAMPTZ NOT NULL,
  duration_sec INTEGER NOT NULL CHECK (duration_sec >= 0),
  start_lat NUMERIC,
  start_lng NUMERIC,
  end_lat NUMERIC,
  end_lng NUMERIC,
  build_mode TEXT NOT NULL CHECK (build_mode IN ('explicit', 'synthetic_report', 'implicit_close_next_start', 'window_close')),
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  anomaly_flags JSONB DEFAULT '[]'::jsonb,
  algorithm_version SMALLINT NOT NULL DEFAULT 1,
  source_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idle_intervals_v2_movil_start
  ON idle_intervals_v2 (movil_id, start_ts_utc);

CREATE INDEX IF NOT EXISTS idx_idle_intervals_v2_start_end
  ON idle_intervals_v2 (start_ts_utc, end_ts_utc);

CREATE TABLE IF NOT EXISTS idle_intervals_v2_coverage (
  id BIGSERIAL PRIMARY KEY,
  movil_id INTEGER NOT NULL,
  from_ts_utc TIMESTAMPTZ NOT NULL,
  to_ts_utc TIMESTAMPTZ NOT NULL,
  algorithm_version SMALLINT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ok',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (movil_id, from_ts_utc, to_ts_utc, algorithm_version)
);

CREATE INDEX IF NOT EXISTS idx_idle_intervals_v2_coverage_movil_from_to
  ON idle_intervals_v2_coverage (movil_id, from_ts_utc, to_ts_utc);
