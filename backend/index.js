import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connection from './db.js';
import alumnosRoutes from './routes/alumnos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.send('Servidor funcionando y conectado a MySQL');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

app.use('/api/alumnos', alumnosRoutes);
