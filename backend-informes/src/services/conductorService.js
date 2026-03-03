/**
 * Servicio de Conductores
 */

import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

/**
 * Obtiene conductores para un conjunto de empresas
 * @param {number[]} empresaIds
 * @returns {Promise<Array>}
 */
export async function getConductoresPorEmpresas(empresaIds) {
  try {
    if (!Array.isArray(empresaIds) || empresaIds.length === 0) {
      return [];
    }

    const sql = `
      SELECT DISTINCT
        "PersCon"."identificacion" AS "idCon",
        "PersCon"."nombre" AS "nombre",
        "Per"."nombre" AS "empresa",
        "PersCon"."telefono" AS "telefono",
        "PersCon"."identificacion_0" AS "dni",
        "PersCon"."email" AS "email"
      FROM public."Conductor" AS "Con"
      INNER JOIN public."Persona" AS "PersCon"
        ON "PersCon"."identificacion" = "Con"."identificacion"
      INNER JOIN public."Persona" AS "Per"
        ON "Per"."identificacion" = "Con"."empresa_identificacion_OID"
      WHERE "Con"."empresa_identificacion_OID" = ANY($1::int[])
      ORDER BY "PersCon"."nombre" ASC
    `;

    const result = await query(sql, [empresaIds]);

    logger.info(`getConductoresPorEmpresas: Retornando ${result.rows.length} conductores`, {
      empresas: empresaIds.length,
    });

    return result.rows;
  } catch (error) {
    logger.error('Error en getConductoresPorEmpresas:', error);
    throw error;
  }
}

export default {
  getConductoresPorEmpresas,
};
