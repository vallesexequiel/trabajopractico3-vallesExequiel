import { useEffect, useState } from 'react';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlumnos = async () => {
      const token = localStorage.getItem('token'); // 👈 Recuperamos el token

      if (!token) {
        setError('No hay token, inicia sesión primero');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/alumnos', {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Mandamos el token
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al obtener alumnos');
          return;
        }

        const data = await res.json();
        setAlumnos(data);
      } catch (err) {
        console.error('❌ Error al conectar con el backend:', err);
        setError('No se pudo conectar con el servidor');
      }
    };

    fetchAlumnos();
  }, []);

  return (
    <div>
      <h2>📚 Lista de Alumnos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {alumnos.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id}>
                <td>{alumno.id}</td>
                <td>{alumno.nombre}</td>
                <td>{alumno.apellido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>No hay alumnos cargados</p>
      )}
    </div>
  );
}

export default Alumnos;
