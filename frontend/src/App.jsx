import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Alumnos from './pages/Alumnos.jsx';
import Materias from './pages/Materias.jsx';
import Notas from './pages/Notas.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* ✅ Navbar simple */}
      <nav style={{ padding: '10px', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/register" style={{ marginRight: '10px' }}>Registro</Link>
        <Link to="/alumnos" style={{ marginRight: '10px' }}>Alumnos</Link>
        <Link to="/materias" style={{ marginRight: '10px' }}>Materias</Link>
        <Link to="/notas">Notas</Link>
      </nav>

      {/* ✅ Rutas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/alumnos" element={<Alumnos />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/notas" element={<Notas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
