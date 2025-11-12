import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '15684414keko',
  database: 'gestion_alumnos'
});

console.log('✅ Conexión exitosa a MySQL');

export default connection;
