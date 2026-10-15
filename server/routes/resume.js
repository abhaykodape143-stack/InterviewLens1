import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzeResume } from '../services/prompts.js';

const router = Router();

router.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const { role, resume } = req.body;
    if (!role?.trim() || (resume || '').trim().length < 50) {
      return res.status(400).json({ error: 'Add a target role and paste your resume text' });
    }
    res.json(await analyzeResume(role.trim().slice(0, 100), resume));
  } catch (err) { next(err); }
});

export default router;
