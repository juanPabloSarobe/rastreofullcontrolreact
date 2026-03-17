import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Refresh,
  Mail,
  WhatsApp,
  PowerSettingsNew,
  PlayArrow,
  CheckCircle,
  ErrorOutline,
  WarningAmber,
} from '@mui/icons-material';
import { useContextValue } from '../../context/Context';

const AdminDashboard = () => {
  const { state } = useContextValue();
  const [loading, setLoading] = useState({});
  const [systemData, setSystemData] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [backendsHealth, setBackendsHealth] = useState(null);
  const [monitorLogs, setMonitorLogs] = useState([]);
  const [latestManualLog, setLatestManualLog] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [restartDialog, setRestartDialog] = useState(false);
  const [restartConfirmation, setRestartConfirmation] = useState('');
  const [restartConfirmationError, setRestartConfirmationError] = useState(false);

  // Obtener rol de cookies (en caso de ser nueva pestaña)
  const getUserRole = () => {
    const cookies = document.cookie.split(';');
    const rolCookie = cookies.find((c) => c.trim().startsWith('rol='));
    return rolCookie ? rolCookie.split('=')[1] : state.role;
  };

  // URL base del backend y headers - memoized para estabilidad
  const { apiBaseUrl, headers } = useMemo(() => {
    // URL base del backend (desarrollo vs producción)
    const getApiBaseUrl = () => {
      const configuredAdminBackend = import.meta.env.VITE_ADMIN_API_BASE;
      const configuredNewBackend = import.meta.env.VITE_API_NEW_BACKEND;

      // Si está en desarrollo local, prioriza URL configurada por entorno
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return configuredAdminBackend || configuredNewBackend || 'http://localhost:3002';
      }

      // En producción, usar same-origin para preservar cookies de sesión.
      // Solo usar dominio externo si se define explícitamente VITE_ADMIN_API_BASE.
      if (configuredAdminBackend) {
        return configuredAdminBackend;
      }

      // En producción, usa la misma URL del frontend (ruta relativa vía proxy)
      return '';
    };

    return {
      apiBaseUrl: getApiBaseUrl(),
      headers: {
        'x-user-role': getUserRole(),
        'Content-Type': 'application/json',
      },
    };
  }, [state.role]);

  // Obtener datos del sistema
  const fetchSystemStatus = useCallback(async () => {
    setLoading((prev) => ({ ...prev, system: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/system-status`, { headers, credentials: 'include' });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setSystemData(data.system);
      setAlerts((prev) => prev.filter((a) => a.id !== 'system'));
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: 'system',
          type: 'error',
          message: `Error obteniendo estado del sistema: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, system: false }));
    }
  }, [apiBaseUrl, headers]);

  // Obtener estado de BD
  const fetchDBStatus = useCallback(async () => {
    setLoading((prev) => ({ ...prev, db: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/db-status`, { headers, credentials: 'include' });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setDbData(data.database);
      setAlerts((prev) => prev.filter((a) => a.id !== 'db'));
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: 'db',
          type: 'error',
          message: `Error obteniendo estado de BD: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, db: false }));
    }
  }, [apiBaseUrl, headers]);

  // Obtener health de backend v2 + legacy
  const fetchBackendsHealth = useCallback(async () => {
    setLoading((prev) => ({ ...prev, backends: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/backends-health`, {
        headers,
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setBackendsHealth(data.backends || null);
      setAlerts((prev) => prev.filter((a) => a.id !== 'backends'));
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: 'backends',
          type: 'warning',
          message: `Error obteniendo health de backends: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, backends: false }));
    }
  }, [apiBaseUrl, headers]);

  // Obtener logs del monitor
  const fetchMonitorLogs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, logs: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/monitor-logs`, { headers, credentials: 'include' });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setMonitorLogs(data.logs || []);
      setAlerts((prev) => prev.filter((a) => a.id !== 'logs'));
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: 'logs',
          type: 'warning',
          message: `Error obteniendo logs: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, logs: false }));
    }
  }, [apiBaseUrl, headers]);

  // Enviar email de prueba
  const handleTestEmail = useCallback(async () => {
    setLoading((prev) => ({ ...prev, email: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/test-email`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'success',
          message: `✅ Email enviado correctamente (ID: ${data.messageId})`,
        },
      ]);
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'error',
          message: `Error enviando email: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  }, [apiBaseUrl, headers]);

  // Enviar WhatsApp de prueba (placeholder)
  const handleTestWhatsApp = useCallback(async () => {
    setLoading((prev) => ({ ...prev, whatsapp: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/test-whatsapp`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      const data = await response.json();
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'info',
          message: data.message,
        },
      ]);
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'error',
          message: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, whatsapp: false }));
    }
  }, [apiBaseUrl, headers]);

  // Abrir diálogo de reinicio
  const handleOpenRestartDialog = () => {
    setRestartDialog(true);
    setRestartConfirmation('');
    setRestartConfirmationError(false);
  };

  // Confirmar reinicio
  const handleConfirmRestart = useCallback(async () => {
    const normalizedConfirmation = restartConfirmation.trim().toLowerCase();

    if (normalizedConfirmation !== 'reiniciar') {
      setRestartConfirmationError(true);
      return;
    }

    setLoading((prev) => ({ ...prev, restart: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/restart-instance`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ confirmationToken: normalizedConfirmation }),
      });
      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorPayload = await response.json();
          errorDetails = errorPayload?.message || errorPayload?.error || '';
        } catch {
          // Ignorar parseo si no hay JSON
        }
        throw new Error(errorDetails ? `${response.status} - ${errorDetails}` : `Error: ${response.status}`);
      }
      const data = await response.json();

      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'success',
          message: `✅ ${data.message}`,
        },
      ]);
      setRestartDialog(false);
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'error',
          message: `Error reiniciando: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, restart: false }));
    }
  }, [apiBaseUrl, headers, restartConfirmation]);

  const mergedMonitorLogs = useMemo(() => {
    if (!latestManualLog) return monitorLogs;

    const withoutDuplicate = monitorLogs.filter((log) => {
      const sameTimestamp = (log?.timestamp || '') === latestManualLog.timestamp;
      const sameSource = (log?.sourceKey || '') === (latestManualLog.sourceKey || '');
      return !(sameTimestamp && sameSource);
    });

    return [latestManualLog, ...withoutDuplicate].slice(0, 5);
  }, [latestManualLog, monitorLogs]);

  // Ejecutar monitoreo manual
  const handleRunManualMonitor = useCallback(async () => {
    setLoading((prev) => ({ ...prev, manualRun: true }));
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/run-monitor-manual`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const status = data?.monitorResult?.status || 'SIN_DATO';
      const events = data?.monitorResult?.eventCount;
      const manualTimestamp = data?.monitorResult?.timestamp || data?.timestamp || new Date().toISOString();

      setLatestManualLog({
        timestamp: manualTimestamp,
        status,
        eventCount: Number(events || 0),
        message: data?.monitorResult?.message || 'Ejecución manual del monitor',
        sourceKey: 'manual-run',
      });

      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: status === 'CRITICAL' ? 'warning' : 'success',
          message: `Monitoreo manual ejecutado. Estado: ${status}${events !== undefined ? ` | Eventos: ${events}` : ''}`,
        },
      ]);

      await Promise.all([fetchSystemStatus(), fetchDBStatus(), fetchBackendsHealth(), fetchMonitorLogs()]);
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'error',
          message: `Error ejecutando monitoreo manual: ${error.message}`,
        },
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, manualRun: false }));
    }
  }, [apiBaseUrl, headers, fetchSystemStatus, fetchDBStatus, fetchBackendsHealth, fetchMonitorLogs]);

  // Cargar datos al montar
  useEffect(() => {
    fetchSystemStatus();
    fetchDBStatus();
    fetchBackendsHealth();
    fetchMonitorLogs();
  }, [fetchSystemStatus, fetchDBStatus, fetchBackendsHealth, fetchMonitorLogs]);

  // Card Status
  const StatusIcon = ({ status }) => {
    if (status === 'ok' || status === 'true') {
      return <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />;
    }
    if (status === 'error') {
      return <ErrorOutline sx={{ color: '#f44336', fontSize: 32 }} />;
    }
    return <WarningAmber sx={{ color: '#ff9800', fontSize: 32 }} />;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Título */}
      <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
        🛠️ Dashboard Administrativo
      </Typography>

      {/* Alertas */}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          severity={alert.type}
          onClose={() =>
            setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
          }
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      ))}

      {/* Grid principal */}
      <Grid container spacing={3}>
        {/* Estado del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🖥️ Estado del Sistema</Typography>
                <Button
                  size="small"
                  onClick={fetchSystemStatus}
                  disabled={loading.system}
                  startIcon={<Refresh />}
                >
                  {loading.system ? <CircularProgress size={20} /> : 'Actualizar'}
                </Button>
              </Box>

              {systemData ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Instancia:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.instanceId || 'N/A'} ({systemData.instanceType || 'N/A'})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Estado:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.state || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Uptime:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>{systemData.uptime || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Uptime desde último reinicio:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.restartTracking?.uptimeSinceRestartRequest || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Último reinicio solicitado:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.restartTracking?.lastRestartRequestedAt
                        ? new Date(systemData.restartTracking.lastRestartRequestedAt).toLocaleString('es-AR')
                        : 'N/A'}
                    </Typography>
                  </Box>
                  {!systemData.restartTracking?.hasBaseline && (
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      Sin baseline histórico de reinicio por dashboard en esta versión.
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Uptime API (fallback):</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.apiProcess?.uptime || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Memoria total:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.memory?.total || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>RAM usada:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.memory?.used || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Swap usada:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.swap?.usedPercent !== 'N/A' ? `${systemData.swap?.usedPercent}%` : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Discos EBS:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.disk?.size || 'N/A'} ({systemData.disk?.volumeCount || 0} vol)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Root FS usada:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.disk?.usage || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>CPU 5m (CW):</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.cpu?.cloudwatch5mAvgPercent || 'N/A'}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>CPU pico 1m:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.cpu?.cloudwatch1mMaxPercent || 'N/A'}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Red 5m (in/out):</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.network?.in5mMB || '0.00'} / {systemData.network?.out5mMB || '0.00'} MB
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>EBS 5m (R/W):</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.ebs?.read5mMB || '0.00'} / {systemData.ebs?.write5mMB || '0.00'} MB
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Cola EBS avg:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.ebs?.queueAvg5m || '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Health checks:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.healthChecks?.systemStatus || 'N/A'} / {systemData.healthChecks?.instanceStatus || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>CWAgent:</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {systemData.cwAgent?.available ? 'activo' : 'sin métricas'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <CircularProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de BD */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🗄️ Estado de Base de Datos</Typography>
                <Button
                  size="small"
                  onClick={fetchDBStatus}
                  disabled={loading.db}
                  startIcon={<Refresh />}
                >
                  {loading.db ? <CircularProgress size={20} /> : 'Actualizar'}
                </Button>
              </Box>

              {dbData ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusIcon status={dbData.health === 'critical' ? 'error' : dbData.connected ? 'ok' : 'error'} />
                    <Box>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {dbData.connected ? `Conectada (${dbData.health || 'ok'})` : 'Desconectada'}
                      </Typography>
                      <Typography variant="caption">{dbData.size}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                      Conexiones: {dbData.totalConnections || 0}/{dbData.maxConnections || 0} ({dbData.connectionUsagePct || 0}%)
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Activas: {dbData.activeConnections || 0} | Idle: {dbData.idleConnections || 0} | En espera: {dbData.waitingConnections || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Consultas largas: {dbData.longRunningQueries || 0} | Cache hit: {dbData.cacheHitRatioPct || 0}%
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {(dbData.issues || []).map((issue, idx) => (
                        <Chip key={idx} label={issue} size="small" color="warning" />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <CircularProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Health de Backends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🩺 Health Backends (v2 + legacy)</Typography>
                <Button
                  size="small"
                  onClick={fetchBackendsHealth}
                  disabled={loading.backends}
                  startIcon={<Refresh />}
                >
                  {loading.backends ? <CircularProgress size={20} /> : 'Actualizar'}
                </Button>
              </Box>

              {backendsHealth ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Backend v2</Typography>
                      <Typography variant="body2">
                        Estado: <strong>{backendsHealth.v2?.ok ? 'UP' : 'DOWN'}</strong>
                      </Typography>
                      <Typography variant="body2">URL: {backendsHealth.v2?.url || 'N/A'}</Typography>
                      <Typography variant="body2">HTTP: {backendsHealth.v2?.httpStatus ?? 'N/A'}</Typography>
                      <Typography variant="body2">Tiempo: {backendsHealth.v2?.responseTimeMs ?? 'N/A'} ms</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Backend legacy</Typography>
                      <Typography variant="body2">
                        Estado: <strong>{backendsHealth.legacy?.ok ? 'UP' : 'DOWN'}</strong>
                      </Typography>
                      <Typography variant="body2">URL: {backendsHealth.legacy?.url || 'N/A'}</Typography>
                      <Typography variant="body2">HTTP: {backendsHealth.legacy?.httpStatus ?? 'N/A'}</Typography>
                      <Typography variant="body2">Tiempo: {backendsHealth.legacy?.responseTimeMs ?? 'N/A'} ms</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <CircularProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Últimos 5 Logs del Monitor */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">📊 Últimos 5 Estados del Monitor</Typography>
                <Button
                  size="small"
                  onClick={fetchMonitorLogs}
                  disabled={loading.logs}
                  startIcon={<Refresh />}
                >
                  {loading.logs ? <CircularProgress size={20} /> : 'Actualizar'}
                </Button>
              </Box>

              {mergedMonitorLogs.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Hora</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell align="right">Eventos</TableCell>
                        <TableCell>Mensaje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mergedMonitorLogs.map((log, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{new Date(log.timestamp).toLocaleString('es-AR')}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={log.status}
                              color={log.status === 'OK' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {log.eventCount}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{log.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No hay logs disponibles</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔧 Acciones
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayArrow />}
                  onClick={handleRunManualMonitor}
                  disabled={loading.manualRun}
                >
                  {loading.manualRun ? <CircularProgress size={20} /> : 'Ejecutar monitoreo manual'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Mail />}
                  onClick={handleTestEmail}
                  disabled={loading.email}
                >
                  {loading.email ? <CircularProgress size={20} /> : 'Test Email'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsApp />}
                  onClick={handleTestWhatsApp}
                  disabled={loading.whatsapp}
                >
                  {loading.whatsapp ? <CircularProgress size={20} /> : 'Test WhatsApp'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PowerSettingsNew />}
                  onClick={handleOpenRestartDialog}
                  disabled={loading.restart}
                >
                  {loading.restart ? <CircularProgress size={20} /> : 'Reiniciar Instancia'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para reinicio */}
      <Dialog open={restartDialog} onClose={() => setRestartDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚠️ Confirmar Reinicio de Instancia</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            El servidor se reiniciará y habrá una breve pérdida de conectividad.
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Para confirmar, escribe la palabra <strong>"reiniciar"</strong> en el campo siguiente:
          </Typography>
          <TextField
            fullWidth
            placeholder='Escribe "reiniciar"'
            value={restartConfirmation}
            onChange={(e) => {
              setRestartConfirmation(e.target.value);
              setRestartConfirmationError(false);
            }}
            error={restartConfirmationError}
            helperText={restartConfirmationError ? 'Debes escribir "reiniciar" correctamente' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestartDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmRestart}
            variant="contained"
            color="error"
            disabled={restartConfirmation.trim().toLowerCase() !== 'reiniciar' || loading.restart}
          >
            {loading.restart ? <CircularProgress size={20} /> : 'Confirmar Reinicio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
