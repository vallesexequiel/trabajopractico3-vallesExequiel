import { Router } from 'express';
import connection from '../db.js';

const router = Router();

// 📥 Listar todas las notas
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

// 🔍 Buscar nota por ID
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

// 📝 Crear nuevas notas
router.post('/', (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  if (!alumno_id || !materia_id || nota1 == null || nota2 == null || nota3 == null) {
    return res.status(400).json({ error: 'Faltan datos para registrar las notas' });
  }

  const query = `
    INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [alumno_id, materia_id, nota1, nota2, nota3], (err, result) => {
    if (err) {
      console.error('❌ Error al insertar notas:', err);
      return res.status(500).json({ error: 'Error al insertar notas' });
    }
    res.status(201).json({ mensaje: 'Notas registradas correctamente', id: result.insertId });
  });
});

// ✏️ Actualizar notas existentes por ID
router.put('/:id', (req, res) => {
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

  connection.query(query, [nota1, nota2, nota3, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar notas:', err);
      return res.status(500).json({ error: 'Error al actualizar notas' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de notas no encontrado' });
    }
    res.json({ mensaje: 'Notas actualizadas correctamente' });
  });
});

// 🗑️ Eliminar notas por ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM notas WHERE id = ?';

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar notas:', err);
      return res.status(500).json({ error: 'Error al eliminar notas' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro de notas no encontrado' });
    }
    res.json({ mensaje: 'Notas eliminadas correctamente' });
  });
});

export default router;
