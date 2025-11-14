import { useEffect, useState } from 'react';

function AlumnoDetalle({ alumnoId, onBack }) {
  const [notas, setNotas] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const idNum = Number(alumnoId);
    

    // Guard: id inválido
    if (!Number.isInteger(idNum) || idNum <= 0) {
      setError('ID de alumno inválido');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setError('');
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        //  Notas por materia
        const resNotas = await fetch(`http://localhost:3001/api/alumnos/${idNum}/notas`, { headers });
        if (resNotas.ok) {
          const dataNotas = await resNotas.json();
          setNotas(dataNotas);
        } else {
          const errBody = await resNotas.json().catch(() => ({}));
          console.error(' Error en /notas:', resNotas.status, errBody);
          setNotas([]); // estado consistente
        }

        //  Promedio general
        const resProm = await fetch(`http://localhost:3001/api/alumnos/${idNum}/promedio`, { headers });
        if (resProm.ok) {
          const data = await resProm.json();
          setPromedio(data.promedio_general);
        } else {
          const errBody = await resProm.json().catch(() => ({}));
          console.error(' Error en /promedio:', resProm.status, errBody);
          setPromedio(null);
        }

        // Materias pendientes
        const resPend = await fetch(`http://localhost:3001/api/alumnos/${idNum}/materias-pendientes`, { headers });
        if (resPend.ok) {
          const dataPend = await resPend.json();
          setPendientes(dataPend);
        } else {
          const errBody = await resPend.json().catch(() => ({}));
          console.error(' Error en /materias-pendientes:', resPend.status, errBody);
          setPendientes([]);
        }
      } catch (err) {
        console.error(' Error al obtener detalle del alumno:', err);
        setError('No se pudo cargar el detalle del alumno');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [alumnoId, token]);

  return (
    <div>
      <h2>📖 Detalle del Alumno</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/*  Notas */}
      <h3>Notas por materia</h3>
      {notas.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Materia</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((n, idx) => (
              <tr key={idx}>
                <td>{n.materia}</td>
                <td>{n.nota1}</td>
                <td>{n.nota2}</td>
                <td>{n.nota3}</td>
                <td>{n.promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay notas cargadas</p>
      )}

      {/*  Promedio general */}
      <h3>Promedio general</h3>
      {promedio !== null ? <p>{promedio}</p> : <p>No hay promedio disponible</p>}

      {/*  Materias pendientes */}
      <h3>Materias pendientes</h3>
      {pendientes.length > 0 ? (
        <ul>
          {pendientes.map((m, idx) => (
            <li key={idx}>{m.materia}</li>
          ))}
        </ul>
      ) : (
        <p>No hay materias pendientes</p>
      )}

      <button onClick={onBack}>⬅️ Volver</button>
    </div>
  );
}

export default AlumnoDetalle;
