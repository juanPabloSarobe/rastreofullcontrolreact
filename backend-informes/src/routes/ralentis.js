/**
 * Rutas de Ralentís
 */

import express from 'express';
import * as ralentiService from '../services/ralentiService.js';
import { logger } from '../utils/logger.js';

export const router = express.Router();

/**
 * GET /api/ralentis
 * Obtiene ralentís por IDs de móviles y rango de fechas
 * Query params:
 *   - movilIds: string (JSON array) -> [7246, 6661, 5432]
 *   - fechaDesde: string (ISO 8601)
 *   - fechaHasta: string (ISO 8601)
 */
router.get('/', async (req, res, next) => {
  try {
    const { movilIds, fechaDesde, fechaHasta } = req.query;

    // Validar que tenga todos los parámetros
    if (!movilIds || !fechaDesde || !fechaHasta) {
      return res.status(400).json({
        ok: false,
        error: 'Se requiere especificar movilIds (JSON array de números), fechaDesde y fechaHasta',
      });
    }

    // Parsear movilIds si viene como string JSON
    let movilIdsList = [];
    if (movilIds) {
      try {
        movilIdsList = typeof movilIds === 'string' ? JSON.parse(movilIds) : movilIds;
      } catch {
        return res.status(400).json({
          ok: false,
          error: 'movilIds debe ser un JSON array válido, ej: [7246, 6661]',
        });
      }
    }

    const ralentis = await ralentiService.getRalentisPorMoviles(
      movilIdsList,
      fechaDesde,
      fechaHasta
    );

    res.json({
      ok: true,
      data: ralentis,
      count: ralentis.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ralentis/id/:id
 * Obtiene un ralentí específico por ID
 */
router.get('/id/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const ralenti = await ralentiService.getRalentiById(id);

    res.json({
      ok: true,
      data: ralenti,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ralentis/all
 * Obtiene todos los ralentís (límitado a 100)
 * Query params:
 *   - limit: number (default 100)
 */
router.get('/all', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const ralentis = await ralentiService.getAllRalentis(parseInt(limit));

    res.json({
      ok: true,
      data: ralentis,
      count: ralentis.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
