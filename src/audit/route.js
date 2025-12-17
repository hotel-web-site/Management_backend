import { Router } from 'express';
import { authMiddleware, adminAuthMiddleware } from '../common/authMiddleware.js';
import * as auditService from './service.js';

const router = Router();

router.get('/admin/logs', authMiddleware, adminAuthMiddleware, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await auditService.getLogs(page);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

export default router;