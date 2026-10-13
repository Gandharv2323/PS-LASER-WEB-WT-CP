// GET /api/catalogue - machines + services from MySQL (60 s in-memory cache).
import { Router } from 'express';
import { getCatalogue } from '../services/catalogue-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const catalogueRouter = Router();

catalogueRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, hit } = await getCatalogue();
    res.set('X-Cache', hit ? 'HIT' : 'MISS');
    res.set('Cache-Control', 'public, max-age=60');
    res.json(data);
  }),
);
