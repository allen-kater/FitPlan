import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { planRoutes } from './routes/plan.routes.js';
import { trainingRoutes } from './routes/training.routes.js';
import { knowledgeRoutes } from './routes/knowledge.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, data: { status: 'ok' }, message: 'success' });
});

// Error handling
app.use(errorHandler);

export { app };
