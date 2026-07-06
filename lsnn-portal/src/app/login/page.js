"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const authSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Procesando...');

    try {
      if (esRegistro) {
        // 1. Registro en Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data?.user) {
          // 2. Crear perfil en la tabla 'perfiles'
          await supabase.from('perfiles').insert([
            { id: data.user.id, username: username, rol: 'LECTOR' }
          ]);
          setMensaje('¡Registro exitoso! Ya puedes iniciar sesión.');
          setEsRegistro(false);
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        router.push('/dashboard');
      }
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-black text-center tracking-tighter uppercase mb-2">
          LSNN <span className="text-red-600">Portal Interno</span>
        </h2>
        <p className="text-xs text-center text-gray-500 uppercase tracking-widest mb-6">
          {esRegistro ? 'Crea tu cuenta de ciudadano' : 'Ingresa tus credenciales autorizadas'}
        </p>

        <form onSubmit={authSubmit} className="space-y-4">
          {esRegistro && (
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Nombre de Usuario (Nombre_Apellido IC)</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Dimitri_Romanov" className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded text-sm focus:outline-none focus:border-red-600" />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="prensa@lsnn.com" className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded text-sm focus:outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded text-sm focus:outline-none focus:border-red-600" />
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase py-2.5 text-xs tracking-wider transition rounded">
            {esRegistro ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        {mensaje && <p className="text-xs text-center mt-4 text-yellow-500 font-medium">{mensaje}</p>}

        <div className="mt-6 text-center border-t border-neutral-800 pt-4">
          <button onClick={() => setEsRegistro(!esRegistro)} className="text-xs text-gray-400 hover:text-white transition underline">
            {esRegistro ? '¿Ya posees cuenta? Loguéate' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}