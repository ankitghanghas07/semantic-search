import { Router } from 'express';
const router = Router();

// Placeholder document routes
router.post('/', (req, res) => {
    console.log("changed");
  res.json({ message: 'Document uploaded' });
});

export default router;
