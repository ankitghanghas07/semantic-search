import { log } from 'console';
import { Router } from 'express';
const router = Router();

// Placeholder auth routes
router.post('/login', (req, res) => {
  res.json({ token: 'fake-jwt-token' });
});

export default router;
