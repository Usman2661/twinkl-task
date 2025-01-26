import express, { Express } from 'express';
import pinoHttp from 'pino-http';

import router from './routes';
import connectDB from './database/database';
import logger from './logger/logger';

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use('/api', router);

connectDB(true).then(() => logger.info('Database connected and schema synchronized.')).catch((error) => logger.error(error));
