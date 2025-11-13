import express from 'express';
import connection from '../db.js';
import passport from '../middleware/passport.js'; // ✅ Usamos Passport

const router = express.Router();

// 📥 Listar todas las notas
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  if (!alumno_id || !materia_id || nota1 == null || nota2 == null || nota3 == null) {
    return res.status(400).json({ error: 'Faltan datos para registrar las notas' });
  }

  // Validar rango de notas
  const notas = [nota1, nota2, nota3];
  if (notas.some(n => n < 0 || n > 10)) {
    return res.status(400).json({ error: 'Las notas deben estar entre 0 y 10' });
  }

  try {
    const [result] = await connection.query(
      'INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
      [alumno_id, materia_id, nota1, nota2, nota3]
    );
    res.status(201).json({ mensaje: 'Notas registradas correctamente', id: result.insertId });
  } catch (err) {
    console.error('❌ Error al insertar notas:', err);
    res.status(500).json({ error: 'Error al insertar notas' });
  }
});

// ✏️ Actualizar notas existentes por ID
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const { nota1, nota2, nota3 } = req.body;

  if (nota1 == null || nota2 == null || nota3 == null) {
    return res.status(400).json({ error: 'Faltan datos para actualizar las notas' });
  }

  // Validar rango de notas
  const notas = [nota1, nota2, nota3];
  if (notas.some(n => n < 0 || n > 10)) {
    return res.status(400).json({ error: 'Las notas deben estar entre 0 y 10' });
  }

  try {
    const [result] = await connection.query(
      'UPDATE notas SET nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?',
      [nota1, nota2, nota3, id]
    );
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
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.query('DELETE FROM notas WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de notas no encontrado' });
    }
    res.json({ mensaje: 'Notas eliminadas correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar notas:', err);
    res.status(500).json({ error: 'Error al eliminar notas' });
  }
});

// 📊 Promedio de notas por alumno y materia
router.get('/:alumnoId/:materiaId/promedio', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { alumnoId, materiaId } = req.params;
  try {
    const [rows] = await connection.query(
      'SELECT ROUND((nota1 + nota2 + nota3) / 3, 2) AS promedio FROM notas WHERE alumno_id = ? AND materia_id = ?',
      [alumnoId, materiaId]
    );
    if (rows.length === 0 || rows[0].promedio === null) {
      return res.status(404).json({ error: 'No hay notas para calcular promedio' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al calcular promedio:', err);
    res.status(500).json({ error: 'Error al calcular promedio' });
  }
});

export default router;
