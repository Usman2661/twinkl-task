import express, { Express } from 'express';

import router from './routes';

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.use(express.json());

app.use('/api', router);
