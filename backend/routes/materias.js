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

//  Listar todas las materias
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM materias');
    res.json(rows);
  } catch (err) {
    console.error(' Error al obtener materias:', err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

//  Obtener una materia por ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await connection.query('SELECT * FROM materias WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(' Error al obtener materia:', err);
      res.status(500).json({ error: 'Error al obtener materia' });
    }
  }
);

// ➕ Crear nueva materia
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { nombre } = req.body;
    try {
      await connection.query('INSERT INTO materias (nombre) VALUES (?)', [nombre]);
      res.status(201).json({ message: 'Materia creada correctamente' });
    } catch (err) {
      console.error(' Error al crear materia:', err);
      res.status(500).json({ error: 'Error al crear materia' });
    }
  }
);

//  Actualizar materia
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [
    param('id').isInt().withMessage('El ID debe ser un número entero').toInt(),
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
      const [result] = await connection.query('UPDATE materias SET nombre = ? WHERE id = ?', [nombre, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }
      res.json({ message: 'Materia actualizada correctamente' });
    } catch (err) {
      console.error(' Error al actualizar materia:', err);
      res.status(500).json({ error: 'Error al actualizar materia' });
    }
  }
);

//  Eliminar materia (primero borra notas asociadas)
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      await connection.query('DELETE FROM notas WHERE materia_id = ?', [id]);
      const [result] = await connection.query('DELETE FROM materias WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }

      res.json({ message: 'Materia y sus notas eliminadas correctamente' });
    } catch (err) {
      console.error(' Error al eliminar materia:', err);
      res.status(500).json({ error: 'Error al eliminar materia' });
    }
  }
);

// Alumnos con notas en una materia específica
router.get(
  '/:id/alumnos',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
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
      console.error(' Error al obtener alumnos por materia:', err);
      res.status(500).json({ error: 'Error al obtener alumnos por materia' });
    }
  }
);

//  Alumnos que NO tienen notas en una materia específica
router.get(
  '/:id/alumnos-pendientes',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
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
      console.error(' Error al obtener alumnos pendientes:', err);
      res.status(500).json({ error: 'Error al obtener alumnos pendientes' });
    }
  }
);

export default router;
