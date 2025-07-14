'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (email === 'admin@admin.com' && password === 'admin123') {
        // Store user info in cookie
        Cookies.set('user', JSON.stringify({
          email: email,
          role: 'admin',
          name: 'Admin'
        }), { expires: 7 }); // Expires in 7 days
        
        // Redirect to dashboard
        router.push('/');
      } else if (email === 'controleur@example.com' && password === 'controleur123') {
        // Store controleur info in cookie
        Cookies.set('user', JSON.stringify({
          email: email,
          role: 'controleur',
          name: 'Mohammed Alami'
        }), { expires: 7 });

        // Redirect to controleur dashboard
        router.push('/controleur');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Connexion</h1>
          <p className="text-gray-600 mt-2">Bienvenue sur la plateforme de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Entrez votre email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Identifiants de test :</p>
          <p className="mt-1">Admin : admin@admin.com / admin123</p>
          <p>Contrôleur : controleur@example.com / controleur123</p>
        </div>
      </div>
    </div>
  );
}
