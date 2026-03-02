/**
 * Componente de Testing para Ralentís
 * Permite probar el nuevo endpoint de ralentís del backend v2
 * Usa las unidades seleccionadas del context
 */

import { useState, useRef } from 'react';
import useRalentis from '../../hooks/useRalentis.js';
import { getApiConfig } from '../../config/apiConfig.js';
import { useContextValue } from '../../context/Context.jsx';

export default function RalentisTester() {
  const { state, dispatch } = useContextValue();
  const { data, loading, error, fetchRalentisPorMoviles } = useRalentis();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const tableRef = useRef(null);

  const config = getApiConfig();
  const selectedUnits = state.selectedUnits || [];

  const handleClose = () => {
    dispatch({ type: 'SET_VIEW_MODE', payload: 'rastreo' });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedUnits || selectedUnits.length === 0) {
      alert('Por favor seleccione al menos una unidad');
      return;
    }

    if (!fechaDesde || !fechaHasta) {
      alert('Por favor completar el rango de fechas');
      return;
    }

    try {
      await fetchRalentisPorMoviles(selectedUnits, fechaDesde, fechaHasta);
      
      // Scroll a tabla de resultados
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';

    if (typeof duration === 'object') {
      const hours = duration.hours || 0;
      const minutes = duration.minutes || 0;
      const seconds = duration.seconds || 0;
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (typeof duration === 'string') {
      const match = duration.match(/(\d+):(\d+):(\d+)/);
      if (match) {
        const [, hours, minutes, seconds] = match;
        return `${hours}h ${minutes}m ${seconds}s`;
      }
    }

    return duration;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧪 Testing - Nuevo Endpoint Ralentís</h1>
          <p style={styles.subtitle}>
            Unidades seleccionadas: <strong>{selectedUnits.length}</strong>
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={styles.configButton}
          >
            ⚙️ {showConfig ? 'Ocultar' : 'Mostrar'} Config
          </button>
          <button
            onClick={handleClose}
            style={styles.closeButton}
          >
            ← Volver
          </button>
        </div>
      </div>

      {showConfig && (
        <div style={styles.configBox}>
          <h3>Configuración de APIs</h3>
          <pre style={styles.pre}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}

      {selectedUnits.length === 0 && (
        <div style={styles.warningBox}>
          ⚠️ No hay unidades seleccionadas. Por favor usa el selector de unidades para seleccionar al menos una.
        </div>
      )}

      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.infoBox}>
          📊 Se consultarán los ralentís de las <strong>{selectedUnits.length}</strong> unidad(es) seleccionada(s): 
          <br />
          <code style={styles.code}>{JSON.stringify(selectedUnits)}</code>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label htmlFor="fechaDesde" style={styles.label}>
              Fecha Desde
            </label>
            <input
              id="fechaDesde"
              type="datetime-local"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="fechaHasta" style={styles.label}>
              Fecha Hasta
            </label>
            <input
              id="fechaHasta"
              type="datetime-local"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || selectedUnits.length === 0}
          style={{
            ...styles.button,
            opacity: loading || selectedUnits.length === 0 ? 0.6 : 1,
            cursor: loading || selectedUnits.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Cargando...' : '🔍 Buscar Ralentís'}
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {data && data.length > 0 && (
        <div ref={tableRef} style={styles.resultsBox}>
          <h3 style={styles.resultsTitle}>
            ✅ Resultados ({data.length} registros)
          </h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>ID Ralentí</th>
                  <th style={styles.th}>Móvil</th>
                  <th style={styles.th}>Inicio</th>
                  <th style={styles.th}>Fin</th>
                  <th style={styles.th}>Duración</th>
                  <th style={styles.th}>Ubicación</th>
                  <th style={styles.th}>Equipo</th>
                </tr>
              </thead>
              <tbody>
                {data.map((ralenti, idx) => (
                  <tr key={idx} style={styles.row}>
                    <td style={styles.td}>{ralenti.idRalenti}</td>
                    <td style={styles.td}>{ralenti.IdMovil}</td>
                    <td style={styles.td}>
                      {formatDate(ralenti.fechaHoraInicio)}
                    </td>
                    <td style={styles.td}>
                      {formatDate(ralenti.fechahoraFin)}
                    </td>
                    <td style={styles.td}>
                      {formatDuration(ralenti.tiempoRalenti)}
                    </td>
                    <td style={styles.td}>
                      {ralenti.latitud}, {ralenti.longitud}
                    </td>
                    <td style={styles.td}>{ralenti.idEquipo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.length === 0 && !loading && (
        <div style={styles.emptyBox}>
          ℹ️ No se encontraron registros para los criterios especificados
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#333',
  },
  subtitle: {
    margin: '0',
    fontSize: '14px',
    color: '#666',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  configButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  configBox: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #ffeaa7',
  },
  infoBox: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '15px',
    border: '1px solid #bee5eb',
    fontSize: '14px',
  },
  code: {
    backgroundColor: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
  },
  resultsBox: {
    backgroundColor: '#d4edda',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #c3e6cb',
  },
  resultsTitle: {
    margin: '0 0 15px 0',
    color: '#155724',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  headerRow: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    borderBottom: '2px solid #0056b3',
  },
  row: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '10px 12px',
    fontSize: '13px',
    color: '#333',
  },
  emptyBox: {
    backgroundColor: '#e7f3ff',
    color: '#0066cc',
    padding: '15px',
    borderRadius: '4px',
    border: '1px solid #b3d9ff',
    textAlign: 'center',
  },
  pre: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto',
    fontSize: '12px',
  },
};
