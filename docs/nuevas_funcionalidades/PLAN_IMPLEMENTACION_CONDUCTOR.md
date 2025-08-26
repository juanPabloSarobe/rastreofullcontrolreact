1 # PLAN DE IMPLEMENTACIÓN - HISTÓRICO POR CONDUCTOR

**Referencia:** `RECORRIDOS_HISTORICOS_CONDUCTOR_TECNICO.md`
**Fecha:** 25/08/2025

## 🎯 OBJETIVO

Crear funcionalidad de histórico por conductor como vista completa (NO modal).

## 📋 PLAN - 8 PASOS SIMPLES

### **FASE 1: COMPONENTES VISUALES**

**✅ Paso 1: Botón circular**

- Crear `ConductorHistoryButton.jsx` en `/common`
- Posicionar junto a FleetSelectorButton
- Solo cambiar `viewMode = "conductor"`

**✅ Paso 2: Vista base**

- Crear `ConductorHistoryView.jsx` en `/pages`
- Dropdown conductor + dropdown mes + switch avanzado
- Solo maqueta visual con datos mock

**✅ Paso 3: Integrar en PrincipalPage**

- Renderizado condicional `viewMode === "conductor"`
- Botón volver → `viewMode = "rastreo"`

**✅ Paso 4: Layout resultados**

- Layout horizontal: lista vehículos + calendario
- Radio buttons + calendario con días habilitados/deshabilitados

### **FASE 2: FUNCIONALIDAD**

**⏳ Paso 5: Context y estados**

- Modificar Context.jsx con nuevos estados
- Mock conductores en login

**⏳ Paso 6: Endpoints reales**

- Conectar `/vehiculosPorConductor/`
- Selección vehículo → actualización calendario

**⏳ Paso 7: Integración mapa**

- Click día → endpoint histórico
- Reutilizar HistoricalMarkers + HistoricalDetailView

**⏳ Paso 8: Histórico Avanzado**

- Crear `ConductorAdvancedHistoryModal.jsx`
- Agregar en MenuButton.jsx

## 🔧 DATOS MOCK

```javascript
const mockConductores = {
  Permisos: [
    {
      idCon: 11777,
      nombre: "Abad Francisco",
      empresa: "OPS SRL",
      dni: 12345678,
      telefono: "+5492996911111",
      email: "abad@gmail.com",
    },
    {
      idCon: 13845,
      nombre: "Abel Jorge Navarrete",
      empresa: "OPS SRL",
      dni: 87654321,
      telefono: "+5492996922222",
      email: "jorge@gmail.com",
    },
  ],
};
```

## 🎯 FLUJO FINAL

1. Vista rastreo → Click botón → Vista conductor
2. Selecciona conductor + período → Muestra vehículos + calendario disabled
3. Selecciona vehículo → Calendario se habilita con días disponibles
4. Click día → Muestra recorrido en mapa
5. Botón X → Vuelve a rastreo

## 📌 NOTAS

- Endpoint `/permisosConductores/215` usar MOCK hasta funcionar
- Todos los demás endpoints están funcionando
- Histórico Avanzado: item separado en MenuButton
- Layout horizontal para desktop, mobile pendiente
