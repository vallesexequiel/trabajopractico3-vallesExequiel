import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
    req.user = decoded; // Guardamos los datos del usuario en la request
    next(); // Continuamos con la ruta protegida
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}
