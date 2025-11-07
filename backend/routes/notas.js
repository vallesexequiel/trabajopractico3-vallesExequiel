import { Router } from 'express';
import connection from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  console.log('📥 Se recibió solicitud a /api/notas');
  connection.query('SELECT * FROM notas', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener notas:', err);
      return res.status(500).json({ error: 'Error al obtener notas' });
    }
    res.json(results);
  });
});

export default router;
