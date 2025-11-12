import express from 'express';
import connection from '../db.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// 📥 Listar todas las notas (protegido con JWT)
router.get('/', verifyToken, async (req, res) => {
  console.log('📥 Se recibió solicitud a /api/notas');
  try {
    const [rows] = await connection.query('SELECT * FROM notas');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener notas:', err);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

// 🔍 Buscar nota por ID
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM notas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener nota por ID:', err);
    res.status(500).json({ error: 'Error al obtener nota' });
  }
});

// 📝 Crear nuevas notas
router.post('/', verifyToken, async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  if (!alumno_id || !materia_id || nota1 == null || nota2 == null || nota3 == null) {
    return res.status(400).json({ error: 'Faltan datos para registrar las notas' });
  }

  const query = `
    INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await connection.query(query, [alumno_id, materia_id, nota1, nota2, nota3]);
    res.status(201).json({ mensaje: 'Notas registradas correctamente', id: result.insertId });
  } catch (err) {
    console.error('❌ Error al insertar notas:', err);
    res.status(500).json({ error: 'Error al insertar notas' });
  }
});

// ✏️ Actualizar notas existentes por ID
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nota1, nota2, nota3 } = req.body;

  if (nota1 == null || nota2 == null || nota3 == null) {
    return res.status(400).json({ error: 'Faltan datos para actualizar las notas' });
  }

  const query = `
    UPDATE notas
    SET nota1 = ?, nota2 = ?, nota3 = ?
    WHERE id = ?
  `;

  try {
    const [result] = await connection.query(query, [nota1, nota2, nota3, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de notas no encontrado' });
    }
    res.json({ mensaje: 'Notas actualizadas correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar notas:', err);
    res.status(500).json({ error: 'Error al actualizar notas' });
  }
});

// 🗑️ Eliminar notas por ID
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notas WHERE id = ?';

  try {
    const [result] = await connection.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de notas no encontrado' });
    }
    res.json({ mensaje: 'Notas eliminadas correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar notas:', err);
    res.status(500).json({ error: 'Error al eliminar notas' });
  }
});

export default router;
