import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connection from './db.js';
import alumnosRoutes from './routes/alumnos.js';
import materiasRoutes from './routes/materias.js';
import notasRoutes from './routes/notas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/alumnos', alumnosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/notas', notasRoutes);

app.get('/api/ping', (req, res) => {
  res.send('Servidor funcionando y conectado a MySQL');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
