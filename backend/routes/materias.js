import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// Ruta para listar todas las materias
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

// Ruta para obtener una materia por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM materias WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener materia:', err);
      return res.status(500).json({ error: 'Error al obtener materia' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.json(results[0]);
  });
});

export default router;
