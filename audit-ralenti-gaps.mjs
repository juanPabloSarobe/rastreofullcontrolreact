import { initializePool, closePool, query } from './src/db/pool.js';

(async () => {
  try {
    await initializePool();
    
    console.log('\n=== AUDITORÍA: INTERVALOS SOSPECHOSOS ===\n');
    
    // Caso 1: Duraciones > 10 horas (muy anormales)
    const longIntervals = await query(`
      SELECT 
        movil_id,
        start_ts_utc,
        end_ts_utc,
        EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc))/3600 as duration_hours,
        anomaly_flags
      FROM idle_intervals_v2
      WHERE algorithm_version = 1
        AND EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc)) > 36000  -- > 10 horas
      ORDER BY duration_hours DESC
      LIMIT 20
    `);
    
    console.log('📌 Intervalos > 10 horas (SOSPECHOSOS):');
    console.log(`Encontrados: ${longIntervals.rows.length}`);
    longIntervals.rows.forEach(row => {
      console.log(`  - Móvil ${row.movil_id}: ${row.duration_hours.toFixed(1)}h (${row.start_ts_utc} → ${row.end_ts_utc})`);
    });
    
    /    /    /    /    /    /    /    / anoche
    const midnightCrosser = await query(`
      SELECT 
        movil_id,
        start_        start_        sttc,
                                                                      on   urs
      FROM idle_intervals_v2
      WHERE algorithm_version = 1
        AND DATE(start_ts_utc) != DATE(end_ts_utc)
      ORDER BY duration_hours DESC
      LIMIT 20
    `);
    
    console.log('\n📌 Intervalos que cruzan medianoche (REVISAR):');
    console.log(`Encontrados: ${midnightCrosser.rows.length}`);
    midnightCrosser.rows.forEach(row => {
      console.log(`  - Móvil ${row.movil_id}: ${row.duration_hours.toFixed(1)}h`);
    });
    
    // Caso 3: Duración cero o < 10 segundos
    const tinyIntervals = await query(`
      SELECT 
        movil_id,
        start_ts_utc,
        end_ts_utc,
        EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc)) as duration_sec,
        anomaly_flags
      FROM idle_intervals_v2
      WHERE algorithm_version = 1           D EXTRACT(EPOCH FROM (end_ts_utc - start_ts_utc)) <= 10
      LIMIT 20
    `);
    
    console.log('\n📌 Intervalos < 10 segundos (ERRORES):');
    console.log(`Encontrados: ${tinyIntervals.rows.length}`);
    tinyIntervals.rows.forEach(row => {
      console.log(`  - Móvil ${row.movil_id}: ${row.durati      console.log(`  - Móvil ${row.movil_id}: $lag      console.log(`  - Móvil $e) {      cnsole.error('Error:', e.message);
  } finally {
    await closePool();
  }
})();
