import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@hooks/useAuth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="font-serif text-xl font-bold text-primary-700 mb-8">Admin</h2>
        <nav className="space-y-2">
          <Link to="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-primary-50">Dashboard</Link>
          <Link to="/admin/services" className="block py-2 px-3 rounded hover:bg-primary-50">Servicios</Link>
          <Link to="/admin/reservations" className="block py-2 px-3 rounded hover:bg-primary-50">Reservas</Link>
        </nav>
        <button onClick={onLogout} className="mt-8 text-sm text-red-600 hover:underline">
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
