import express from 'express';
import connection from '../db.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// 🧾 Listar todos los alumnos (protegido con JWT)
router.get('/', verifyToken, async (req, res) => {
  console.log('📥 Se recibió solicitud a /api/alumnos');
  try {
    const [rows] = await connection.query('SELECT * FROM alumnos');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener alumnos:', err);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

// 🔍 Buscar alumno por ID
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM alumnos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener alumno por ID:', err);
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
});

// 📚 Obtener todas las notas de un alumno con nombre de materia
router.get('/:id/notas', verifyToken, async (req, res) => {
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

  try {
    const [rows] = await connection.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron notas para este alumno' });
    }
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener notas del alumno:', err);
    res.status(500).json({ error: 'Error al obtener notas del alumno' });
  }
});

// 📊 Promedio general de un alumno
router.get('/:id/promedio', verifyToken, async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno,
      ROUND(AVG((n.nota1 + n.nota2 + n.nota3) / 3), 2) AS promedio_general
    FROM notas n
    INNER JOIN alumnos a ON n.alumno_id = a.id
    WHERE n.alumno_id = ?
  `;

  try {
    const [rows] = await connection.query(query, [id]);
    if (rows.length === 0 || rows[0].promedio_general === null) {
      return res.status(404).json({ error: 'No hay notas para este alumno' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al calcular promedio:', err);
    res.status(500).json({ error: 'Error al calcular promedio' });
  }
});

// 📚 Materias en las que un alumno no tiene notas cargadas
router.get('/:id/materias-pendientes', verifyToken, async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      m.nombre AS materia
    FROM materias m
    LEFT JOIN notas n ON m.id = n.materia_id AND n.alumno_id = ?
    WHERE n.id IS NULL
  `;

  try {
    const [rows] = await connection.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'El alumno tiene notas en todas las materias' });
    }
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener materias pendientes:', err);
    res.status(500).json({ error: 'Error al obtener materias pendientes' });
  }
});

export default router;
