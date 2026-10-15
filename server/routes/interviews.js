import { Router } from 'express';
import Interview from '../models/Interview.js';
import { requireAuth } from '../middleware/auth.js';
import { generateQuestion, evaluateAnswer, generateReport } from '../services/prompts.js';

const router = Router();
router.use(requireAuth);

// Start a new interview and get the first question
router.post('/', async (req, res, next) => {
  try {
    const { role, level, type, resumeText, totalQuestions } = req.body;
    if (!role?.trim()) return res.status(400).json({ error: 'Role is required' });

    const iv = new Interview({
      user: req.userId,
      role: role.trim().slice(0, 100),
      level,
      type,
      resumeText: (resumeText || '').slice(0, 6000),
      totalQuestions: Math.min(10, Math.max(1, Number(totalQuestions) || 5)),
    });
    iv.questions.push({ question: await generateQuestion(iv) });
    await iv.save();
    res.status(201).json(iv);
  } catch (err) { next(err); }
});

// History (newest first), without heavy fields
router.get('/', async (req, res, next) => {
  try {
    const list = await Interview.find({ user: req.userId })
      .select('role level type status overallScore totalQuestions createdAt')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const iv = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!iv) return res.status(404).json({ error: 'Interview not found' });
    res.json(iv);
  } catch (err) { next(err); }
});

// Submit an answer: evaluate it, then ask the next question or build the final report
router.post('/:id/answer', async (req, res, next) => {
  try {
    const answer = (req.body.answer || '').trim();
    if (answer.length < 5) return res.status(400).json({ error: 'Write a proper answer first' });

    const iv = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!iv) return res.status(404).json({ error: 'Interview not found' });
    if (iv.status === 'completed') return res.status(400).json({ error: 'Interview already finished' });

    const current = iv.questions[iv.questions.length - 1];
    if (current.answer) return res.status(400).json({ error: 'This question is already answered' });

    // All LLM calls happen before save(), so a failure leaves the interview untouched
    const evaluation = await evaluateAnswer(iv, current.question, answer);
    current.set({ answer: answer.slice(0, 4000), ...evaluation });

    if (iv.questions.length >= iv.totalQuestions) {
      iv.report = await generateReport(iv);
      const avg = iv.questions.reduce((sum, q) => sum + q.score, 0) / iv.questions.length;
      iv.overallScore = Math.round(avg * 10);
      iv.status = 'completed';
    } else {
      iv.questions.push({ question: await generateQuestion(iv) });
    }

    await iv.save();
    res.json(iv);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Interview.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
