import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { planRoutes } from './routes/plan.routes.js';
import { trainingRoutes } from './routes/training.routes.js';
import { knowledgeRoutes } from './routes/knowledge.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { communityRoutes } from './routes/community.routes.js';
import { trainingLogRoutes } from './routes/training-log.routes.js';
import { nutritionRoutes } from './routes/nutrition.routes.js';
import { achievementRoutes } from './routes/achievement.routes.js';
import { petRoutes } from './routes/pet.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the React client build output.
// In production the client is built into <repo-root>/client/dist.
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Middleware
app.use(helmet({
  // Allow same-origin image / asset loading from the bundled front-end
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Serve bundled front-end static assets (JS, CSS, images, etc.)
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/training-logs', trainingLogRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/pet', petRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, data: { status: 'ok' }, message: 'success' });
});

// SPA fallback: return index.html for any non-API route so that
// React Router can handle client-side navigation.
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

export { app };
