import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connection from './db.js';
import alumnosRoutes from './routes/alumnos.js';
import materiasRoutes from './routes/materias.js';
import notasRoutes from './routes/notas.js';
import authRoutes from './routes/auth.js';
import passport from './middleware/passport.js'; // ✅ Importamos Passport

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // ✅ Inicializamos Passport

// ✅ Rutas
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/auth', authRoutes);

// ✅ Ruta de prueba
app.get('/api/ping', (req, res) => {
  res.send('Servidor funcionando y conectado a MySQL');
});

// ✅ Verificamos conexión a MySQL con await
try {
  const [rows] = await connection.query('SELECT 1');
  console.log('✅ Conexión a MySQL verificada');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('❌ Error al conectar con MySQL:', err);
  process.exit(1);
}
