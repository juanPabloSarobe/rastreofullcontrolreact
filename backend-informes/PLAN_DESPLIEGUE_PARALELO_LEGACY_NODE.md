# Plan de Despliegue Paralelo (Legacy PHP + Backend Node + Frontend Rastreo)

## 1) Objetivo

Desplegar el nuevo backend Node (`backend-informes`) y el nuevo `frontend-rastreo` **en paralelo** al stack legacy PHP, sin afectar:
- endpoints legacy `/servicio/*.php` y `/api/servicio/*`
- front productivo `https://plataforma.fullcontrolgps.com.ar`
- portal de informes `https://plataforma.fullcontrolgps.com.ar/informes/#/`
- panel admin (`/fulladm`)

Con rollback inmediato y sin corte de servicio.

---

## 2) Topología real detectada en producción

Basado en `backend-informes/datosProductionServer.md`:

- SO: CentOS 7
- Web server activo: Apache `httpd` (no nginx)
- PHP: `php5_module` (PHP 5.4.16, mod_php)
- VHosts:
  - `fullcontroldedicado.ddns.net` (legacy/no-ip, hoy redirigido; fuera de alcance)
  - `rastreo.rastreomimoto.com` (proyecto viejo; fuera de alcance)
- Dominio operativo objetivo del despliegue actual:
  - `plataforma.fullcontrolgps.com.ar` (front principal)
  - `plataforma.fullcontrolgps.com.ar/informes/#/` (informes)
- DocumentRoot principal: `/var/www/html`
- DocumentRoot rastreo: `/var/www/rastreomimoto`
- Proxy legacy existente:
  - `ProxyPass /servicio/api/ http://127.0.0.1:8090/api/`

Validación adicional (05/03/2026):
- `plataforma.fullcontrolgps.com.ar` no tiene `ServerName` explícito en Apache.
- Resuelve por vhost default de `*:80` (`fullcontroldedicado.conf`) con `DocumentRoot "/var/www/html"`.
- En `:443` responde el vhost `_default_:443` (`ssl.conf`) y devuelve el mismo `index` de `/var/www/html`.

Conclusión: la migración debe hacerse sobre Apache + mod_php, preservando rutas legacy actuales y concentrando cambios sólo en `plataforma.fullcontrolgps.com.ar` (hoy servido desde `/var/www/html`).

---

## 3) Estrategia de convivencia recomendada

## 3.1 Backend nuevo por subdominio dedicado (sin tocar legacy)

Publicar Node en `api-v2.fullcontrolgps.com.ar` (coherente con `frontend-rastreo/.env.production`):
- `VITE_API_NEW_BACKEND=https://api-v2.fullcontrolgps.com.ar`
- `VITE_API_OLD_BACKEND=https://plataforma.fullcontrolgps.com.ar`

Decisión operativa (05/03/2026):
- crear `api-v2.fullcontrolgps.com.ar` en el DNS oficial de `fullcontrolgps.com.ar` (no en No-IP), para mantener control centralizado y operación estable de backend híbrido.

Nota de resolución DNS (05/03/2026):
- `plataforma.fullcontrolgps.com.ar` resuelve por CNAME a `prod-alb-services-1420521065.us-east-1.elb.amazonaws.com`.
- Por lo tanto, para `api-v2` no se recomienda apuntar a una IP de instancia (`checkip`) ni a IPs efímeras del ALB.
- Recomendación: crear `api-v2.fullcontrolgps.com.ar` como CNAME al DNS del ALB y enrutar por Host Header en ALB/Apache.

Ventaja: no se pisan rutas PHP existentes; rollback es deshabilitar vhost/proxy nuevo.

## 3.2 Frontend rastreo (mínimo cambio recomendado)

Como `plataforma` hoy cuelga del vhost default y funciona estable, se recomienda **no cambiar vhosts ni DocumentRoot** en esta etapa.

Desplegar sobre `/var/www/html` con backup previo + rollback rápido.

Ventaja: cero cambios de routing Apache.

## 3.3 Legacy congelado funcionalmente

Durante la migración:
- no modificar `servicio/*.php`
- no modificar proxy legacy `/servicio/api/`
- no tocar `/informes` ni `/fulladm`
- no tocar ni borrar `fullcontroldedicado` ni `rastreo.rastreomimoto`

---

## 4) Implementación paso a paso

## Fase A — Preparación (sin impacto)

1. Backup de config Apache:
```bash
sudo mkdir -p /root/backup-httpd-$(date +%F-%H%M)
sudo cp -a /etc/httpd/conf /etc/httpd/conf.d /root/backup-httpd-$(date +%F-%H%M)/
```

2. Validación actual:
```bash
sudo httpd -S
sudo httpd -t
sudo systemctl status httpd --no-pager
```

3. Levantar backend Node interno en puerto privado (`127.0.0.1:3002`) con systemd.

Ejemplo unit file:
`/etc/systemd/system/backend-informes.service`
```ini
[Unit]
Description=Backend Informes Node
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/backend-informes
Environment=NODE_ENV=production
Environment=API_PORT=3002
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activación:
```bash
sudo systemctl daemon-reload
sudo systemctl enable backend-informes
sudo systemctl start backend-informes
sudo systemctl status backend-informes --no-pager
curl -i http://127.0.0.1:3002/servicio/v2/health
```

## Fase B — Exposición controlada API v2 (sin tocar legacy)

Crear vhost/conf dedicado para `api-v2.fullcontrolgps.com.ar`:
`/etc/httpd/conf.d/api-v2-fullcontrolgps.conf`

```apache
<VirtualHost *:443>
  ServerName api-v2.fullcontrolgps.com.ar

  SSLEngine on
  SSLCertificateFile /ruta/cert.pem
  SSLCertificateKeyFile /ruta/key.pem
  SSLCertificateChainFile /ruta/chain.pem

  ProxyPreserveHost On
  RequestHeader set X-Forwarded-Proto "https"

  ProxyPass        / http://127.0.0.1:3002/
  ProxyPassReverse / http://127.0.0.1:3002/

  ErrorLog  /var/log/httpd/api-v2-error.log
  CustomLog /var/log/httpd/api-v2-access.log combined
</VirtualHost>
```

Validar y aplicar:
```bash
sudo httpd -t
sudo systemctl reload httpd
curl -i https://api-v2.fullcontrolgps.com.ar/servicio/v2/health
```

## Fase C — Deploy frontend-rastreo en paralelo

1. Build en CI/local:
```bash
cd frontend-rastreo
npm ci
npm run build
```

2. Backup de web actual:
```bash
BACKUP=/var/www/backup-plataforma-$(date +%Y%m%d-%H%M%S)
sudo mkdir -p "$BACKUP"
sudo rsync -a /var/www/html/ "$BACKUP"/
```

3. Publicación del build en docroot actual:
```bash
sudo rsync -a --delete dist/ /var/www/html/
```

4. No tocar vhosts (se mantiene config actual).

5. Reload Apache:
```bash
sudo httpd -t
sudo systemctl reload httpd
```

## Fase D — Validación funcional

Checklist mínimo:
- Front nuevo carga en `plataforma.fullcontrolgps.com.ar`
- Módulos legacy siguen funcionando (`/api/servicio/equipos.php/lite`, login, histórico)
- Ralentí v2 responde desde `api-v2.fullcontrolgps.com.ar`
- `/informes` y `/fulladm` siguen intactos
- Sin errores críticos en:
  - `/var/log/httpd/error_log`
  - `/var/log/httpd/api-v2-error.log`

---

## 5) Rollback (2 minutos)

## 5.1 Rollback frontend

Volver symlink al release anterior:
```bash
sudo rsync -a --delete /var/www/backup-plataforma-<timestamp>/ /var/www/html/
sudo systemctl reload httpd
```

## 5.2 Rollback backend Node público

Deshabilitar conf de `api-v2` y recargar Apache:
```bash
sudo mv /etc/httpd/conf.d/api-v2-fullcontrolgps.conf /etc/httpd/conf.d/api-v2-fullcontrolgps.conf.off
sudo httpd -t
sudo systemctl reload httpd
```

Si hace falta, apagar servicio Node:
```bash
sudo systemctl stop backend-informes
```

## 5.3 Rollback total de Apache config

```bash
sudo cp -a /root/backup-httpd-<timestamp>/conf/* /etc/httpd/conf/
sudo cp -a /root/backup-httpd-<timestamp>/conf.d/* /etc/httpd/conf.d/
sudo httpd -t
sudo systemctl reload httpd
```

---

## 6) Riesgos reales y mitigación

1. **Colisión de rutas legacy/new**
   - Mitigación: separar por subdominio `api-v2`.

2. **CORS/cookies entre dominios**
   - Mitigación: validar `credentials`, `SameSite`, `Secure`, `Access-Control-Allow-Credentials`.

3. **Cambios manuales irreversibles en DocumentRoot**
   - Mitigación: deploy por release + symlink.

4. **Cambios inadvertidos en `/informes` o `/fulladm`**
   - Mitigación: no editar sus vhosts ni paths durante esta ventana.

---

## 7) Matriz de responsabilidades de corte

- Backend Node: owner técnico backend
- Apache/VHosts/SSL: owner infraestructura
- Frontend rastreo: owner frontend
- Go/No-Go final: validación conjunta (backend + frontend + infraestructura)

---

## 8) Comandos de verificación rápida

```bash
# Apache y vhosts
sudo httpd -t && sudo httpd -S

# Salud backend nuevo
curl -i https://api-v2.fullcontrolgps.com.ar/servicio/v2/health

# Legacy intacto
curl -I https://plataforma.fullcontrolgps.com.ar/api/servicio/equipos.php/lite
curl -I https://plataforma.fullcontrolgps.com.ar/informes/
curl -I https://plataforma.fullcontrolgps.com.ar/fulladm/
```

---

## 9) Decisión recomendada de salida

Aprobar despliegue paralelo con:
- backend nuevo por subdominio `api-v2`
- frontend productivo `plataforma.fullcontrolgps.com.ar` por actualización directa en `/var/www/html` con backup previo
- freeze de rutas legacy por toda la ventana de validación
- sin intervenir dominios legacy/deprecados (`fullcontroldedicado`, `rastreo.rastreomimoto`)

Esta estrategia minimiza riesgo, evita romper producción actual y permite rollback inmediato.

---

## 10) Bitácora de ejecución real (05/03/2026)

### 10.1 Alcance real ejecutado

- Se confirmó que el entorno productivo operativo es:
  - `https://plataforma.fullcontrolgps.com.ar`
  - `https://plataforma.fullcontrolgps.com.ar/informes/#/`
- Se dejó fuera de alcance operativo:
  - `fullcontroldedicado.ddns.net`
  - `rastreo.rastreomimoto.com`

### 10.2 Hallazgos clave durante el corte

1. El dominio público `api-v2.fullcontrolgps.com.ar` resolvía al ALB correcto, pero inicialmente devolvía servicio viejo (`fullcontrol-api-v2`).
2. Se verificó forensemente que requests públicas a `api-v2` no llegaban al Apache local (prueba con `rid` único en query + `grep` en `api-v2-access.log`).
3. En ALB (`prod-alb-services`) existía regla por ruta `/servicio/v2/*` hacia target group viejo en puerto `3001`.

### 10.3 Cambios aplicados (sin cortar legacy)

1. **Backend nuevo en shadow mode (misma EC2 productiva):**
   - Repo: `/opt/deploy/rastreofullcontrolreact/backend-informes`
   - Puerto: `3003`
   - Validado localmente:
     - `curl http://127.0.0.1:3003/servicio/v2/health`
     - `curl http://<ip-privada>:3003/servicio/v2/health`
   - Resultado: `ok=true`, servicio `fullcontrol-backend-informes-v2`, DB conectada.

2. **Apache para `api-v2`:**
   - VHost dedicado en `/etc/httpd/conf.d/zzz-api-v2-fullcontrolgps.conf`
   - Proxy a `http://127.0.0.1:3003/`
   - Se agregó regla para health de raíz (`/`) hacia `/servicio/v2/health` para compatibilidad de chequeos.
   - Validación: `httpd -t` y `systemctl reload httpd` OK.

3. **ALB (cambio definitivo de enrutamiento sin borrar lo viejo):**
   - Se creó target group nuevo: `Target-Back-v2-3003` (HTTP:3003).
   - Health check del TG: `GET /servicio/v2/health` con `200`.
   - Se registró la instancia `i-061ac6edbeef9e8da` en `3003`.
   - Se agregó regla nueva en listener `HTTPS:443`:
     - condición `Host header = api-v2.fullcontrolgps.com.ar`
     - acción `Forward -> Target-Back-v2-3003`
     - prioridad por encima de la regla legacy de ruta `/servicio/v2/*`.
   - **No** se eliminaron reglas ni target groups legacy (`3001`).

### 10.4 Validaciones de salida (Go-Live)

- Health público repetido (12/12):
  - `curl -sk https://api-v2.fullcontrolgps.com.ar/servicio/v2/health`
  - Resultado estable: `service=fullcontrol-backend-informes-v2`.

- Endpoint funcional de negocio:
  - `curl -sk "https://api-v2.fullcontrolgps.com.ar/api/ralentis-v2/all?limit=1"`
  - Resultado: `ok=true`, `count=1`, datos válidos.

- Validación manual en navegador:
  - Plataforma completa operativa, sin regresiones visibles reportadas.

### 10.5 Estado final de producción

- `api-v2.fullcontrolgps.com.ar` apunta al backend nuevo (`3003`) por regla de host en ALB.
- Backend viejo (`3001`) continúa disponible como contingencia.
- No se reportaron impactos en `plataforma`, `/informes` ni `/fulladm` durante la ventana.

### 10.6 Rollback express aplicado a este esquema

Si aparece un incidente en `api-v2`:

1. Ir a `ALB > HTTPS:443 > Rules`.
2. Deshabilitar/eliminar la regla:
   - `Host=api-v2.fullcontrolgps.com.ar -> Target-Back-v2-3003`.
3. Mantener activa la regla legacy existente (`/servicio/v2/* -> Target-Back-v2` puerto `3001`).

Efecto esperado: retorno inmediato del dominio `api-v2` al backend previo.

### 10.7 Recomendación post-corte (estabilización)

- Mantener coexistencia `3001` + `3003` por 24-48 horas.
- Monitorear:
  - `api-v2-access.log`, `api-v2-error.log`, `error_log`
  - métricas de ALB (5xx, target health, latencia)
  - comportamiento funcional de módulos críticos.
- Si no hay incidentes, planificar retiro controlado de regla/TG legacy en ventana posterior.

---

## 11) Operación continua: cómo subir cambios del backend sin problemas

### 11.1 Regla de oro

Nunca desplegar directo sobre el backend estable. Siempre usar esquema:

1. build/validación,
2. shadow port,
3. smoke test,
4. cutover por ALB,
5. observación,
6. limpieza diferida.

### 11.2 Checklist obligatorio previo a cada release

En rama de release/local:

```bash
cd backend-informes
git pull
npm ci
npm run check:runtime
npm run lint
```

Si falla `check:runtime`, no avanzar a producción.

### 11.3 Política de versiones Node/npm

- Node mínimo soportado: `18.18.0`
- npm mínimo soportado: `9.0.0`
- Verificador oficial del proyecto: `npm run check:runtime`

Motivo: evitar incompatibilidades por features modernas en runtimes viejos.

### 11.4 Procedimiento resumido de actualización en prod

1. `git pull` + `npm ci` en servidor.
2. Validar runtime (`npm run check:runtime`).
3. Levantar nueva versión en puerto de shadow (ejemplo `3003`) manteniendo estable (`3001`).
4. Validar:
  - `http://127.0.0.1:3003/servicio/v2/health`
  - `http://<ip-privada>:3003/servicio/v2/health`
5. Asociar target group nuevo al ALB y esperar `Healthy`.
6. Mover tráfico con regla específica de host (`api-v2`) al target group nuevo.
7. Observar 24-48h antes de retirar legado.

### 11.5 Rollback operativo

Ante incidente:

1. deshabilitar/eliminar regla host nueva en ALB,
2. mantener regla legacy/target group anterior,
3. analizar logs y corregir,
4. reintentar en nueva ventana.