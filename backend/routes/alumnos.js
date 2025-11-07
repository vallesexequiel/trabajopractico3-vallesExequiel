import { Router } from 'express';
import connection from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  connection.query('SELECT * FROM alumnos', (err, results) => {
    if (err) {
      console.error('Error al obtener alumnos:', err);
      return res.status(500).json({ error: 'Error al obtener alumnos' });
    }
    res.json(results);
  });
});

export default router;
