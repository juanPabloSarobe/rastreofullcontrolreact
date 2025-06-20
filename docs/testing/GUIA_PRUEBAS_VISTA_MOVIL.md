# 🧪 GUÍA DE PRUEBAS - MEJORAS VISTA MÓVIL

## 🎯 Objetivo de las Pruebas

Verificar que la nueva vista móvil del reporte de posición funcione correctamente y mejore la experiencia del usuario en dispositivos móviles.

## 🚀 Pasos para Probar

### 1. **Acceso a la Aplicación**

```
URL: http://localhost:5175/
```

### 2. **Simular Vista Móvil en Navegador**

#### **Chrome/Edge/Safari:**

1. Presiona `F12` o `Ctrl+Shift+I` (Cmd+Option+I en Mac)
2. Haz clic en el icono de dispositivo móvil (📱) o presiona `Ctrl+Shift+M`
3. Selecciona un dispositivo móvil (ej: iPhone 12, Galaxy S21)
4. Recarga la página

#### **Firefox:**

1. Presiona `F12`
2. Haz clic en el icono "Responsive Design Mode" (📱)
3. Selecciona dimensiones móviles (ej: 375x667)

### 3. **Navegación para Acceder al Reporte**

1. **Login** (si es necesario)
2. **Ir al mapa principal**
3. **Seleccionar unidades**:
   - Marcar algunas unidades en el mapa, O
   - Dejar sin seleccionar para usar "Toda la Flota"
4. **Abrir reporte**:
   - Buscar botón/menú "Reporte de Posición"
   - Hacer clic para abrir el modal

### 4. **Verificaciones en Vista Móvil**

#### **✅ Detección Automática**

- [ ] El modal ocupa toda la pantalla (`fullScreen={isMobile}`)
- [ ] No aparece la tabla tradicional
- [ ] Se muestra la vista de tarjetas

#### **✅ Header Informativo**

- [ ] Aparece el header azul con:
  - [ ] "📋 X unidades"
  - [ ] "X con ubicación válida"
  - [ ] Icono de vehículo a la derecha

#### **✅ Tarjetas de Unidades**

Para cada tarjeta verificar:

- [ ] **Patente**: Destacada en color azul con icono de auto
- [ ] **Estado Motor**: Chip verde (encendido) o rojo (apagado)
- [ ] **Empresa**: Texto en la primera columna
- [ ] **Velocidad**: Chip azul (>0 km/h) o gris (0 km/h)
- [ ] **Conductor**: Nombre visible
- [ ] **Dirección**: En área gris con icono de ubicación

#### **✅ Funcionalidad de Expansión**

- [ ] Botón "Más detalles" visible al final de cada tarjeta
- [ ] Al hacer clic se expande mostrando:
  - [ ] Marca/Modelo
  - [ ] Llave
  - [ ] Estado detallado
  - [ ] Geocerca
  - [ ] Coordenadas (formato monospace)
  - [ ] Botón "Ver en Google Maps"
- [ ] Botón cambia a "Menos detalles"
- [ ] Animación suave de expansión/contracción

#### **✅ Interactividad**

- [ ] **Scroll**: Funciona correctamente en la lista
- [ ] **Tap**: Respuesta táctil apropiada
- [ ] **Google Maps**: Abre en nueva pestaña
- [ ] **Hover effects**: Sombra y borde al tocar

#### **✅ Footer Instructivo**

- [ ] Aparece al final: "💡 Toca 'Más detalles' para ver información completa"
- [ ] Estilo discreto en fondo gris

### 5. **Comparación con Vista Desktop**

#### **Cambiar a Vista Desktop:**

1. En DevTools, seleccionar "Responsive"
2. Cambiar ancho a > 600px (ej: 1200x800)
3. Verificar que aparece la tabla tradicional

#### **Verificar:**

- [ ] **>600px**: Muestra tabla tradicional
- [ ] **≤600px**: Muestra vista de tarjetas
- [ ] **Transición**: Cambio automático al redimensionar

### 6. **Pruebas de Funcionalidad Completa**

#### **Flujo Completo:**

1. [ ] Abrir modal en móvil
2. [ ] Seleccionar alcance (seleccionadas/toda la flota)
3. [ ] Hacer clic "Actualizar"
4. [ ] Verificar que las tarjetas se rendericen correctamente
5. [ ] Expandir algunas tarjetas
6. [ ] Hacer clic "Solicitar Informe"
7. [ ] Verificar progreso de geocoding
8. [ ] Verificar notificación sonora (si hay permisos)
9. [ ] Descargar Excel
10. [ ] Cerrar modal

#### **Estados a Probar:**

- [ ] **Sin unidades**: Debe mostrar alerta de advertencia
- [ ] **Cargando**: Spinner centrado
- [ ] **Con datos**: Tarjetas renderizadas
- [ ] **Geocoding en progreso**: Barra de progreso
- [ ] **Geocoding completado**: Botón de descarga Excel

### 7. **Pruebas de Performance**

#### **Con Muchas Unidades (50+):**

- [ ] **Scroll suave**: No lag al hacer scroll
- [ ] **Expansión rápida**: Tarjetas se abren sin delay
- [ ] **Memoria**: DevTools -> Memory (no leaks)

#### **Con Pocas Unidades (<10):**

- [ ] **Layout correcto**: Footer aparece en posición apropiada
- [ ] **Espaciado**: No hay espacios excesivos

### 8. **Pruebas de Dispositivos Reales**

#### **Dispositivos para probar:**

- [ ] **iPhone** (Safari)
- [ ] **Android** (Chrome)
- [ ] **Tablet** en orientación portrait (debería usar vista móvil)
- [ ] **Tablet** en orientación landscape (puede usar vista desktop)

#### **Verificaciones específicas:**

- [ ] **Touch targets**: Botones suficientemente grandes
- [ ] **Legibilidad**: Texto claro y contrastado
- [ ] **Scroll natural**: Comportamiento nativo del dispositivo

## 🐛 Problemas Comunes y Soluciones

### **❌ No se muestra vista móvil**

- **Verificar**: Ancho de pantalla < 600px
- **Solución**: Ajustar viewport en DevTools

### **❌ Tarjetas muy estrechas**

- **Verificar**: Padding del contenedor padre
- **Solución**: Revisar `sx={{ pr: 1 }}` en el contenedor

### **❌ Expansión no funciona**

- **Verificar**: Estado `expanded` en React DevTools
- **Solución**: Verificar que `setExpanded` se ejecute

### **❌ Google Maps no abre**

- **Verificar**: URL generada en consola
- **Solución**: Verificar coordenadas válidas

### **❌ Layout roto en landscape**

- **Verificar**: Orientación del dispositivo
- **Solución**: Puede ser comportamiento esperado

## 📊 Criterios de Éxito

### **✅ Funcionalidad**

- Vista móvil se activa automáticamente
- Todas las tarjetas renderizan correctamente
- Expansión/contracción funciona
- Google Maps abre correctamente

### **✅ UX**

- Información fácil de leer
- Navegación intuitiva
- Touch targets apropiados
- Feedback visual claro

### **✅ Performance**

- Scroll fluido con muchas unidades
- Transiciones suaves
- Sin memory leaks

### **✅ Compatibilidad**

- Funciona en múltiples navegadores
- Responsive design correcto
- Degradación elegante

---

**Última actualización**: 20 de junio de 2025
**Tester**: [Nombre del tester]
**Resultado**: ✅ PASS / ❌ FAIL
