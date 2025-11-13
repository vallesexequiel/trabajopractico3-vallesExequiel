import { useEffect, useState } from 'react';

function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // 📥 Obtener alumnos
  const fetchAlumnos = async () => {
    if (!token) {
      setError('No hay token, inicia sesión primero');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/alumnos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al obtener alumnos');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAlumnos(data);
    } catch (err) {
      console.error('❌ Error al conectar con el backend:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  // ✅ Validaciones frontend
  const validarCampos = () => {
    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return false;
    }
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!soloLetras.test(nombre) || !soloLetras.test(apellido)) {
      setError('Nombre y apellido deben contener solo letras');
      return false;
    }
    if (nombre.length < 2 || apellido.length < 2) {
      setError('Nombre y apellido deben tener al menos 2 caracteres');
      return false;
    }
    return true;
  };

  // ➕ Crear o ✏️ Editar alumno
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      const url = editId
        ? `http://localhost:3001/api/alumnos/${editId}`
        : 'http://localhost:3001/api/alumnos';

      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, apellido }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar alumno');
        return;
      }

      alert(data.message || 'Operación exitosa');
      setNombre('');
      setApellido('');
      setEditId(null);
      setError('');
      fetchAlumnos();
    } catch (err) {
      console.error('❌ Error al guardar alumno:', err);
      setError('No se pudo guardar el alumno');
    }
  };

  // 🗑️ Eliminar alumno
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este alumno?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/alumnos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al eliminar alumno');
        return;
      }

      alert(data.message || 'Alumno eliminado');
      fetchAlumnos();
    } catch (err) {
      console.error('❌ Error al eliminar alumno:', err);
      setError('No se pudo eliminar el alumno');
    }
  };

  return (
    <div>
      <h2>👨‍🎓 Gestión de Alumnos</h2>

      {loading && <p>Cargando alumnos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ➕ Formulario */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
        <button type="submit">{editId ? 'Actualizar' : 'Agregar'}</button>
        {editId && (
          <button type="button" onClick={() => {
            setEditId(null);
            setNombre('');
            setApellido('');
            setError('');
          }}>
            Cancelar
          </button>
        )}
      </form>

      {/* 📋 Tabla */}
      {!loading && alumnos.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id}>
                <td>{alumno.id}</td>
                <td>{alumno.nombre}</td>
                <td>{alumno.apellido}</td>
                <td>
                  <button onClick={() => {
                    setEditId(alumno.id);
                    setNombre(alumno.nombre);
                    setApellido(alumno.apellido);
                    setError('');
                  }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(alumno.id)}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p>No hay alumnos cargados</p>
      )}
    </div>
  );
}

export default Alumnos;
