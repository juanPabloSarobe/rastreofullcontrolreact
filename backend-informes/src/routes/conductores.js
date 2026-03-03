/**
 * Rutas de Conductores
 */

import express from 'express';
import * as conductorService from '../services/conductorService.js';

export const router = express.Router();

/**
 * POST /api/conductores/por-empresas
 * Obtiene conductores por lista de IDs de empresa
 * Body:
 *   - empresaIds: number[]
 */
router.post('/por-empresas', async (req, res, next) => {
  try {
    const { empresaIds } = req.body || {};

    if (!Array.isArray(empresaIds)) {
      return res.status(400).json({
        ok: false,
        error: 'empresaIds debe ser un array de números',
      });
    }

    const normalizedEmpresaIds = empresaIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (normalizedEmpresaIds.length === 0) {
      return res.json({
        ok: true,
        data: [],
        count: 0,
      });
    }

    const conductores = await conductorService.getConductoresPorEmpresas(normalizedEmpresaIds);

    res.json({
      ok: true,
      data: conductores,
      count: conductores.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
