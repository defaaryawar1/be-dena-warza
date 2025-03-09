import express from 'express';
import {
    getAllMemories,
    createMemory,
    getSingleMemory,
    updateMemory,
    deleteMemory
} from '../controller/memories.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

// Define the router
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Route handlers
router.get('/', (req, res, next) => {
    getAllMemories(req, res).catch(next);
});

router.post('/', (req, res, next) => {
    createMemory(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    getSingleMemory(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
    updateMemory(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    deleteMemory(req, res).catch(next);
});

export default router;