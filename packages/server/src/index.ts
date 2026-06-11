import express from 'express';
import dotenv from 'dotenv';
import { authorizeHandler } from './routes/authorize';
import { approveHandler } from './routes/approve';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/oauth/authorize', authorizeHandler);
app.post('/oauth/approve', approveHandler);

app.listen(PORT, () => {
  console.log(`OAuth server running on http://localhost:${PORT}`);
});
