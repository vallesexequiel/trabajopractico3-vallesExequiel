import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connection from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';
const SALT_ROUNDS = 10;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Buscar usuario por email
    const [rows] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Comparar contraseña con bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT con expiración de 4 horas
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Error en /login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe
    const [existing] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insertar nuevo usuario con contraseña encriptada
    await connection.query(
      'INSERT INTO usuarios (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    // Obtener el nuevo usuario
    const [rows] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(500).json({ error: 'No se pudo recuperar el usuario' });
    }

    const user = rows[0];

    // Generar token JWT con expiración de 4 horas
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    return res.status(201).json({ token });
  } catch (err) {
    console.error('Error en /register:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
