# ALERTA DE UNIDADES EN RALENTÍ

## Resumen refinado de la funcionalidad:

El cliente desea implementar un sistema de alertas visuales para monitorear unidades que se encuentran en estado de ralentí. La funcionalidad debe:

1. Mostrar un icono circular (similar al botón "Seleccionar Flota") que indique la cantidad de unidades en ralentí
2. Detectar unidades en ralentí mediante el campo "estado" (posibles valores: "Inicio Ralenti", "Fin de ralenti", "Reporte en Ralenti", "ralentí" con acento)
3. Ubicarse estratégicamente en la interfaz:
   - Cuando no hay unidades seleccionadas: debajo del selector de unidades
   - Cuando hay unidades seleccionadas: debajo del detalle de la unidad
   - En vista móvil: siempre debajo del selector de unidades
4. Expandirse al hacer clic mostrando una lista simple ordenada alfabéticamente de unidades en ralentí
5. Permitir marcar unidades como "ignoradas" con un icono de ojo en el lado izquierdo de cada ítem
6. Permitir seleccionar unidades haciendo clic directamente en un ítem de la lista (sin botones adicionales)
7. Mostrar con código de colores los diferentes estados de ralentí (rojo para inicio/reporte, negro para fin)
8. Eliminar del listado las unidades ignoradas que ya no estén en estado de ralentí

## Manual técnico preliminar:

### Descripción funcional:

El sistema de "Alertas de unidades en ralentí" permitirá visualizar y gestionar las unidades que están operando con el motor encendido sin movimiento (ralentí), lo que facilita la optimización de recursos, reducción de consumo de combustible y mejora la gestión operativa de la flota.

### Comportamiento del sistema:

1. **Detección de unidades en ralentí:**

   - Cada vez que se ejecuta el hook usePrefFetch para actualizar las ubicaciones, se verificará el campo "estado" de cada unidad
   - Se considerarán en ralentí las unidades cuyos estados contengan las palabras clave: "Inicio Ralenti", "Fin de ralenti", "Reporte en Ralenti", "ralentí"
   - La detección será insensible a mayúsculas/minúsculas y acentos

2. **Indicador visual:**

   - Un botón circular mostrará el número de unidades en ralentí activas
   - Cuando hay unidades en ralentí, se mostrará un círculo rojo con el número de unidades
   - El botón tendrá un comportamiento de expansión al hacer hover, similar al botón "Seleccionar Flota"

3. **Posicionamiento inteligente:**

   - Sin unidades seleccionadas: se ubicará debajo del selector de unidades
   - Con unidades seleccionadas: se ubicará debajo del detalle de la unidad
   - Vista móvil: siempre debajo del selector de unidades, respetando la superposición del selector de unidades expandido

4. **Panel expandible:**

   - Al hacer clic en el icono, se expandirá lateralmente y luego hacia abajo con una animación de transición fluida
   - Mostrará una lista simple ordenada alfabéticamente de unidades en ralentí

5. **Diseño del listado de unidades:**

   - Formato simple y compacto con información esencial (patente y conductor)
   - Icono de ojo en el lado izquierdo para marcar como "ignorada"
   - Sin botones adicionales - la selección se realiza haciendo clic directamente en el ítem
   - Código de colores:
     - Rojo: para estados "Inicio Ralenti" y "Reporte en Ralenti"
     - Negro: para estado "Fin de ralenti"

6. **Sistema de ignorados:**

   - Las unidades marcadas como "ignoradas" se mostrarán en gris al final de la lista
   - Este estado persistirá únicamente durante la sesión activa (se reiniciará al cerrar sesión)
   - Las unidades ignoradas seguirán contando para el indicador numérico
   - Si una unidad ignorada deja de estar en ralentí, se eliminará completamente del listado
   - Si posteriormente vuelve a entrar en ralentí, aparecerá como una nueva unidad activa (no ignorada)

7. **Actualizaciones en tiempo real:**
   - Las unidades dejarán de aparecer en la lista automáticamente cuando su estado ya no indique ralentí
   - Nuevas unidades en ralentí aparecerán en la lista con la próxima actualización de datos

### Diseño de la interfaz:

- **Botón principal:** Circular con ícono representativo (posiblemente un motor o indicador de ralentí)
- **Indicador de conteo:** Círculo rojo con número en blanco, posicionado en la esquina superior derecha del botón
- **Panel expandido:**
  - Encabezado con título "Unidades en ralentí" y contador
  - Lista simple y compacta sin tarjetas
  - Cada ítem de la lista incluirá:
    - Icono de ojo (izquierda) para ignorar la unidad
    - Patente y conductor
    - Indicador de estado (rojo para inicio/reporte, negro para fin)
- **Estados visuales:**
  - Unidades con "Inicio Ralenti" o "Reporte en Ralenti": texto en rojo o indicador rojo
  - Unidades con "Fin de ralenti": texto en negro o indicador negro
  - Unidades ignoradas: estilo atenuado (gris), al final de la lista

### Tecnologías a utilizar:

1. **React Context:** Para gestionar el estado de las unidades ignoradas durante la sesión
2. **MUI Components:** Aprovechando componentes existentes para mantener consistencia visual
3. **React Transition Group:** Para implementar las animaciones de expansión
4. **Local Storage:** Para mantener la lista de unidades ignoradas durante la sesión

## Presupuesto simple:

**Funcionalidad: Alerta de unidades en ralentí**

| Tarea                                   | Horas estimadas | Descripción                                                   |
| --------------------------------------- | --------------- | ------------------------------------------------------------- |
| Análisis y planificación                | 3               | Estudio del código existente, planificación de la integración |
| Desarrollo de lógica de detección       | 4               | Algoritmos para identificar unidades en ralentí               |
| Desarrollo de interfaz de usuario       | 6               | Botón, indicador y panel expandible con animaciones           |
| Implementación del sistema de ignorados | 3               | Lógica para marcar y filtrar unidades ignoradas               |
| Posicionamiento adaptativo              | 4               | Lógica para ubicar el componente según el contexto            |
| Integración con sistema de selección    | 3               | Permitir seleccionar unidades desde el panel                  |
| Pruebas y ajustes                       | 5               | Testing exhaustivo con diferentes escenarios                  |
| Documentación                           | 2               | Manual de usuario y documentación técnica                     |
| **Total**                               | **30 horas**    | **Aproximadamente 4 días de desarrollo**                      |

**Costo estimado:** $60/hora × 30 horas = **$1,800 USD**

## Alcance del proyecto:

- **Disponibilidad:** Todos los clientes de FullControl GPS
- **Bonificación:** 100% del costo será bonificado por tratarse de una funcionalidad de interés general
- **Costo final para el cliente:** **$0 USD**

## Línea de tiempo estimada:

- Análisis y planificación: 1 día
- Desarrollo principal: 3 días
- Pruebas y ajustes: 1-2 días
- **Tiempo total:** 5-6 días laborables

## Entregables:

1. Componente de alerta de unidades en ralentí completamente integrado
2. Sistema de detección automática de unidades en ralentí
3. Lista simple y eficiente para mostrar y gestionar unidades en ralentí
4. Sistema de marcado de unidades como "ignoradas"
5. Integración con el sistema de selección de unidades existente
6. Documentación de uso para el cliente final

Esta funcionalidad mejorará la capacidad de supervisión de la flota, permitiendo una rápida identificación de unidades en ralentí que podrían estar desperdiciando combustible o requiriendo atención.
