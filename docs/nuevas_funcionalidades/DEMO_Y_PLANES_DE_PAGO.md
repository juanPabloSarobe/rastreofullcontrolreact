# NUEVAS FUNCIONALIDADES: DEMO Y PLANES DE PAGO

## Introducción

Con el objetivo de incentivar a los usuarios a suscribirse a planes superiores, se implementará una funcionalidad de "Demo" que permitirá a los usuarios explorar parcialmente las nuevas funcionalidades disponibles en los planes más altos. Esto les permitirá entender el valor agregado de dichas funcionalidades antes de comprometerse a un cambio de plan.

---

## Estrategia de Implementación

### 1. **Acceso Limitado a la Funcionalidad**

- **Tiempo Limitado**: Los usuarios podrán probar la funcionalidad durante un período específico (por ejemplo, 7 días).
- **Uso Limitado**: Restringir el número de veces que pueden usar la funcionalidad (por ejemplo, 3 usos gratuitos).

**Implementación**:

- Al acceder a la funcionalidad, verificar si el usuario tiene acceso completo o si está en modo demo.
- Mostrar un contador o mensaje indicando cuánto tiempo o cuántos usos le quedan.

---

### 2. **Datos Simulados**

- Si la funcionalidad implica datos (como reportes históricos o alertas avanzadas), se mostrarán datos simulados o de ejemplo.
- Esto permitirá que los usuarios vean cómo funciona la funcionalidad sin acceder a sus datos reales.

**Ejemplo**:

- Mostrar un reporte histórico con datos ficticios y un mensaje como: "Este es un ejemplo de cómo se vería tu reporte histórico con el Plan Premium".

---

### 3. **Modal de Actualización**

- Al intentar usar la funcionalidad más allá del límite de la demo, se mostrará un modal con:
  - Una descripción de la funcionalidad.
  - Los beneficios del plan superior.
  - Un botón para actualizar el plan.

**Contenido del Modal**:

- **Título**: "Actualiza tu Plan para Acceder a esta Funcionalidad"
- **Descripción**: "Con el Plan Premium, podrás acceder a reportes históricos detallados y alertas avanzadas."
- **Botón**: "Actualizar Ahora"

---

### 4. **Indicadores Visuales**

- Mostrar un ícono de candado o un mensaje en las funcionalidades bloqueadas.
- Cambiar el estilo visual (por ejemplo, deshabilitar botones o usar colores atenuados) para indicar que están en modo demo o bloqueadas.

---

### 5. **Página de Comparación de Planes**

- Crear una página que compare los planes disponibles, destacando las funcionalidades exclusivas de cada uno.
- Incluir un botón de "Actualizar" en cada plan.

---

### 6. **Seguimiento de Uso**

- Registrar cuántas veces los usuarios acceden a la demo.
- Si un usuario usa la demo frecuentemente, enviarle notificaciones o correos electrónicos para invitarlo a actualizar su plan.

---

### 7. **Notificaciones Proactivas**

- Mostrar banners o notificaciones dentro de la plataforma para informar a los usuarios sobre las nuevas funcionalidades y cómo acceder a ellas.

**Ejemplo**:

- "¡Nuevas Funcionalidades Disponibles! Prueba las alertas avanzadas y los reportes históricos con el Plan Premium."

---

### **8. Proceso de Invitación a Suscribirse**

#### **Visualización de Nuevas Funcionalidades**

- Las nuevas funcionalidades estarán visibles en la interfaz con un indicador (por ejemplo, un ícono de "Nuevo").
- Los usuarios podrán interactuar con estas funcionalidades durante un tiempo limitado por sesión (por ejemplo, 15 minutos).

#### **Restricción por Tiempo**

- Una vez que el tiempo de prueba por sesión haya expirado:
  - Mostrar un mensaje indicando que el tiempo de prueba ha finalizado.
  - Bloquear temporalmente el acceso a la funcionalidad.
- El usuario deberá esperar un período de 48 o 72 horas antes de volver a probar la funcionalidad.

#### **Modal de Invitación**

- Al finalizar el tiempo de prueba o al intentar acceder nuevamente antes de que pase el período de espera, se mostrará un modal con:
  - Una descripción de las nuevas funcionalidades.
  - Los beneficios de suscribirse a un plan superior.
  - Un botón para "Solicitar Actualización".

#### **Generación de Solicitud vía WhatsApp**

- Si el usuario acepta la invitación, se generará un mensaje de WhatsApp que se enviará automáticamente al número de contacto de la empresa.
- El mensaje incluirá:
  - El nombre del cliente o empresa.
  - El plan actual.
  - La funcionalidad que desea activar.
  - Un mensaje predefinido como: "Hola, estoy interesado en actualizar mi plan para acceder a las nuevas funcionalidades."

#### **Registro en la Base de Datos**

- Registrar en la base de datos:
  - La fecha y hora en que el usuario utilizó la funcionalidad.
  - El tiempo restante para volver a probarla.
  - Si ya ha solicitado una actualización.

#### **Flujo de Usuario Propuesto**

1. El usuario ve las nuevas funcionalidades y las utiliza durante el tiempo permitido.
2. Al finalizar el tiempo, se muestra un modal indicando que el tiempo de prueba ha terminado y que puede volver a probar en 48/72 horas.
3. Si intenta acceder antes de que pase el período de espera, se muestra el modal de invitación.
4. Si acepta, se genera y envía un mensaje de WhatsApp con la solicitud de actualización.
5. El equipo comercial recibe la solicitud y se pone en contacto con el cliente.
