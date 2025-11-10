import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// 🧾 Listar todos los alumnos
router.get('/', (req, res) => {
  connection.query('SELECT * FROM alumnos', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener alumnos:', err);
      return res.status(500).json({ error: 'Error al obtener alumnos' });
    }
    res.json(results);
  });
});

// 🔍 Buscar alumno por ID
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

// 📚 Obtener todas las notas de un alumno con nombre de materia
router.get('/:id/notas', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno,
      m.nombre AS materia,
      n.nota1, n.nota2, n.nota3,
      ROUND((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio
    FROM notas n
    INNER JOIN alumnos a ON n.alumno_id = a.id
    INNER JOIN materias m ON n.materia_id = m.id
    WHERE n.alumno_id = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener notas del alumno:', err);
      return res.status(500).json({ error: 'Error al obtener notas del alumno' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron notas para este alumno' });
    }
    res.json(results);
  });
});

// 📊 Promedio general de un alumno
router.get('/:id/promedio', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno,
      ROUND(AVG((n.nota1 + n.nota2 + n.nota3) / 3), 2) AS promedio_general
    FROM notas n
    INNER JOIN alumnos a ON n.alumno_id = a.id
    WHERE n.alumno_id = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al calcular promedio:', err);
      return res.status(500).json({ error: 'Error al calcular promedio' });
    }
    if (results.length === 0 || results[0].promedio_general === null) {
      return res.status(404).json({ error: 'No hay notas para este alumno' });
    }
    res.json(results[0]);
  });
});

// 📚 Materias en las que un alumno no tiene notas cargadas
router.get('/:id/materias-pendientes', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      m.nombre AS materia
    FROM materias m
    LEFT JOIN notas n ON m.id = n.materia_id AND n.alumno_id = ?
    WHERE n.id IS NULL
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener materias pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener materias pendientes' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'El alumno tiene notas en todas las materias' });
    }
    res.json(results);
  });
});

export default router;
