import { useEffect, useState } from 'react';

function Materias() {
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterias = async () => {
      const token = localStorage.getItem('token'); // 👈 Recuperamos el token

      if (!token) {
        setError('No hay token, inicia sesión primero');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/materias', {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Mandamos el token
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al obtener materias');
          return;
        }

        const data = await res.json();
        setMaterias(data);
      } catch (err) {
        console.error('❌ Error al conectar con el backend:', err);
        setError('No se pudo conectar con el servidor');
      }
    };

    fetchMaterias();
  }, []);

  return (
    <div>
      <h2>📚 Lista de Materias</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {materias.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.id}</td>
                <td>{materia.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>No hay materias cargadas</p>
      )}
    </div>
  );
}

export default Materias;
