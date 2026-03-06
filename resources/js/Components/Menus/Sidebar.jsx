import { Link } from '@inertiajs/react';

export default function Sidebar({ links }) {
    return (
        // Cambiamos <nav> a <aside> que suele usarse semánticamente para menús laterales en layouts complejos
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-lg hidden md:flex">

      {/* Título o Logo del menú */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold tracking-wide">Mi Proyecto</h2>
      </div>

      {/* Lista de enlaces */}
      <ul className="flex flex-col space-y-1 mt-6 flex-grow px-3">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.url}
              className={`block px-4 py-3 rounded-md transition-colors duration-200 font-medium ${
                link.active
                  ? 'bg-blue-600 text-white shadow-sm' // Estilo cuando estamos en esta página
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white' // Estilo normal
              }`}
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
    );
}
