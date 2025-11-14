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

// Listar todos los alumnos
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM alumnos');
    res.json(rows);
  } catch (err) {
    console.error(' Error al obtener alumnos:', err);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

//  Buscar alumno por ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await connection.query('SELECT * FROM alumnos WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(' Error al obtener alumno por ID:', err);
      res.status(500).json({ error: 'Error al obtener alumno' });
    }
  }
);

//  Crear nuevo alumno
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras'),
    body('apellido')
      .notEmpty().withMessage('El apellido es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { nombre, apellido } = req.body;
    try {
      await connection.query('INSERT INTO alumnos (nombre, apellido) VALUES (?, ?)', [nombre, apellido]);
      res.status(201).json({ message: 'Alumno creado correctamente' });
    } catch (err) {
      console.error(' Error al crear alumno:', err);
      res.status(500).json({ error: 'Error al crear alumno' });
    }
  }
);

//  Actualizar alumno
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [
    param('id').isInt().withMessage('El ID debe ser un número entero').toInt(),
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras'),
    body('apellido')
      .notEmpty().withMessage('El apellido es obligatorio')
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido } = req.body;
    try {
      const [result] = await connection.query(
        'UPDATE alumnos SET nombre = ?, apellido = ? WHERE id = ?',
        [nombre, apellido, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }
      res.json({ message: 'Alumno actualizado correctamente' });
    } catch (err) {
      console.error(' Error al actualizar alumno:', err);
      res.status(500).json({ error: 'Error al actualizar alumno' });
    }
  }
);

//  Eliminar alumno (primero borra sus notas)
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      await connection.query('DELETE FROM notas WHERE alumno_id = ?', [id]);
      const [result] = await connection.query('DELETE FROM alumnos WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Alumno no encontrado' });
      }

      res.json({ message: 'Alumno y sus notas eliminados correctamente' });
    } catch (err) {
      console.error(' Error al eliminar alumno:', err);
      res.status(500).json({ error: 'Error al eliminar alumno' });
    }
  }
);

//  Notas por alumno
router.get(
  '/:id/notas',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT 
          m.nombre AS materia,
          n.nota1, n.nota2, n.nota3,
          ROUND((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio
        FROM notas n
        INNER JOIN materias m ON n.materia_id = m.id
        WHERE n.alumno_id = ?
      `;
      const [rows] = await connection.query(query, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontraron notas para este alumno' });
      }
      res.json(rows);
    } catch (err) {
      console.error(' Error al obtener notas del alumno:', err);
      res.status(500).json({ error: 'Error al obtener notas del alumno' });
    }
  }
);

// Promedio general del alumno
router.get(
  '/:id/promedio',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT ROUND(AVG((n.nota1 + n.nota2 + n.nota3) / 3), 2) AS promedio_general
        FROM notas n
        WHERE n.alumno_id = ?
      `;
      const [rows] = await connection.query(query, [id]);
      if (rows.length === 0 || rows[0].promedio_general === null) {
        return res.status(404).json({ error: 'No hay promedio disponible para este alumno' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(' Error al obtener promedio del alumno:', err);
      res.status(500).json({ error: 'Error al obtener promedio del alumno' });
    }
  }
);

//  Materias pendientes del alumno
router.get(
  '/:id/materias-pendientes',
  passport.authenticate('jwt', { session: false }),
  [param('id').isInt().withMessage('El ID debe ser un número entero').toInt()],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT m.nombre AS materia
        FROM materias m
        WHERE m.id NOT IN (
          SELECT n.materia_id FROM notas n WHERE n.alumno_id = ?
        )
      `;
      const [rows] = await connection.query(query, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No hay materias pendientes para este alumno' });
      }
      res.json(rows);
    } catch (err) {
      console.error(' Error al obtener materias pendientes:', err);
      res.status(500).json({ error: 'Error al obtener materias pendientes' });
    }
  }
);

export default router;
