# SELECCIONAR UNIDADES MARCANDO UNA ZONA EN EL MAPA

## Resumen refinado de la funcionalidad:

El cliente desea poder seleccionar unidades directamente en el mapa dibujando un rectángulo. Las unidades dentro del área dibujada quedarán seleccionadas automáticamente. Esta funcionalidad debe:

1. Permitir dibujar únicamente un rectángulo en el mapa
2. Eliminar cualquier selección previa de unidades (previa confirmación al usuario)
3. Identificar y seleccionar todas las unidades que están dentro del área dibujada
4. Incluir salvaguardas para evitar problemas de rendimiento: alertar cuando hay más de 20 unidades y limitar a un máximo absoluto de 100 unidades
5. Mantener los mismos iconos/marcadores para las unidades seleccionadas que se usan actualmente
6. Requerir que se dibuje un nuevo rectángulo si se desea ajustar la selección
7. Ubicar el botón de selección por área junto al botón "Seleccionar Flota" con el mismo estilo redondo y comportamiento de expansión en hover

## Manual técnico preliminar:

### Descripción funcional:

La herramienta "Selección por área" permitirá al usuario dibujar un rectángulo directamente sobre el mapa para seleccionar múltiples unidades simultáneamente. Esta funcionalidad agilizará la gestión de flotas grandes y permitirá análisis geográficos más rápidos.

### Comportamiento del sistema:

1. **Activación de la herramienta:** Un nuevo botón ubicado a la derecha del botón "Seleccionar Flota", con el mismo diseño y comportamiento, activará el modo de selección por área
2. **Confirmación de limpieza:** Si hay unidades ya seleccionadas, se mostrará una advertencia preguntando si desea continuar y eliminar la selección actual
3. **Selección en el mapa:** El usuario podrá dibujar un rectángulo en el mapa
4. **Verificación de límite:** El sistema verificará cuántas unidades quedarían seleccionadas
   - Si son menos de 20 unidades: se seleccionarán automáticamente
   - Si son más de 20 unidades: se mostrará una advertencia sugiriendo reducir el área o aumentar el zoom
5. **Visualización de resultados:** Las unidades seleccionadas mantendrán su apariencia visual actual en el mapa, sin cambios en los iconos

### Diseño de la interfaz:

- El nuevo botón se integrará con el estilo actual, siguiendo la estética de la aplicación
- Se ubicará a la derecha del botón "Seleccionar Flota"
- Tendrá comportamiento de expansión al hacer hover, manteniendo la relación espacial con el botón "Seleccionar Flota" (cuando este se expande, el nuevo botón se desplazará de manera coordinada)

### Salvaguardas de rendimiento:

Para evitar problemas de rendimiento y posibles desbordamientos de memoria:

1. Se verificará el número de unidades dentro del área antes de confirmar la selección
2. Si el número supera el límite (20 unidades), se mostrará una alerta con opciones:
   - Reducir el área dibujada
   - Aumentar el zoom del mapa para trabajar en un área más específica
   - Forzar la selección de todas las unidades (con advertencia de posible impacto en rendimiento)
3. Se implementará un límite máximo absoluto de 100 unidades que no se podrá superar

### Tecnologías a utilizar:

1. **Leaflet.Draw:** Para implementar la herramienta de dibujo de rectángulo en el mapa
2. **Algoritmo de punto en polígono:** Para determinar qué unidades están dentro del área seleccionada
3. **Integración con el sistema actual de selección:** Modificando el estado existente en el contexto de React

## Presupuesto simple:

**Funcionalidad: Selección de unidades por área en mapa**

| Tarea                                         | Horas estimadas | Descripción                                                          |
| --------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| Análisis y planificación                      | 2               | Estudio del código existente, planificación de la integración        |
| Instalación y configuración de Leaflet.Draw   | 1.5             | Integración con la librería actual de mapas                          |
| Desarrollo de interfaz de usuario             | 4               | Botón con estilo consistente, comportamiento de expansión coordinado |
| Implementación de lógica de selección         | 6               | Algoritmos para detectar unidades dentro del área                    |
| Implementación de salvaguardas de rendimiento | 3               | Límites y advertencias para áreas grandes                            |
| Integración con sistema de selección actual   | 4               | Modificación del Context y estados existentes                        |
| Pruebas y ajustes                             | 5               | Testing exhaustivo con diferentes escenarios                         |
| Documentación                                 | 1.5             | Manual de usuario y documentación técnica                            |
| **Total**                                     | **27 horas**    | **Aproximadamente 3-4 días de desarrollo**                           |

**Costo estimado:** $60/hora × 27 horas = **$1,620 USD**  
**Bonificación:** 100% ($1,620 USD)  
**Costo final para el cliente:** **$0 USD**

## Alcance del proyecto:

- **Disponibilidad:** Todos los clientes de FullControl GPS
- **Bonificación:** 100% del costo será bonificado por tratarse de una funcionalidad de interés general

## Línea de tiempo estimada:

- Análisis, planificación e instalación inicial: 2-3 días
- Desarrollo principal y pruebas: 3-4 días
- Ajustes finales y documentación: 1-2 días
- **Tiempo total:** 6-9 días laborables

## Entregables:

1. Nuevo botón de selección por área integrado en la interfaz existente
2. Herramienta de dibujo de rectángulo para la selección de unidades
3. Sistema de alertas para prevenir problemas de rendimiento (límite de alerta: 20 unidades, límite máximo: 100 unidades)
4. Integración completa con el sistema actual de selección de unidades
5. Documentación de uso para el cliente final
6. Actualización del manual técnico para desarrolladores

Esta funcionalidad se integrará perfectamente con el diseño actual de la aplicación, respetando tanto la estética visual como el comportamiento de los componentes existentes, proporcionando una mejora significativa a la usabilidad del sistema para todos los clientes de FullControl GPS.
