import express, { Express } from 'express';

import router from './routes';
import connectDB from './database/database';

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.use(express.json());
app.use('/api', router);

// eslint-disable-next-line no-console
connectDB(true).then(() => console.log('[database]: Database connected and schema synchronized.')).catch((error) => console.error(error));
