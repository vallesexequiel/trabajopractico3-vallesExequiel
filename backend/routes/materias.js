import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// 📥 Listar todas las materias
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

// 🔍 Obtener una materia por ID
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

// 👥 Alumnos con notas en una materia específica
router.get('/:id/alumnos', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno,
      n.nota1, n.nota2, n.nota3,
      ROUND((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio
    FROM notas n
    INNER JOIN alumnos a ON n.alumno_id = a.id
    WHERE n.materia_id = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener alumnos por materia:', err);
      return res.status(500).json({ error: 'Error al obtener alumnos por materia' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No hay alumnos con notas en esta materia' });
    }
    res.json(results);
  });
});

// 🚫 Alumnos que NO tienen notas en una materia específica
router.get('/:id/alumnos-pendientes', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno
    FROM alumnos a
    LEFT JOIN notas n ON a.id = n.alumno_id AND n.materia_id = ?
    WHERE n.id IS NULL
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener alumnos pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener alumnos pendientes' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Todos los alumnos tienen notas en esta materia' });
    }
    res.json(results);
  });
});

export default router;
