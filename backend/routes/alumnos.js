import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// Listar todos los alumnos
router.get('/', (req, res) => {
  connection.query('SELECT * FROM alumnos', (err, results) => {
    if (err) {
      console.error('Error al obtener alumnos:', err);
      return res.status(500).json({ error: 'Error al obtener alumnos' });
    }
    res.json(results);
  });
});

// Buscar alumno por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM alumnos WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener alumno por ID:', err);
      return res.status(500).json({ error: 'Error al obtener alumno' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json(results[0]);
  });
});

export default router;
