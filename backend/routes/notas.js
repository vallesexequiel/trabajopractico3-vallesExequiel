import express from 'express';
import connection from '../db.js';
import passport from '../middleware/passport.js';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Middleware para manejar errores de validación
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

//  Listar todas las notas
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM notas');
    res.json(rows);
  } catch (err) {
    console.error(' Error al obtener notas:', err);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

//  Buscar nota por ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await connection.query('SELECT * FROM notas WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(' Error al obtener nota por ID:', err);
      res.status(500).json({ error: 'Error al obtener nota' });
    }
  }
);

// Crear nuevas notas
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  [
    body('alumno_id').isInt().withMessage('El alumno_id debe ser un número entero').toInt(),
    body('materia_id').isInt().withMessage('El materia_id debe ser un número entero').toInt(),
    body('nota1').isFloat({ min: 0, max: 10 }).withMessage('La nota1 debe estar entre 0 y 10'),
    body('nota2').isFloat({ min: 0, max: 10 }).withMessage('La nota2 debe estar entre 0 y 10'),
    body('nota3').isFloat({ min: 0, max: 10 }).withMessage('La nota3 debe estar entre 0 y 10'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;
    try {
      const [result] = await connection.query(
        'INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)',
        [alumno_id, materia_id, nota1, nota2, nota3]
      );
      res.status(201).json({ mensaje: 'Notas registradas correctamente', id: result.insertId });
    } catch (err) {
      console.error(' Error al insertar notas:', err);
      res.status(500).json({ error: 'Error al insertar notas' });
    }
  }
);

//  Actualizar notas existentes por ID
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [
    param('id').isInt().withMessage('El ID debe ser un número entero').toInt(),
    body('nota1').isFloat({ min: 0, max: 10 }).withMessage('La nota1 debe estar entre 0 y 10'),
    body('nota2').isFloat({ min: 0, max: 10 }).withMessage('La nota2 debe estar entre 0 y 10'),
    body('nota3').isFloat({ min: 0, max: 10 }).withMessage('La nota3 debe estar entre 0 y 10'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { nota1, nota2, nota3 } = req.body;
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
      console.error(' Error al actualizar notas:', err);
      res.status(500).json({ error: 'Error al actualizar notas' });
    }
  }
);

//  Eliminar notas por ID
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await connection.query('DELETE FROM notas WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Registro de notas no encontrado' });
      }
      res.json({ mensaje: 'Notas eliminadas correctamente' });
    } catch (err) {
      console.error(' Error al eliminar notas:', err);
      res.status(500).json({ error: 'Error al eliminar notas' });
    }
  }
);

//  Promedio de notas por alumno y materia
router.get(
  '/:alumnoId/:materiaId/promedio',
  passport.authenticate('jwt', { session: false }),
  [
    param('alumnoId').isInt().withMessage('El alumnoId debe ser un número entero').toInt(),
    param('materiaId').isInt().withMessage('El materiaId debe ser un número entero').toInt(),
  ],
  handleValidationErrors,
  async (req, res) => {
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
      console.error(' Error al calcular promedio:', err);
      res.status(500).json({ error: 'Error al calcular promedio' });
    }
  }
);

export default router;
