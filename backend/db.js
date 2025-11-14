import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '15684414keko',
  database: process.env.DB_NAME || 'gestion_alumnos',
});

console.log(' Conexión exitosa a MySQL');

export default connection;
