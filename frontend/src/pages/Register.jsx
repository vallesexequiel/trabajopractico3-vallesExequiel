import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      //  Parseamos la respuesta directamente como JSON
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token); // Guardar token en localStorage
        setToken(data.token);                      // Actualizar estado global
        alert('✅ Registro exitoso');
        navigate('/alumnos');                      // Redirigir automáticamente
      } else {
        alert(`❌ Error: ${data.error || 'Respuesta inválida del servidor'}`);
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      alert('❌ No se pudo conectar con el servidor');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Registrarse</button>
    </form>
  );
}

export default Register;
