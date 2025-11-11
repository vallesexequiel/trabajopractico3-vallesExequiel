import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Alumnos from './pages/Alumnos.jsx';
import Materias from './pages/Materias.jsx';
import Notas from './pages/Notas.jsx';

function App() {
  return (
    <BrowserRouter>
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
