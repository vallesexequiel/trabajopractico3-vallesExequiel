import { useEffect, useState } from 'react';

function Notas() {
  const [notas, setNotas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotas = async () => {
      const token = localStorage.getItem('token'); // 👈 Recuperamos el token

      if (!token) {
        setError('No hay token, inicia sesión primero');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/notas', {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Mandamos el token
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al obtener notas');
          return;
        }

        const data = await res.json();
        setNotas(data);
      } catch (err) {
        console.error('❌ Error al conectar con el backend:', err);
        setError('No se pudo conectar con el servidor');
      }
    };

    fetchNotas();
  }, []);

  return (
    <div>
      <h2>📊 Lista de Notas</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {notas.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Alumno ID</th>
              <th>Materia ID</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((nota) => (
              <tr key={nota.id}>
                <td>{nota.id}</td>
                <td>{nota.alumno_id}</td>
                <td>{nota.materia_id}</td>
                <td>{nota.nota1}</td>
                <td>{nota.nota2}</td>
                <td>{nota.nota3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>No hay notas cargadas</p>
      )}
    </div>
  );
}

export default Notas;
