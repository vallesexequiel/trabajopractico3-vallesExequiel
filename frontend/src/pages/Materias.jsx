import { useEffect, useState } from 'react';

function Materias() {
  const [materias, setMaterias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // 📥 Obtener todas las materias
  const fetchMaterias = async () => {
    if (!token) {
      setError('No hay token, inicia sesión primero');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/materias', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al obtener materias');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMaterias(data);
    } catch (err) {
      console.error('❌ Error al conectar con el backend:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  // ➕ Crear o ✏️ Editar materia
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      const url = editId
        ? `http://localhost:3001/api/materias/${editId}`
        : 'http://localhost:3001/api/materias';

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar materia');
        return;
      }

      alert(data.message || 'Operación exitosa');
      setNombre('');
      setEditId(null);
      fetchMaterias();
    } catch (err) {
      console.error('❌ Error al guardar materia:', err);
      setError('No se pudo guardar la materia');
    }
  };

  // 🗑️ Eliminar materia
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta materia?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/materias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al eliminar materia');
        return;
      }

      alert(data.message || 'Materia eliminada');
      fetchMaterias();
    } catch (err) {
      console.error('❌ Error al eliminar materia:', err);
      setError('No se pudo eliminar la materia');
    }
  };

  return (
    <div>
      <h2>📘 Gestión de Materias</h2>

      {loading && <p>Cargando materias...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ➕ Formulario de alta/edición */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nombre de la materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="submit">{editId ? 'Actualizar' : 'Agregar'}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setNombre(''); }}>
            Cancelar
          </button>
        )}
      </form>

      {/* 📋 Tabla de materias */}
      {!loading && materias.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.id}</td>
                <td>{materia.nombre}</td>
                <td>
                  <button onClick={() => { setEditId(materia.id); setNombre(materia.nombre); }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(materia.id)}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No hay materias cargadas</p>
      )}
    </div>
  );
}

export default Materias;
