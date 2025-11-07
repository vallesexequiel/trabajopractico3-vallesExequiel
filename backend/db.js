import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '15684414keko',
  database: 'gestion_alumnos'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
  } else {
    console.log('✅ Conexión exitosa a MySQL');
  }
});

export default connection;
