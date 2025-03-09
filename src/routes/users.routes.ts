import express from 'express';
import { authenticatePin } from '../controller/users.controller';

const router = express.Router();

router.post('/authenticate', authenticatePin);

export default router;