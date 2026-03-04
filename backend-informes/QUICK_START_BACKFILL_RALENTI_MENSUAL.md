# Quick Start - Backfill Ralentí Mensual (Servidor)

Este flujo está pensado para ejecutarse en EC2/servidor (no local), en segundo plano, con logs persistentes.

## 1) Entrar al servidor

```bash
ssh -i TU_CLAVE.pem ec2-user@TU_HOST
cd /ruta/backend-informes
```

## 2) Verificar que el backend arranca y tiene secretos

```bash
npm run start
```

Si arranca, cortar con `Ctrl + C`.

## 3) Ejecutar enero en segundo plano (recomendado)

```bash
nohup npm run backfill:ralenti:month -- \
  --month 2026-01 \
  --concurrency 5 \
  --chunk-size 80 \
  --lock-key 95012026 \
  > logs/backfill-ralenti-2026-01.log 2>&1 &
```

Antes, crear carpeta de logs si no existe:

```bash
mkdir -p logs
```

## 4) Monitorear progreso y ETA

```bash
tail -f logs/backfill-ralenti-2026-01.log
```

Buscar líneas:
- `[BACKFILL] Chunk ...`
- `[BACKFILL] FINAL_SUMMARY ...`

## 5) Ver resumen final

El script guarda un resumen JSON en:

- `tmp/backfill-summary-2026-01.json`

Ejemplo:

```bash
cat tmp/backfill-summary-2026-01.json
```

## 6) Si necesitás frenar

```bash
ps aux | grep backfill-ralenti-month | grep -v grep
kill <PID>
```

## 7) Correr febrero/marzo

```bash
nohup npm run backfill:ralenti:month -- --month 2026-02 --concurrency 5 --chunk-size 80 --lock-key 95012026 > logs/backfill-ralenti-2026-02.log 2>&1 &
nohup npm run backfill:ralenti:month -- --month 2026-03 --concurrency 5 --chunk-size 80 --lock-key 95012026 > logs/backfill-ralenti-2026-03.log 2>&1 &
```

Nota: ejecutarlos secuenciales (esperar que termine uno antes del otro) para evitar competir por recursos.

## Parámetros útiles

- `--month YYYY-MM` rango mensual completo.
- `--from ... --to ...` para rango personalizado.
- `--concurrency` ajustar carga de CPU/DB.
- `--chunk-size` tamaño de lote interno.
- `--max-moviles` piloto controlado (ej: `--max-moviles 100`).
- `--lock-key` evita solapamiento de procesos.

## Piloto recomendado (hoy)

```bash
nohup npm run backfill:ralenti:month -- --month 2026-01 --max-moviles 100 --concurrency 4 --chunk-size 60 > logs/backfill-ralenti-2026-01-piloto.log 2>&1 &
```

Con ese piloto podés estimar tiempo del mes completo antes de lanzar toda la flota.
