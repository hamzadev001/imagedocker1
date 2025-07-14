"use client";

import { FaHistory, FaInbox, FaPaperPlane, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { IoNotificationsOutline } from "react-icons/io5";

function NavLink({ title, icon, count, onClick }: { title: string; icon: JSX.Element; count?: number; onClick?: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white p-4 rounded-xl flex items-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        <div className="text-xl">{icon}</div>
        <span className="text-lg font-medium">{title}</span>
        {count !== undefined && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{count}</span>
        )}
      </button>
    </li>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
  const isControleur = user?.role === 'controleur';

  const handleLogout = () => {
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <div className="w-72 bg-white shadow-xl p-6 space-y-8 fixed h-screen overflow-y-auto z-20">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full">
          <FaUserCircle size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isControleur ? 'CONTROLEUR' : 'ADMIN'}</h2>
          <p className="text-sm text-gray-500">Bienvenue !</p>
        </div>
      </div>
      <nav>
        <ul className="space-y-4">
          <NavLink 
            title="Dashboard" 
            icon={<MdDashboard size={20} />} 
            onClick={() => router.push(isControleur ? "/controleur" : "/")} 
          />
          <NavLink 
            title="Établissements" 
            icon={<FaInbox size={20} />} 
            onClick={() => router.push(isControleur ? "/controleur/etablissements" : "/etablissement")} 
          />
          <NavLink 
            title="Notifications" 
            icon={<IoNotificationsOutline size={20} />} 
            count={5} 
            onClick={() => router.push(isControleur ? "/controleur/notifications" : "/notifications")} 
          />
          <NavLink 
            title="Investigations" 
            icon={<FaHistory size={20} />} 
            onClick={() => router.push(isControleur ? "/controleur/investigations" : "/investigations")} 
          />
          {isControleur && (
            <NavLink 
              title="Mon Profil" 
              icon={<FaUserCircle size={20} />} 
              onClick={() => router.push("/controleur/profil")} 
            />
          )}
          <NavLink title="Déconnexion" icon={<FaSignOutAlt size={20} />} onClick={handleLogout} />
        </ul>
      </nav>
    </div>
  );
}
