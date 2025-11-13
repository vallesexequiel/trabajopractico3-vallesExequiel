import { useEffect, useState } from 'react';

function Notas() {
  const [notas, setNotas] = useState([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [nota1, setNota1] = useState('');
  const [nota2, setNota2] = useState('');
  const [nota3, setNota3] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // 📥 Obtener todas las notas
  const fetchNotas = async () => {
    if (!token) {
      setError('No hay token, inicia sesión primero');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/notas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al obtener notas');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNotas(data);
    } catch (err) {
      console.error('❌ Error al conectar con el backend:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  // ➕ Crear o ✏️ Editar notas
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alumnoId || !materiaId || nota1 === '' || nota2 === '' || nota3 === '') {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const url = editId
        ? `http://localhost:3001/api/notas/${editId}`
        : 'http://localhost:3001/api/notas';

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alumno_id: alumnoId,
          materia_id: materiaId,
          nota1: Number(nota1),
          nota2: Number(nota2),
          nota3: Number(nota3),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar notas');
        return;
      }

      alert(data.mensaje || 'Operación exitosa');
      setAlumnoId('');
      setMateriaId('');
      setNota1('');
      setNota2('');
      setNota3('');
      setEditId(null);
      fetchNotas();
    } catch (err) {
      console.error('❌ Error al guardar notas:', err);
      setError('No se pudo guardar las notas');
    }
  };

  // 🗑️ Eliminar notas
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar estas notas?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/notas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al eliminar notas');
        return;
      }

      alert(data.mensaje || 'Notas eliminadas');
      fetchNotas();
    } catch (err) {
      console.error('❌ Error al eliminar notas:', err);
      setError('No se pudo eliminar las notas');
    }
  };

  return (
    <div>
      <h2>📊 Gestión de Notas</h2>

      {loading && <p>Cargando notas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ➕ Formulario de alta/edición */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="number"
          placeholder="Alumno ID"
          value={alumnoId}
          onChange={(e) => setAlumnoId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Materia ID"
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nota 1"
          value={nota1}
          onChange={(e) => setNota1(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nota 2"
          value={nota2}
          onChange={(e) => setNota2(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nota 3"
          value={nota3}
          onChange={(e) => setNota3(e.target.value)}
        />
        <button type="submit">{editId ? 'Actualizar' : 'Agregar'}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setAlumnoId(''); setMateriaId(''); setNota1(''); setNota2(''); setNota3(''); }}>
            Cancelar
          </button>
        )}
      </form>

      {/* 📋 Tabla de notas */}
      {!loading && notas.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Alumno ID</th>
              <th>Materia ID</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
              <th>Promedio</th>
              <th>Acciones</th>
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
                <td>{((nota.nota1 + nota.nota2 + nota.nota3) / 3).toFixed(2)}</td>
                <td>
                  <button onClick={() => {
                    setEditId(nota.id);
                    setAlumnoId(nota.alumno_id);
                    setMateriaId(nota.materia_id);
                    setNota1(nota.nota1);
                    setNota2(nota.nota2);
                    setNota3(nota.nota3);
                  }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(nota.id)}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No hay notas cargadas</p>
      )}
    </div>
  );
}

export default Notas;
