import express from 'express';
import jwt from 'jsonwebtoken';
import connection from '../db.js';

const router = express.Router(); // 👈 ESTA LÍNEA FALTABA

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await connection.query(
      'SELECT * FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email },
      process.env.JWT_SECRET || 'clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error en el backend:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
