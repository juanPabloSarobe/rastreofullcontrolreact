# RECORRIDOS HISTÓRICOS POR CONDUCTOR

## Resumen de la funcionalidad

La nueva funcionalidad de "Recorridos históricos por conductor" permitirá visualizar y analizar los recorridos realizados por conductores específicos en diferentes unidades, mejorando significativamente la capacidad de seguimiento y control de flotas. Esta funcionalidad se dividirá en dos componentes principales:

### 1. Histórico por Conductor (Visualización en mapa)

Permite visualizar fácilmente en el mapa los recorridos de un conductor específico en una fecha determinada:

- Acceso rápido mediante botón circular con icono de persona
- Selección del conductor de interés
- Selección de fecha específica
- Visualización de unidades que ese conductor manejó en esa fecha
- Visualización del recorrido en el mapa con todos los detalles

### 2. Histórico Avanzado por Conductor (Exportación a Excel)

Genera reportes completos en Excel para análisis detallados:

- Acceso desde el menú principal
- Selección del conductor de interés
- Selección de rango de fechas (inicio y fin)
- Descarga de archivo Excel con todos los recorridos del conductor en ese período

### 3. Sistema de Asignación de Conductores

Para administrar qué conductores puede visualizar cada usuario:

- Sistema de asignación para administradores
- Sin limitación en el número de asignaciones
- Gestión sencilla e intuitiva

## Beneficios

- **Mejora en la gestión de personal**: Seguimiento preciso de las actividades de cada conductor
- **Optimización de recursos**: Identificación de patrones de conducción y uso de vehículos
- **Generación de informes detallados**: Exportación a Excel para análisis profundos
- **Facilidad de uso**: Interfaz intuitiva integrada con el sistema actual
- **Mayor control**: Registro completo de qué vehículos ha utilizado cada conductor
- **Análisis de comportamiento**: Identificación de hábitos de conducción y eficiencia

## Flujo de usuario

### Histórico simple:

1. El usuario hace clic en el botón "Histórico por conductor"
2. Selecciona un conductor de la lista
3. Selecciona una fecha específica en el calendario
4. Visualiza las unidades que ese conductor manejó en esa fecha
5. Al hacer clic en una unidad, visualiza el recorrido detallado en el mapa

### Histórico avanzado:

1. El usuario accede a "Histórico avanzado por conductor" desde el menú
2. Selecciona un conductor
3. Selecciona un rango de fechas (desde/hasta)
4. Descarga un archivo Excel con todos los recorridos

## Presupuesto

**Funcionalidad: Recorridos históricos por conductor**

| Tarea                               | Horas estimadas | Descripción                                                   |
| ----------------------------------- | --------------- | ------------------------------------------------------------- |
| Análisis y planificación            | 5               | Estudio del código existente, planificación de la integración |
| Desarrollo de interfaz de usuario   | 8               | Botón, modal, selectores y visualización en mapa              |
| Desarrollo de sistema de asignación | 6               | ABM para gestión de asignaciones de conductores               |
| Desarrollo de backend               | 16              | Creación de endpoints y lógica de negocio                     |
| Integración con sistema existente   | 6               | Adaptación de componentes actuales                            |
| Exportación a Excel                 | 4               | Funcionalidad de generación de reportes                       |
| Pruebas y ajustes                   | 8               | Testing exhaustivo con diferentes escenarios                  |
| Documentación                       | 3               | Manual de usuario y documentación técnica                     |
| **Total**                           | **56 horas**    | **Aproximadamente 7 días de desarrollo**                      |

**Costo estimado:** $60/hora × 56 horas = **$3,360 USD**

## Alcance del proyecto:

- **Disponibilidad:** Todos los clientes de FullControl GPS
- **Bonificación:** 100%
- **Costo final para el cliente:** **$0 USD**

## Línea de tiempo estimada:

- Análisis y planificación: 1 día
- Desarrollo backend: 2-3 días
- Desarrollo frontend: 2-3 días
- Pruebas y ajustes: 1-2 días
- **Tiempo total:** 7-9 días laborables

## Entregables:

1. Sistema de visualización de recorridos históricos por conductor
2. Sistema de exportación a Excel de recorridos
3. Gestión de asignaciones de conductores
4. Documentación de uso para el cliente final

Esta funcionalidad optimizará significativamente el seguimiento de la actividad de los conductores, permitiendo una gestión más eficiente de la flota y un mejor análisis del desempeño de cada conductor.
