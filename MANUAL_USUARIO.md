# Manual del Usuario - FullControl GPS

## Bienvenido a FullControl GPS

FullControl GPS es una plataforma web moderna y fácil de usar que le permite monitorear su flota de vehículos en tiempo real desde cualquier dispositivo con conexión a internet.

## Acceso al Sistema

### Ingreso a la Plataforma

1. **Abrir el navegador web** (Chrome, Firefox, Safari, Edge)
2. **Navegar a la dirección**: https://plataforma.fullcontrolgps.com.ar
3. **Ingresar sus credenciales**:
   - Usuario: Su nombre de usuario asignado
   - Contraseña: Su contraseña personal

> **¿Olvidó su contraseña?** Haga clic en "Olvidaste tu password?" para obtener ayuda vía WhatsApp

### Primer Acceso

- Al ingresar por primera vez, verá un mensaje de bienvenida
- El sistema se adapta automáticamente a su dispositivo (computadora, tablet o celular)

## Pantalla Principal

### Vista del Mapa

Al ingresar, verá un mapa interactivo que muestra:

- **Ubicación actual** de todos sus vehículos
- **Estado de cada unidad** mediante colores:
  - 🟢 **Verde**: Vehículo encendido y reportando
  - 🔴 **Rojo**: Vehículo apagado pero reportando
  - ⚫ **Gris**: Vehículo sin reportar (más de 24 horas)

### Información de Usuario

En la esquina superior derecha encontrará:

- Su nombre de usuario
- Menú principal (ícono de hamburguesa ☰)

## Selección de Vehículos

### Selector de Unidades

En la parte superior izquierda encontrará el botón "Seleccionar Unidades":

1. **Hacer clic** en el botón
2. **Buscar vehículos** usando el campo de búsqueda
3. **Seleccionar/deseleccionar** usando los interruptores
4. **Seleccionar todos** con el interruptor superior

### Selector de Flotas (si aplica)

Si tiene flotas configuradas:

1. Haga clic en el ícono de vehículo 🚗
2. Seleccione la flota deseada
3. Todas las unidades de esa flota se mostrarán automáticamente

## Información Detallada de Vehículos

### Ver Detalles de una Unidad

Haga clic en cualquier marcador del mapa para ver:

- **Información básica**: Patente, empresa, estado del motor
- **Ubicación**: Velocidad, área, enlace a Google Maps
- **Detalles técnicos**: Marca, modelo, ID del equipo
- **Conductor** (si está asignado)

### Opciones Disponibles

Desde la ventana de detalles puede:

- **Ver histórico**: Acceder al historial de movimientos
- **Ver contratos**: Consultar obras asignadas al vehículo
- **Ver conductor**: Información del conductor asignado

## Alertas de Unidades en Ralentí ⭐ NUEVO

### ¿Qué es el Sistema de Alertas de Ralentí?

El sistema detecta automáticamente vehículos que se encuentran en estado de ralentí (motor encendido pero sin movimiento), permitiendo optimizar el consumo de combustible y mejorar la gestión operativa de su flota.

### Cómo Funciona la Alerta

#### Ubicación Visual

- **Posición**: Panel flotante en la parte izquierda de la pantalla
- **Ícono**: Tablero de salidas con badge rojo mostrando cantidad de unidades
- **Estados visuales**:
  - **Contraído**: Círculo con ícono + badge con número
  - **Expandido en hover**: Muestra "Unidades en ralentí"
  - **Lista desplegada**: Panel completo con detalles

#### Detección Automática

El sistema identifica unidades en ralentí basándose en:

- **Estados detectados**:
  - "Inicio Ralenti" → 🟠 Naranja
  - "Reporte en Ralenti" → 🟠 Naranja (< 5 min) / 🔴 Rojo (≥ 5 min)
  - "Fin de Ralenti" → 🔘 Gris (si motor encendido)
- **Filtros inteligentes**:
  - Excluye reportes de más de 12 horas
  - Elimina "fin de ralentí" con motor apagado
  - Timeout automático sin actualizaciones

### Información Mostrada

#### Formato de Lista (2 líneas por unidad)

```
AF-162-EE - OPS SRL                    [00:17:12]
[Reporte en Ralentí]          👤 Luccioni Jesus
```

**Primera línea**: Patente - Empresa + tiempo transcurrido  
**Segunda línea**: Estado actual + conductor asignado

#### Sistema de Colores por Estado

- **🟠 Naranja**: Inicio de ralentí o reporte menor a 5 minutos
- **🔴 Rojo**: Reporte en ralentí de 5 minutos o más (requiere atención)
- **🔘 Gris**: Fin de ralentí con motor aún encendido

### Funciones Interactivas

#### Selección de Unidades

1. **Hacer clic** en cualquier unidad de la lista
2. **El mapa se centrará** automáticamente en esa unidad
3. **Se mostrará en UnitDetails** la información completa
4. **Mantiene otras unidades seleccionadas** previamente

#### Ordenamiento Inteligente

- **Por tiempo** (predeterminado): Unidades con más tiempo en ralentí arriba
- **Por patente**: Orden alfabético
- **Botón de ordenamiento**: Solo visible cuando la lista está abierta
- **Cambio fácil**: Clic en el botón cambia entre modos

#### Sistema de Ignorados Temporal

- **Ícono de ojo**: Hacer clic para ocultar temporalmente una unidad
- **Ícono de ojo tachado**: Mostrar unidades previamente ocultas
- **Posición**: Unidades ignoradas aparecen al final en gris
- **Limpieza automática**: Se elimina cuando la unidad sale de ralentí

### Contador de Tiempo Avanzado

#### Características del Temporizador

- **Basado en fechaHora del GPS**: No depende de la hora local
- **Acumulación inteligente**: Suma tiempo entre actualizaciones
- **Formato reloj**: HH:MM:SS (ej: 01:23:45)
- **Cambio de color automático**: Naranja → Rojo a los 5 minutos
- **Persistencia**: Se mantiene durante toda la sesión

#### Limpieza Automática

- **1 hora sin updates**: Unidad removida automáticamente
- **Fin de ralentí**: Timer se resetea y unidad desaparece
- **Prevención histórica**: No muestra datos antiguos de más de 12 horas

### Casos de Uso Prácticos

#### Para Gestores de Flota

- **Identificar vehículos** consumiendo combustible innecesariamente
- **Optimizar operaciones** reduciendo tiempos de espera
- **Monitoreo en tiempo real** de eficiencia operativa

#### Para Supervisores

- **Contactar conductores** cuando excedan 5 minutos en ralentí
- **Planificar rutas** más eficientes
- **Generar reportes** de optimización de combustible

#### Ejemplos de Estados

**Situación Normal**:

```
🟠 Inicio Ralenti [00:02:30] → Acabó de llegar a destino
```

**Requiere Atención**:

```
🔴 Reporte en Ralenti [00:07:15] → Contactar conductor
```

**Finalizando**:

```
🔘 Fin de Ralenti [00:12:45] → Ya no consume combustible extra
```

### Consejos de Uso

#### Mejores Prácticas

- **Monitoree regularmente** durante horarios operativos
- **Establezca protocolos** para unidades que excedan 5 minutos
- **Use la función de ignorar** para unidades que requieren espera justificada
- **Aproveche el ordenamiento** por tiempo para priorizar acciones

#### Optimización de Combustible

- **Tiempo objetivo**: Máximo 3-5 minutos en ralentí por parada
- **Comunicación proactiva**: Contactar antes de llegar a rojo
- **Análisis de patrones**: Identificar puntos problemáticos recurrentes

### Integración con Otras Funciones

- **Compatible** con selección múltiple de unidades
- **No interfiere** con otros controles del mapa
- **Se adapta** automáticamente a dispositivos móviles
- **Funciona junto** con históricos y reportes

## Funciones del Menú Principal

### Histórico Avanzado

Genere reportes de múltiples días:

1. Seleccione un vehículo
2. Vaya al menú principal ☰
3. Seleccione "Histórico Avanzado"
4. Elija las fechas inicial y final
5. Descargue el reporte en Excel

### Informes Parciales

Genere informes por contrato:

1. Acceda desde el menú principal
2. Seleccione el contrato
3. Elija el mes o rango de fechas personalizado
4. Descargue el informe

### Certificado de Funcionamiento

Genere certificados oficiales:

1. Seleccione un vehículo
2. Vaya al menú → "Certificado de Funcionamiento"
3. Complete los datos requeridos
4. Descargue el certificado en PDF

### Gestión de Flotas

Organice sus vehículos en grupos:

1. Acceda desde el menú → "Flotas"
2. **Crear nueva flota**: Botón verde +
3. **Asignar vehículos**: Seleccione de las listas disponibles
4. **Administrar**: Agregar/quitar vehículos de flotas existentes

## Vista de Histórico

### Acceder al Histórico

1. **Seleccione un vehículo** en el mapa
2. **Haga clic en "HISTORICO"** en la ventana de detalles
3. **Seleccione la fecha** que desea consultar

### Información Mostrada

- **Ruta recorrida** en el mapa con líneas de colores
- **Puntos de parada** marcados especialmente
- **Velocidad** en cada tramo del recorrido
- **Horarios** de inicio y fin de viaje

### Detalles del Histórico

En dispositivos móviles, deslice hacia arriba para ver:

- **Tabla detallada** con eventos, horarios y direcciones
- **Búsqueda** dentro de los eventos
- **Información completa** de cada punto registrado

### Exportar Histórico

Desde la vista de histórico puede:

- **Exportar a Excel**: Datos completos en formato de hoja de cálculo
- **Exportar a Google Earth**: Archivo KML para visualizar en Google Earth

## Tipos de Mapas

Puede cambiar el tipo de mapa desde el control en la esquina inferior derecha:

- **OpenStreetMap**: Mapa estándar
- **Esri Satellite**: Vista satelital
- **Google Maps**: Mapa de Google
- **Google Satélite**: Vista satelital de Google

## Funciones por Tipo de Usuario

### Usuario Estándar

- Ver vehículos asignados
- Generar reportes básicos
- Acceder a históricos
- Descargar certificados

### Administrador

Funciones adicionales:

- **Ocultar unidades de baja**: Filtrar vehículos inactivos
- **Gestionar notificaciones**: Crear avisos para usuarios
- **Acceso completo**: Ver todas las funciones del sistema

## Consejos de Uso

### Navegación Eficiente

- **Zoom del mapa**: Use la rueda del mouse o gestos táctiles
- **Búsqueda rápida**: Use el buscador en el selector de unidades
- **Actualización automática**: Los datos se actualizan cada 30 segundos

### Mejores Prácticas

- **Mantenga actualizado** su navegador web
- **Use conexión estable** para mejor rendimiento
- **Cierre sesión** al terminar de usar el sistema
- **Guarde reportes** importantes en su dispositivo

### Dispositivos Móviles

- La interfaz se adapta automáticamente
- **Gestos táctiles** para navegar el mapa
- **Rotación de pantalla** soportada
- **Funciones completas** disponibles

## Interpretación de Estados

### Colores de Vehículos

- 🟢 **Verde**: Motor encendido, reportando normalmente
- 🔴 **Rojo**: Motor apagado, reportando normalmente
- ⚫ **Gris**: Sin reportar (revise conectividad del GPS)

### Indicadores de Tiempo

- **Tiempo real**: Datos de los últimos minutos
- **Último reporte**: Fecha y hora del último dato recibido
- **Estado del viaje**: Información del conductor actual

## Reportes y Descargas

### Tipos de Reportes Disponibles

1. **Histórico diario**: Un día específico en Excel/KML
2. **Histórico avanzado**: Múltiples días en Excel
3. **Informes parciales**: Por contrato y período
4. **Certificados**: Documentos oficiales en PDF
5. **Reporte de Posición Actual**: Ubicación actual de unidades con geocodificación

### Reporte de Posición Actual ⭐ NUEVO

Esta función permite generar un reporte Excel con la ubicación actual de todas las unidades:

#### Cómo Generar el Reporte

1. **Acceso**: Desde el menú principal ☰ → "Informes de Posición"
2. **Selección**: Elija entre:
   - **Unidades seleccionadas**: Solo las unidades que tiene marcadas
   - **Toda la flota**: Todas las unidades de su cuenta
3. **Geocodificación**: El sistema convertirá automáticamente las coordenadas GPS a direcciones legibles
4. **Descarga**: Recibirá un archivo Excel completo

#### Características del Archivo Excel

**Nombre de archivo con timestamp:**

- Formato: `Reporte_Posicion_Actual_[Tipo]_DD_MM_AAAA_HH_MM.xlsx`
- Ejemplo: `Reporte_Posicion_Actual_Seleccionadas_20_06_2025_14_30.xlsx`

**Contenido del reporte:**

- Timestamp de generación en formato 24 horas (ej: "20/06/2025, 14:30:55")
- Datos de cada unidad: patente, empresa, ubicación, dirección, coordenadas
- Filtros y ordenamiento habilitados para análisis
- Protección contra edición accidental (password: "password")

#### Ventajas del Nuevo Sistema

- ✅ **Organización temporal**: Archivos únicos por fecha y hora
- ✅ **Formato 24 horas**: Sin ambigüedad AM/PM
- ✅ **Protección de datos**: Previene modificaciones accidentales
- ✅ **Geocodificación inteligente**: Direcciones completas automáticamente
- ✅ **Análisis facilitado**: Ordenar y filtrar sin restricciones

### Formato de Archivos

- **Excel (.xlsx)**: Para análisis de datos (con protección y timestamps)
- **KML**: Para Google Earth y aplicaciones GIS
- **PDF**: Para certificados oficiales

### Notificaciones de Finalización

Cuando genere reportes de posición, el sistema le notificará:

- **Sonido de finalización**: Melodía distintiva al completar el proceso
- **Notificación del navegador**: Si tiene permisos habilitados
- **Mensaje en pantalla**: Confirmación visual del proceso

> **Tip**: Para reportes grandes (más de 50 unidades), el proceso puede tomar varios minutos. Active las notificaciones para ser avisado cuando termine.

## Soporte y Ayuda

### Contacto

- **WhatsApp**: +54 9 299 466-7595
- **Ayuda con contraseña**: Enlace directo desde login
- **Ayuda con usuario**: Enlace directo desde login

### Problemas Comunes

#### No veo mis vehículos

1. Verifique su conexión a internet
2. Actualice la página (F5)
3. Verifique que los vehículos estén encendidos

#### El mapa no carga

1. Verifique su conexión
2. Pruebe cambiar el tipo de mapa
3. Actualice su navegador

#### No puedo generar reportes

1. Seleccione un vehículo primero
2. Verifique las fechas seleccionadas
3. Espere a que termine la descarga

## Actualizaciones del Sistema

### Notificaciones Automáticas

- El sistema detecta automáticamente nuevas versiones
- Recibirá una notificación cuando haya actualizaciones
- Las actualizaciones mejoran funcionalidad y seguridad

### Nuevas Funciones

- Se notificarán las nuevas características
- Los cambios se documentan en cada actualización
- No requiere acción del usuario para actualizar

---

## Información Importante

- **Disponibilidad**: 24/7 los 365 días del año
- **Soporte**: Horario comercial de lunes a viernes
- **Actualizaciones**: Automáticas sin interrupciones
- **Seguridad**: Datos protegidos con encriptación

> **¿Necesita más ayuda?** No dude en contactarnos por WhatsApp para asistencia personalizada.

---

**Manual actualizado**: Julio 2025  
**Versión del sistema**: Consulte la aplicación para ver la versión actual  
**Última actualización**: Agregada funcionalidad de **Alertas de Unidades en Ralentí** con detección automática, contadores de tiempo y gestión inteligente para optimización de combustible
