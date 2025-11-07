import { Router } from 'express';
import connection from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  console.log('📥 Se recibió solicitud a /api/materias');
  connection.query('SELECT * FROM materias', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener materias:', err);
      return res.status(500).json({ error: 'Error al obtener materias' });
    }
    res.json(results);
  });
});

export default router;
