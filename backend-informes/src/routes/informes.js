/**
 * Rutas de Informes
 */

import express from 'express';
import * as informeService from '../services/informeService.js';
import { logger } from '../utils/logger.js';

export const router = express.Router();

/**
 * GET /api/informes
 * Lista todos los informes
 */
router.get('/', async (req, res, next) => {
  try {
    const { estado, usuario_id } = req.query;
    const informes = await informeService.getInformes({
      estado,
      usuario_id,
    });

    res.json({
      ok: true,
      data: informes,
      count: informes.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/informes/:id
 * Obtiene un informe específico
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const informe = await informeService.getInforme(id);

    res.json({
      ok: true,
      data: informe,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/informes
 * Crea un nuevo informe
 */
router.post('/', async (req, res, next) => {
  try {
    const informe = await informeService.crearInforme(req.body);

    res.status(201).json({
      ok: true,
      data: informe,
      message: 'Informe creado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/informes/:id
 * Actualiza un informe
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const informe = await informeService.actualizarInforme(id, req.body);

    res.json({
      ok: true,
      data: informe,
      message: 'Informe actualizado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
