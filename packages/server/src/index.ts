import express from 'express';
import dotenv from 'dotenv';
import { authorizeHandler } from './routes/authorize';
import { approveHandler } from './routes/approve';
import { tokenHandler } from './routes/token';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/oauth/authorize', authorizeHandler);
app.post('/oauth/approve', approveHandler);
app.post('/oauth/token', tokenHandler);

app.listen(PORT, () => {
  console.log(`OAuth server running on http://localhost:${PORT}`);
});
