# FullControl GPS -- Estado Actual del Sistema y Migración Backend v2

## Contexto General

FullControl GPS es una plataforma de rastreo satelital con múltiples
componentes:

### Componentes principales

1.  Módulo de comunicación (Core del sistema)

    -   Java 17 + Spring Boot
    -   UDP Server (4097)
    -   API REST (8090)
    -   Admin (8080)
    -   PostgreSQL
    -   RabbitMQ
    -   Redis
    -   Quartz
    -   Docker

    ⚠️ No se toca por ahora.

2.  Backend legacy

    -   PHP 5.4.16
    -   Apache (httpd 2.4.6 CentOS)
    -   Endpoints tipo: /servicio/informes.php/ranking
    -   Autenticación por cookie simple

3.  Frontend rastreo en tiempo real

    -   Nuevo
    -   Funciona correctamente

4.  Frontend informes (legacy)

    -   Grunt + Angular antiguo

5.  Infraestructura

    -   AWS EC2
    -   RDS PostgreSQL
    -   Application Load Balancer (ALB)
    -   Apache reverse proxy

------------------------------------------------------------------------

## Problema Detectado

-   Dependencia de desarrollador lento
-   Backend legacy difícil de modificar
-   Necesidad de modernización
-   Futuro con integración de IA

------------------------------------------------------------------------

## Estrategia Implementada

Crear backend paralelo v2 sin reemplazar el legacy.

Objetivo: - Migración gradual - Sin downtime - Rollback inmediato

------------------------------------------------------------------------

## Implementación Técnica Realizada

### Backend v2

Ubicación: /opt/fullcontrol/api-v2

Tecnología: - Node.js 16.18.1 - Express - systemd

Puerto interno: 3001

Health: GET /servicio/v2/health

------------------------------------------------------------------------

### Integración ALB

Se creó Target Group: Target-Back-v2

Health check: /servicio/v2/health

Regla Listener HTTPS 443:

IF path /servicio/v2/\* THEN forward → Target-Back-v2

Verificación: curl
https://plataforma.fullcontrolgps.com.ar/servicio/v2/health → HTTP 200
OK

------------------------------------------------------------------------

## Arquitectura Actual

Cliente ↓ ALB 443 ↓ /servicio/v2/\* → Express 3001 Else → Apache + PHP
80

------------------------------------------------------------------------

## Pendientes

1.  Ordenar estructura del backend v2
2.  Middleware de autenticación por cookie
3.  Migrar endpoint ranking
4.  Logging centralizado
5.  Variables de entorno
6.  Plan IA futuro

------------------------------------------------------------------------

## Conclusión

-   Backend v2 operativo en producción
-   Sistema estable
-   Arquitectura preparada para evolución
-   Base lista para integración futura de IA

Estado: 🟢 Estable 🟢 Backend v2 activo 🟢 ALB configurado 🟢 Health
funcionando
