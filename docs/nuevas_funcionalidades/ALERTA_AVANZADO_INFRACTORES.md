# RANKING AVANZADO DE INFRACTORES

## Estado: Diseño funcional preliminar

### Objetivo

Visualizar, gestionar y analizar en tiempo real el ranking de infractores (top 10 y más), con filtros por día, semana y mes, y capacidad de interacción con agente de IA para sugerencias, análisis y acciones automáticas.

---

#### 1. Detección y Clasificación

- Detección automática de infracciones en los datos de unidades (campo estado: "infracción", "infraccion", etc.).
- Clasificación por gravedad, tipo y cantidad de infracciones.
- Filtros de antigüedad: solo infracciones del rango seleccionado (día, semana, mes).

#### 2. Ranking y Visualización

- Top 10 infractores en tiempo real, con opción de expandir a lista completa.
- Visualización tipo lista expandible, con colores y badges según cantidad y gravedad.
- Ordenamiento por cantidad, gravedad, nombre, patente, empresa, etc.
- Panel con detalles de cada infractor: historial, tipo de infracciones, evolución temporal.

#### 3. Filtros y Persistencia

- Filtros por rango temporal (día, semana, mes).
- Persistencia de historial durante la sesión.
- Limpieza automática de datos antiguos fuera del rango seleccionado.

#### 4. Interacción y Acciones

- Selección de infractor para ver detalles y acciones disponibles.
- Botón para eliminar infracción individual o limpiar historial completo.
- Integración con sistema de selección de unidades y detalles.

#### 5. Integración con Agente de IA

- Panel de interacción con IA: sugerencias automáticas, análisis de patrones, predicción de infracciones futuras.
- Prompts y respuestas integrados en la interfaz del ranking.
- Acciones automáticas sugeridas por IA: notificaciones, reportes, recomendaciones de gestión.

#### 6. UX/UI y Posicionamiento

- Diseño responsive, consistente con el sistema de alertas existente.
- Posicionamiento inteligente: debajo de la alerta de ralentí, ajustable según contexto.
- Controles de ordenamiento, filtros y cierre manual.
- Badge visible en estado contraído, expansión horizontal en hover, panel integrado en clic.

#### 7. Optimización y Rendimiento

- Memoización de arrays, componentes y funciones frecuentes.
- Evitar bucles infinitos en efectos y dependencias.
- Componentes de lista memoizados para alto rendimiento.

#### 8. Métricas y Evolución

- Métricas de infracciones por unidad, empresa, conductor.
- Evolución temporal y comparativa entre periodos.
- Exportación de ranking y reportes.

---

### Notas para instancia de IA

- Arquitectura y patrones reutilizables de alerta de ralentí avanzada aplicables.
- Preparado para integración y ejecución de agente de IA.
- Documentar criterios de ranking, visualización y acciones automáticas.
- Dejar espacio para definir interacciones IA específicas en el futuro.

---

**Fecha de diseño:** 31/07/2025
**Autor:** Equipo FullControl
**Estado:** Listo para continuar en próxima sesión IA.
