import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inicio from './pages/Inicio';
import Configuracion from './pages/Configuracion';
import Periodos from './pages/Periodos';
import Materias from './pages/Materias';
import Horarios from './pages/Horarios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas anidadas del panel principal */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Inicio />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="periodos" element={<Periodos />} />
          <Route path="materias" element={<Materias />} />
          <Route path="horarios" element={<Horarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;