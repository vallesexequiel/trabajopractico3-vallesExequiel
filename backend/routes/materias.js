import express from 'express';
import connection from '../db.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// 📥 Listar todas las materias (protegido con JWT)
router.get('/', verifyToken, async (req, res) => {
  console.log('📥 Se recibió solicitud a /api/materias');
  try {
    const [rows] = await connection.query('SELECT * FROM materias');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener materias:', err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

// 🔍 Obtener una materia por ID
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM materias WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener materia:', err);
    res.status(500).json({ error: 'Error al obtener materia' });
  }
});

// 👥 Alumnos con notas en una materia específica
router.get('/:id/alumnos', verifyToken, async (req, res) => {
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

  try {
    const [rows] = await connection.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No hay alumnos con notas en esta materia' });
    }
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener alumnos por materia:', err);
    res.status(500).json({ error: 'Error al obtener alumnos por materia' });
  }
});

// 🚫 Alumnos que NO tienen notas en una materia específica
router.get('/:id/alumnos-pendientes', verifyToken, async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      a.nombre AS alumno
    FROM alumnos a
    LEFT JOIN notas n ON a.id = n.alumno_id AND n.materia_id = ?
    WHERE n.id IS NULL
  `;

  try {
    const [rows] = await connection.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todos los alumnos tienen notas en esta materia' });
    }
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener alumnos pendientes:', err);
    res.status(500).json({ error: 'Error al obtener alumnos pendientes' });
  }
});

export default router;
