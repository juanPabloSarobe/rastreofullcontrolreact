# Análisis de Scripts: Cuáles conservar y cuáles eliminar

## Scripts Originales (Conservar ✅)
```
✅ backfill-ralenti-month.mjs
   └─ Propósito: Backfill histórico de ralentis
   └─ Usado: Sí, en ocasiones por el equipo
   └─ Mantener: SÍ

✅ check-runtime.mjs  
   └─ Propósito: Verificar versión de Node/npm en runtime
   └─ Usado: Sí, a veces en validaciones pre-deploy
   └─ Mantener: SÍ
```

---

## Scripts de Diagnóstico Creados (Eliminar ❌)

Estos fueron creados para investigar el problema de comunicación. Su propósito fue diagnóstico.
Una vez que validamos la solución, ya no tienen uso operativo.

```
❌ test-communication-query-performance.mjs (54 KB)
   └─ Propósito: Medir performance de queries con diaHora
   └─ Hallazgo: diaHora es incorrecto (retorna datos históricos)
   └─ Estado: OBSOLETO (problema resuelto)
   └─ Eliminar: SÍ

❌ test-intervals-comparison.mjs (24 KB)
   └─ Propósito: Comparar 5s vs 10s de intervalo
   └─ Hallazgo: Ambos eran incorrectos porque usaban diaHora
   └─ Estado: OBSOLETO (problema identificado)
   └─ Eliminar: SÍ

❌ diagnostic-event-distribution.mjs (31 KB)
   └─ Propósito: Entender distribución temporal de eventos
   └─ Hallazgo: Confirmó que diaHora era el problema
   └─ Estado: OBSOLETO (diagnóstico completado)
   └─ Eliminar: SÍ

❌ investigate-timestamps.mjs (18 KB)
   └─ Propósito: Buscar timestamps duplicados
   └─ Hallazgo: No encontró duplicados significativos (problema era timezone)
   └─ Estado: OBSOLETO (causa raíz identificada)
   └─ Eliminar: SÍ

❌ test-horario-server-field.mjs (42 KB)
   └─ Propósito: Validar que horarioServer es el campo correcto
   └─ Hallazgo: ✅ CONFIRMADO - horarioServer es correcto
   └─ Estado: OBSOLETO (validación completada)
   └─ Eliminar: SÍ
```

---

## Resumen

**Total scripts diagnóstico a eliminar:** 5 scripts (~170 KB)  
**Total scripts útiles a conservar:** 2 scripts  

**Beneficio de limpieza:**
- Menos ruido en `/scripts`
- Documentación centralizada en PLAN_IMPLEMENTACION_MONITOR_COMUNICACION.md
- Fácil de mantener

---

## Script Nuevo a Crear

```
✅ monitor-communication.mjs (200 líneas)
   └─ Propósito: Monitoreo activo de comunicación
   └─ Frecuencia: Cada 5 minutos (vía cron)
   └─ Uso: PRODUCTOR (operativo)
   └─ Crear: SÍ
```
