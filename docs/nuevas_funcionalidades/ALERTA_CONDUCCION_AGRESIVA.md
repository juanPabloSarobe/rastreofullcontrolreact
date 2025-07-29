# ALERTA DE CONDUCCIÓN AGRESIVA

## Descripción

La funcionalidad de "Alerta de Conducción Agresiva" tiene como objetivo identificar y monitorear a los conductores que, a pesar de no cometer infracciones de velocidad, muestran un patrón de conducción no defensiva al acumular múltiples preavisos de límite de velocidad superado.

## Lógica de funcionamiento

1. **Preavisos diarios:** Cada conductor tiene un límite de 10 preavisos diarios antes de activar el estado de "conducción agresiva".
2. **Estado de conducción agresiva:**
   - Una vez alcanzados los 10 preavisos, cualquier preaviso adicional se considera un "preaviso de conducción agresiva".
   - Este estado se mantiene hasta el final del día.
3. **Reseteo diario:** Los contadores de preavisos se reinician al inicio de cada día.

## Visualización

### Resumida

- **Indicador en tiempo real:**
  - Ícono o alerta en el panel principal para conductores en estado de "conducción agresiva".
  - Colores para indicar el nivel de riesgo:
    - Verde: Menos de 10 preavisos.
    - Amarillo: Entre 10 y 15 preavisos.
    - Rojo: Más de 15 preavisos.
- **Resumen por conductor:**
  - Columna o etiqueta en la lista de conductores con el número de preavisos acumulados y el estado actual.

### Expandida

- **Detalle por conductor:**
  - Número total de preavisos.
  - Número de preavisos de conducción agresiva.
  - Tiempos y ubicaciones de los preavisos.
- **Gráficos:**
  - Gráficos de barras o líneas mostrando la evolución de los preavisos durante el día.
- **Mapa interactivo:**
  - Puntos donde ocurrieron los preavisos, destacando áreas de mayor incidencia.

## Alertas y notificaciones

- **Notificaciones en tiempo real:**
  - Alertas al administrador cuando un conductor entra en estado de "conducción agresiva".
- **Resumen diario:**
  - Informe al final del día con estadísticas clave de los conductores en este estado.

## Configuración

- **Umbral ajustable:**
  - Permitir al administrador modificar el límite de preavisos (por ejemplo, de 10 a 15).
- **Notificaciones automáticas:**
  - Configuración para activar o desactivar notificaciones según niveles de preavisos.

## Integración con la plataforma

- **Panel principal:**
  - Widget o sección específica para "Conducción Agresiva" en el dashboard.
- **Compatibilidad móvil:**
  - Información accesible y clara en la vista móvil, con resúmenes compactos y gráficos simplificados.
- **Consistencia de diseño:**
  - Uso de estilos y componentes existentes para mantener la coherencia visual.
