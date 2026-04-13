import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <nav className="container-page flex items-center justify-between py-4">
          <Link to="/" className="font-serif text-xl font-bold text-primary-700">
            Ana Castellano
          </Link>
          <ul className="flex gap-6 text-sm font-medium">
            <li><Link to="/" className="hover:text-primary-600">Inicio</Link></li>
            <li><Link to="/about" className="hover:text-primary-600">Sobre mí</Link></li>
            <li><Link to="/services" className="hover:text-primary-600">Servicios</Link></li>
            <li><Link to="/reservations" className="hover:text-primary-600">Reservar</Link></li>
            <li><Link to="/contact" className="hover:text-primary-600">Contacto</Link></li>
          </ul>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Ana Castellano Florista
      </footer>
    </div>
  );
}
