# 🧪 TESTING CUMPLIMIENTO NOMINATIM

**URL:** http://localhost:5176/  
**Objetivo:** Verificar cumplimiento total con política OSM  
**Fecha:** 20 de junio de 2025

## 🎯 CHECKLIST DE CUMPLIMIENTO

### **1. 🔄 Rate Limiting (CRÍTICO)**

**✅ Test de Velocidad:**

```
1. Abrir DevTools → Console
2. Iniciar geocoding con 5-10 unidades
3. OBSERVAR logs de rate limiting:
   ⏳ Aplicando rate limit de 1100ms para Nominatim
4. VERIFICAR: Mínimo 1.1 segundos entre requests Nominatim
```

**❌ FALLA SI:**

- Requests Nominatim <1 segundo de separación
- No aparecen logs de rate limiting
- Requests paralelos a Nominatim

### **2. 📝 User-Agent Conforme**

**✅ Test de Headers:**

```
1. DevTools → Network Tab
2. Filtrar por "nominatim.openstreetmap.org"
3. Hacer click en request → Headers
4. VERIFICAR User-Agent:
   "FullControlGPS/2.1.0 (https://fullcontrol.com.ar; contact@fullcontrol.com.ar) Mozilla/5.0 LocationReportModal"
```

**❌ FALLA SI:**

- User-Agent genérico o sin contacto
- No incluye identificación específica de app
- Headers faltantes (Referer, Accept-Language)

### **3. 🔗 Atribución Legal Visible**

**✅ Test de UI:**

```
1. Abrir modal de reportes
2. Scrollear hasta abajo
3. VERIFICAR footer con:
   "📍 Datos de geolocalización proporcionados por OpenStreetMap bajo licencia ODbL"
4. VERIFICAR links clickeables a:
   - https://openstreetmap.org/copyright
   - https://opendatacommons.org/licenses/odbl/
```

**❌ FALLA SI:**

- No hay atribución visible
- Links no funcionan
- Texto incompleto o sin mencionar ODbL

### **4. 🧵 Single Thread Processing**

**✅ Test de Secuencialidad:**

```
1. Console → Observar logs de procesamiento
2. VERIFICAR:
   📦 Procesando lote 1/X (1 unidades)
   📦 Procesando lote 2/X (1 unidades)
3. CONFIRMAR: batchSize = 1 (no paralelo)
4. VERIFICAR: Requests secuenciales, no simultáneos
```

**❌ FALLA SI:**

- Múltiples requests simultáneos
- batchSize > 1
- Logs muestran procesamiento paralelo

### **5. 💾 Cache Funcionando**

**✅ Test de Caching:**

```
1. Procesar unidades
2. Cancelar y reiniciar con mismas unidades
3. VERIFICAR: Direcciones aparecen instantáneamente
4. Console NO debe mostrar nuevos requests para coords repetidas
```

**❌ FALLA SI:**

- Requests repetidos para mismas coordenadas
- Cache no funciona entre sesiones
- Siempre hace nuevos requests

## 🔍 LOGS ESPERADOS (CUMPLIMIENTO)

### **✅ Secuencia Correcta:**

```console
🚀 Iniciando geocoding para 10 unidades...
📦 Procesando lote 1/10 (1 unidades)
🌍 Intentando geocoding con Nominatim para -34.6118,-58.3960
⏳ Aplicando rate limit de 1100ms para Nominatim
✅ Geocoding exitoso con Nominatim: Buenos Aires, CABA, Argentina

📦 Procesando lote 2/10 (1 unidades)
🌍 Intentando geocoding con Nominatim para -32.8895,-68.8458
⏳ Aplicando rate limit de 1100ms para Nominatim
✅ Geocoding exitoso con Nominatim: Mendoza, Mendoza, Argentina
```

### **❌ Secuencia Incorrecta (NO debe aparecer):**

```console
❌ 🌍 Intentando geocoding con Nominatim para múltiples coords simultáneamente
❌ Requests sin rate limiting
❌ Headers genéricos
❌ Cache ignorado
```

## 📊 MÉTRICAS DE RENDIMIENTO

### **⏱️ Tiempos Esperados (CONFORMES):**

- **1 unidad**: ~1.5-2 segundos
- **5 unidades**: ~8-10 segundos
- **10 unidades**: ~15-20 segundos
- **20 unidades**: ~30-40 segundos

### **🚨 Tiempos Sospechosos (VIOLACIÓN):**

- **10 unidades en <10 segundos**: Posible violación rate limit
- **Requests simultáneos**: Violación single thread
- **Sin delays entre requests**: Violación política

## 🔧 VERIFICACIÓN TÉCNICA AVANZADA

### **Network Analysis:**

```
1. DevTools → Network → Filtrar "nominatim"
2. Verificar timestamps entre requests ≥1.1s
3. Headers correctos en cada request
4. No requests 429 (rate limit exceeded)
5. Responses 200 OK consistentes
```

### **Console Monitoring:**

```
1. Filtrar logs por "Nominatim"
2. Verificar rate limiting logs
3. Confirmar caching funcionando
4. No errores CORS/401/403
```

### **UI Compliance:**

```
1. Footer atribución presente
2. Links externos funcionando
3. Información legal completa
4. Diseño no oscurece atribución
```

## 🚨 ACCIONES SI HAY VIOLACIONES

### **Rate Limit Violation:**

```javascript
// VERIFICAR en código:
rateLimitMs: 1100, // Debe ser ≥1100ms para Nominatim
batchSize: 1,      // Debe ser exactamente 1
```

### **User-Agent Violation:**

```javascript
// VERIFICAR User-Agent completo:
"User-Agent": "FullControlGPS/2.1.0 (https://fullcontrol.com.ar; contact@fullcontrol.com.ar) Mozilla/5.0 LocationReportModal"
```

### **Attribution Missing:**

```jsx
// VERIFICAR componente de atribución:
<Typography>
  📍 Datos de geolocalización proporcionados por{" "}
  <Link href="https://openstreetmap.org/copyright">OpenStreetMap</Link> bajo
  licencia <Link href="https://opendatacommons.org/licenses/odbl/">ODbL</Link>
</Typography>
```

## ✅ CRITERIOS DE APROBACIÓN

**🎉 TEST APROBADO SI:**

- [ ] Rate limiting ≥1.1s entre requests Nominatim
- [ ] User-Agent descriptivo con contacto
- [ ] Atribución OSM/ODbL visible y clickeable
- [ ] Processing secuencial (batchSize=1)
- [ ] Cache funcionando correctamente
- [ ] Sin errores 429/401/403
- [ ] Links de atribución abren correctamente

**❌ TEST FALLIDO SI:**

- [ ] Cualquier violación de rate limiting
- [ ] User-Agent genérico o incompleto
- [ ] Atribución faltante o incorrecta
- [ ] Procesamiento paralelo detectado
- [ ] Requests repetidos innecesarios

---

## 🎯 RESULTADO ESPERADO

**Al pasar todos los tests, el sistema:**

- ✅ Cumple 100% con política Nominatim
- ✅ Opera legalmente bajo licencias OSM
- ✅ No corre riesgo de bloqueo
- ✅ Acceso sostenible garantizado
- ✅ Respeta recursos comunitarios

**¡El sistema está listo para uso en producción con cumplimiento total! 🌍✅**
