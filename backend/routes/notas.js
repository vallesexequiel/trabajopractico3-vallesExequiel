import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// Listar todas las notas
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

// Buscar nota por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM notas WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener nota por ID:', err);
      return res.status(500).json({ error: 'Error al obtener nota' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(results[0]);
  });
});

export default router;
