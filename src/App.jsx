import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeusChamados from './pages/MeusChamados';
import NovoChamado from './pages/NovoChamado';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Perfil from './pages/Perfil';
import DetalhesChamado from './pages/DetalhesChamado';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#2a2a2a',
                color: '#e5e2e2',
                border: '1px solid #44474a',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#ffffff', secondary: '#2b3137' } },
              error: { iconTheme: { primary: '#ffb4ab', secondary: '#690005' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chamados" element={<MeusChamados />} />
              <Route path="/chamados/novo" element={<NovoChamado />} />
              <Route path="/chamados/:id" element={<DetalhesChamado />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
