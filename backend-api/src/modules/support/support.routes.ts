import { Router } from 'express';
import { supportChat } from './support.controller';

const router = Router();

router.post('/chat', supportChat);

export default router;