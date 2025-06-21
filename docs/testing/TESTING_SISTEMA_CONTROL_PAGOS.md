# 🧪 GUÍA DE PRUEBAS - Sistema de Control de Pagos

**Fecha**: 20 de junio de 2025  
**Sistema**: Control de Pagos y Alertas de Morosidad  
**Estado**: ✅ LISTO PARA TESTING

## 📋 CHECKLIST DE PRUEBAS

### 🔍 **PRUEBAS BÁSICAS**

#### 1. **Carga Inicial del Sistema**

- [ ] Aplicación carga sin errores de consola
- [ ] PaymentService se inicializa correctamente
- [ ] No hay errores en la consola del navegador
- [ ] UserChip se muestra correctamente

#### 2. **Verificación de Servicios**

```javascript
// En consola del navegador:
window.paymentService; // Debe estar disponible en desarrollo
await window.paymentService.fetchPaymentStatus(); // Debe retornar array
```

### 🎯 **PRUEBAS POR ROLES**

#### **A. Usuario Administrador**

##### ✅ **Acceso al Panel de Empresas Morosas**

1. **Acceder**: Menú ☰ → "Empresas Morosas"
2. **Verificar**: Modal se abre correctamente
3. **Probar**: Búsqueda por razón social
4. **Probar**: Filtros por tipo (Todos/Grave/Leve)
5. **Verificar**: Paginación funciona
6. **Probar**: Botón "Actualizar" recarga datos

##### 📊 **Validaciones Esperadas**

- Modal responsive en móvil y desktop
- Datos se cargan desde API real
- Filtros funcionan correctamente
- Sin errores de JavaScript

#### **B. Usuario con Morosidad Leve**

##### ⚠️ **Comportamiento Esperado**

1. **Inicio**: Modal aparece automáticamente después de carga
2. **Visual**: UserChip muestra "Pago Pendiente" (amarillo)
3. **Funcional**: Todas las opciones del menú disponibles
4. **Temporal**: Modal aparece cada 30 minutos
5. **Histórico**: Botón histórico funciona normalmente

##### 🧪 **Simular Estado**

```javascript
// Forzar estado de prueba (en desarrollo):
window.paymentService.currentUserPaymentStatus = {
  status: "Moroso leve",
  companies: [{ razon_social: "Empresa Test", deudor: "Moroso leve" }],
  restrictions: { menuDisabled: false, showModal: true },
};
```

#### **C. Usuario con Morosidad Grave**

##### 🚫 **Comportamiento Esperado**

1. **Inicio**: Modal aparece inmediatamente
2. **Visual**: UserChip muestra "Moroso" (rojo)
3. **Funcional**: Menú deshabilitado (excepto "Cerrar Sesión")
4. **Histórico**: Botón histórico deshabilitado con tooltip
5. **Interacción**: Opciones del menú muestran cursor "not-allowed"

##### 🧪 **Simular Estado**

```javascript
// Forzar estado de prueba (en desarrollo):
window.paymentService.currentUserPaymentStatus = {
  status: "Moroso grave",
  companies: [{ razon_social: "Empresa Test", deudor: "Moroso grave" }],
  restrictions: { menuDisabled: true, showModal: true },
};
```

### 🎨 **PRUEBAS DE UX/UI**

#### **1. Modal de Alertas**

- [ ] **Countdown**: Inicia en 30 segundos y cuenta regresivo
- [ ] **Botón Cerrar**: Deshabilitado durante countdown
- [ ] **Progress Bar**: Se actualiza visualmente
- [ ] **No Cierre**: Click fuera del modal no lo cierra
- [ ] **Responsive**: Se adapta a móvil correctamente
- [ ] **Información**: Muestra empresas afectadas
- [ ] **Contacto**: Links de WhatsApp funcionan

#### **2. UserChip Dinámico**

- [ ] **Normal**: Sin indicador adicional
- [ ] **Leve**: Chip amarillo "Pago Pendiente"
- [ ] **Grave**: Chip rojo "Moroso"
- [ ] **Tooltips**: Información al hacer hover
- [ ] **Responsive**: Solo visible en desktop

#### **3. Restricciones de Menú**

- [ ] **Visual**: Elementos deshabilitados visualmente diferentes
- [ ] **Funcional**: Click no ejecuta acción
- [ ] **Cursor**: "not-allowed" en elementos deshabilitados
- [ ] **Switch**: Toggle "Ocultar Bajas" deshabilitado
- [ ] **Logout**: Siempre disponible

#### **4. Botón Histórico**

- [ ] **Normal**: Color azul, clickeable
- [ ] **Restringido**: Color gris, no clickeable
- [ ] **Tooltip**: Mensaje informativo
- [ ] **Cursor**: Apropiado para cada estado

### 🔧 **PRUEBAS TÉCNICAS**

#### **1. Gestión de Estados**

```javascript
// Verificar transiciones de estado:
1. Cargar página → Estado inicial detectado
2. Esperar 30 min → Modal aparece (solo leve)
3. Cambiar estado → UI se actualiza automáticamente
```

#### **2. Manejo de Errores**

```javascript
// Simular error de API:
- Desconectar internet temporalmente
- Verificar que aplicación no se rompe
- Estado default "No moroso" aplicado
```

#### **3. Performance**

- [ ] **Carga inicial**: < 3 segundos
- [ ] **Verificación periódica**: No bloquea UI
- [ ] **Modal**: Abre instantáneamente
- [ ] **Actualizaciones**: Sin lag visible

### 📱 **PRUEBAS MÓVILES**

#### **Dispositivos a Probar**

- [ ] **iPhone**: Safari + Chrome
- [ ] **Android**: Chrome + Samsung Internet
- [ ] **Tablet**: Orientación portrait/landscape

#### **Elementos Críticos**

- [ ] Modal ocupa pantalla completa
- [ ] Tabla de empresas scrolleable horizontalmente
- [ ] Botones touch-friendly (mín 44px)
- [ ] Texto legible sin zoom

### 🚨 **CASOS EDGE**

#### **1. Datos Corruptos**

- [ ] **Sin empresas**: Modal muestra mensaje apropiado
- [ ] **Sin conexión**: Fallback a estado seguro
- [ ] **Respuesta vacía**: No rompe la aplicación

#### **2. Usuario Cambia Estado**

- [ ] **Durante sesión**: Actualización automática
- [ ] **Entre recargas**: Estado persistente
- [ ] **Múltiples pestañas**: Sincronización

#### **3. Navegación**

- [ ] **Refresh**: Estado se restaura
- [ ] **Back/Forward**: Funciona normalmente
- [ ] **Deep Links**: Redirigen apropiadamente

## 🎯 **CRITERIOS DE ÉXITO**

### ✅ **Básicos**

- Sin errores en consola
- Todas las funcionalidades responden
- UI consistente en diferentes dispositivos
- Transiciones suaves

### ✅ **Avanzados**

- Performance óptimo < 3s carga
- Accessible (screen readers, keyboard nav)
- Fallbacks robustos para errores
- UX intuitiva sin explicación

### ✅ **Críticos**

- Restricciones de seguridad funcionan
- API de pagos integra correctamente
- Estados de morosidad precisos
- Administradores ven datos reales

## 🐛 **REPORTE DE BUGS**

### **Template de Reporte**

```markdown
**Tipo**: [UI/Funcional/Performance/Seguridad]
**Severidad**: [Crítica/Alta/Media/Baja]
**Browser**: [Chrome 91/Firefox 89/Safari 14]
**Dispositivo**: [Desktop/Mobile/Tablet]

**Pasos para Reproducir**:

1.
2.
3.

**Resultado Esperado**:

**Resultado Actual**:

**Screenshots/Videos**:

**Logs de Consola**:
```

## 📊 **MÉTRICAS DE CALIDAD**

| Métrica            | Target | Actual |
| ------------------ | ------ | ------ |
| **Carga Inicial**  | < 3s   | ⏱️     |
| **Coverage Tests** | > 90%  | 📊     |
| **Mobile Score**   | > 95%  | 📱     |
| **Accessibility**  | AA     | ♿     |
| **Performance**    | > 90%  | 🚀     |

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deploy**

- [ ] Todas las pruebas pasadas
- [ ] Code review completado
- [ ] Documentación actualizada
- [ ] Assets optimizados

### **Deploy**

- [ ] Variables de entorno configuradas
- [ ] API endpoints validados
- [ ] SSL/TLS configurado
- [ ] CDN actualizado

### **Post-Deploy**

- [ ] Smoke tests en producción
- [ ] Monitoreo activo 24h
- [ ] Rollback plan preparado
- [ ] Stakeholders notificados

---

**✅ SISTEMA LISTO PARA PRODUCCIÓN**

El sistema de control de pagos ha sido implementado completamente y está listo para ser desplegado en producción tras completar estas pruebas.
