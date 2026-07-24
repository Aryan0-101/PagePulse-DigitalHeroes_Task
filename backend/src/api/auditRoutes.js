import { Router } from 'express';
import { runAudit } from '../services/auditService.js';
import { buildErrorResponse } from '../models/auditModels.js';
import { AuditError } from '../utils/errors.js';

const router = Router();

router.post('/audit', async (req, res) => {
  const { url } = req.body ?? {};

  try {
    const report = await runAudit(url);
    res.status(200).json(report);
  } catch (err) {
    if (err instanceof AuditError) {
      res.status(422).json(buildErrorResponse(err.message));
      return;
    }
    res.status(500).json(buildErrorResponse('Unexpected error while auditing the page.'));
  }
});

export default router;
