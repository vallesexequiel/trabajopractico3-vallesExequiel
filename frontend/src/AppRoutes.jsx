import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Alumnos from './pages/Alumnos.jsx';
import Materias from './pages/Materias.jsx';
import Notas from './pages/Notas.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function AppRoutes() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    alert('👋 Sesión cerrada');
    navigate('/');
  };

  return (
    <>
      {/*  Navbar dinámico */}
      <nav style={{ padding: '10px', background: '#eee' }}>
        {token ? (
          <>
            <Link to="/alumnos" style={{ marginRight: '10px' }}>Alumnos</Link>
            <Link to="/materias" style={{ marginRight: '10px' }}>Materias</Link>
            <Link to="/notas" style={{ marginRight: '10px' }}>Notas</Link>
            <button 
              onClick={handleLogout} 
              style={{ marginLeft: '20px', padding: '5px 10px', cursor: 'pointer' }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </nav>

      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={setToken} />} />

        {/*  Rutas protegidas */}
        <Route path="/alumnos" element={
          <ProtectedRoute token={token}>
            <Alumnos />
          </ProtectedRoute>
        } />
        <Route path="/materias" element={
          <ProtectedRoute token={token}>
            <Materias />
          </ProtectedRoute>
        } />
        <Route path="/notas" element={
          <ProtectedRoute token={token}>
            <Notas />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default AppRoutes;
