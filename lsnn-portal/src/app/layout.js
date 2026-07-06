"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('INICIO');
  const [modoOscuro, setModoOscuro] = useState(false);
  
  const [estadoCiudad, setEstadoCiudad] = useState({
    clima: '☀️ Despejado (28°C)',
    criminalidad: 'ALTO (Idlewood/Ganton)',
    alerta_lspd: 'Alerta Verde',
    publicidad_texto: [] 
  });

  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const { data: dataNoticias, error: errorNoticias } = await supabase
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (errorNoticias) throw errorNoticias;
        if (dataNoticias) setNoticias(dataNoticias);

        const { data: dataCiudad, error: errorCiudad } = await supabase
          .from('estado_ciudad')
          .select('*')
          .eq('id', 1)
          .single();

        if (!errorCiudad && dataCiudad) {
          setEstadoCiudad(dataCiudad);
        }
      } catch (error) {
        console.error("Error cargando datos:", error.message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatosIniciales();
  }, []);

  const noticiasFiltradas = noticias.filter(n => {
    return categoriaSeleccionada === 'INICIO' || (n.categoria && n.categoria.toUpperCase() === categoriaSeleccionada);
  });

  const categoriasMenu = ['INICIO', 'SUCESOS', 'POLÍTICA', 'SOCIEDAD', 'CLASIFICADOS'];

  return (
    <div className={modoOscuro ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-200 transition-colors duration-300">
        
        {/* BARRA DE ÚLTIMA HORA */}
        <div className="bg-red-600 text-white text-sm py-2 px-4 flex items-center overflow-hidden shadow-inner">
           <span className="font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded text-xs mr-3 shrink-0 animate-pulse">
             Última Hora
           </span>
           <marquee className="font-medium">
             {estadoCiudad.ultima_hora || "[LSNN] Sintonizando frecuencias de emergencia..."}
           </marquee>
        </div>

        {/* CABECERA PRINCIPAL */}
        <header className="border-b-4 border-black dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center text-center">
            <Link href="/">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase font-serif text-gray-950 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition cursor-pointer">
                Los Santos <span className="text-red-600">News</span> Network
              </h1>
            </Link>
          </div>
        </header>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="bg-neutral-900 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 flex justify-center space-x-6 py-2">
            {categoriasMenu.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`text-xs font-black uppercase tracking-widest ${categoriaSeleccionada === cat ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-6xl mx-auto px-4 py-8">
           {noticiasFiltradas.map((noticia) => (
              <article key={noticia.id} className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 p-6 rounded-xl mb-6 shadow-sm">
                <h2 className="text-xl font-bold dark:text-white">{noticia.titulo}</h2>
              </article>
           ))}
        </main>

        {/* FOOTER CON BOTÓN FUNCIONAL */}
        <footer className="bg-neutral-900 text-white py-10 mt-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
            <button 
              onClick={() => setModoOscuro(!modoOscuro)}
              className="bg-red-600 px-6 py-2 rounded font-bold uppercase text-xs hover:bg-red-700 transition"
            >
              {modoOscuro ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
            </button>
            <Link href="/login" className="text-xs uppercase font-bold hover:underline">Portal Staff</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}