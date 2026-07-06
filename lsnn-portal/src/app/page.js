"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('INICIO');
  const [busqueda, setBusqueda] = useState('');
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const theme = window.localStorage.getItem('lsnn-theme');
    if (theme === 'dark' || theme === 'light') {
      setModoOscuro(theme === 'dark');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModoOscuro(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', modoOscuro);
    window.localStorage.setItem('lsnn-theme', modoOscuro ? 'dark' : 'light');
  }, [modoOscuro]);
  
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
        console.error("Error sincronizando el portal con Supabase:", error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarDatosIniciales();
  }, []);

  const noticiasFiltradas = noticias.filter(n => {
    const coincideBusqueda = n.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === 'INICIO' || (n.categoria && n.categoria.toUpperCase() === categoriaSeleccionada);
    return coincideBusqueda && coincideCategoria;
  });

  const categoriasMenu = ['INICIO', 'SUCESOS', 'POLÍTICA', 'SOCIEDAD', 'CLASIFICADOS'];

  return (
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

        {/* CABECERA PRINCIPAL (HEADER) */}
        <header className="relative overflow-hidden border-b-4 border-black dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors duration-300 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center text-center">
            
            <div className="w-full flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-neutral-800 pb-3 mb-6">
              <div>Edición Digital Nº 142</div>
              <div>Los Santos, San Andreas</div>
              <div>Domingo, 2026</div>
            </div>

            <Link href="/">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase font-serif text-gray-950 dark:text-white hover:text-red-600 dark:hover:text-red-500 transition cursor-pointer selection:bg-red-600 selection:text-white">
                Los Santos <span className="text-red-600">News</span> Network
              </h1>
            </Link>
            <p className="text-sm font-medium italic text-gray-600 dark:text-gray-400 mt-2 tracking-wide font-serif">
              "La verdad informativa al servicio de la ciudadanía de San Andreas"
            </p>

          </div>
        </header>

        {/* CATEGORÍAS (MENÚ DE NAVEGACIÓN DINÁMICO) */}
        <nav className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-white sticky top-0 z-50 shadow-xl border-b border-neutral-800 backdrop-blur-sm bg-white/80 dark:bg-neutral-950/90">
          <div className="max-w-6xl mx-auto px-4 flex justify-center space-x-2 md:space-x-4 overflow-x-auto py-3">
            {categoriasMenu.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-150 shadow-sm ${
                  categoriaSeleccionada === cat
                    ? 'bg-red-600 text-white shadow-red-500/20 dark:bg-red-500 dark:text-neutral-950'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-red-500 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* CUERPO PRINCIPAL (GRID DE CONTENIDO) */}
        <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA Y CENTRAL: LISTADO DE REPORTAJES (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="border-b-2 border-gray-900 dark:border-neutral-700 pb-2 flex justify-between items-end">
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950 dark:text-white font-serif">
                {categoriaSeleccionada === 'INICIO' ? 'Titulares Principales' : `Sección: ${categoriaSeleccionada}`}
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {noticiasFiltradas.length} artículos encontrados
              </span>
            </div>

            {cargando ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                Sincronizando con la central de LSNN...
              </div>
            ) : noticiasFiltradas.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm p-8 transition-colors">
                <span className="text-4xl">📰</span>
                <p className="text-gray-500 dark:text-gray-400 italic mt-4 font-serif text-lg">
                  No hay reportajes redactados en la sección de {categoriaSeleccionada.toLowerCase()} en este momento.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {noticiasFiltradas.map((noticia) => (
                  <article 
                    key={noticia.id} 
                    className="bg-white/95 dark:bg-neutral-900/95 border border-gray-200/70 dark:border-neutral-800/70 rounded-3xl overflow-hidden shadow-xl shadow-red-500/10 hover:shadow-2xl transition duration-300 flex flex-col md:flex-row group backdrop-blur-[1px]"
                  >
                    <div className="md:w-72 h-48 md:h-auto relative overflow-hidden shrink-0">
                      <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                        {(noticia.galeria_imagenes?.length > 0 ? noticia.galeria_imagenes : [noticia.imagen]).map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={noticia.titulo}
                            className="w-full h-full object-cover shrink-0 snap-center group-hover:scale-105 transition duration-300"
                          />
                        ))}
                      </div>
                      
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
                        {noticia.categoria}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <Link href={`/noticia/${noticia.id}`}>
                          <h3 className="text-xl font-bold text-gray-950 dark:text-white font-serif leading-snug hover:text-red-600 dark:hover:text-red-500 transition cursor-pointer">
                            {noticia.titulo}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {noticia.subtitulo}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-neutral-800 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold">
                            ✍️ {noticia.autor}
                          </span>
                        </div>
                        <div>
                          📅 {new Date(noticia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>

          {/* COLUMNA DERECHA: SIDEBAR DINÁMICO (1/3) */}
          <div className="space-y-6">
            
            {/* Widget de Estado del Clima Dinámico */}
            <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border-2 border-black dark:border-neutral-800 p-4 rounded-3xl shadow-2xl shadow-red-500/5 transition-colors">
              <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-red-500/10 dark:bg-red-500/15 blur-3xl"></div>
              <h3 className="text-sm font-black uppercase tracking-wider border-b border-gray-200 dark:border-neutral-800 pb-2 mb-3 text-gray-950 dark:text-white">
                🌤️ Estado de Los Santos
              </h3>
              <div className="space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Temperatura General:</span>
                  <span className="text-red-600 dark:text-red-500 font-bold">{estadoCiudad.clima}</span>
                </div>
                <div className="flex justify-between">
                  <span>Riesgo de Criminalidad:</span>
                  <span className="text-orange-600 dark:text-orange-500 font-bold">{estadoCiudad.criminalidad}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jurisdicción de Alerta:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{estadoCiudad.alerta_lspd}</span>
                </div>
              </div>
            </div>

            {/* CARTELERA COMERCIAL DINÁMICA MULTI-MARCA */}
            <div className="bg-white/95 text-gray-900 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-black dark:text-white p-5 rounded-3xl border border-neutral-800 shadow-xl space-y-5">
              <div>
                <span className="text-[10px] font-black tracking-widest text-black uppercase block mb-1 dark:text-yellow-500">Espacios Publicitarios</span>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight dark:text-white">Marcas Asociadas a LSNN</h4>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {estadoCiudad.publicidad_texto && Array.isArray(estadoCiudad.publicidad_texto) && estadoCiudad.publicidad_texto.length > 0 ? (
                  estadoCiudad.publicidad_texto.map((pub, index) => (
                    <div key={index} className="bg-white/90 dark:bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/5 rounded-full blur-xl pointer-events-none"></div>
                      <h5 className="text-base font-black tracking-tight text-gray-900 uppercase font-serif border-b border-neutral-800 pb-1 mb-1.5 dark:text-white">{pub.titulo}</h5>
                      <p className="text-xs text-gray-900 leading-relaxed italic dark:text-gray-400">
                        "{pub.texto}"
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded font-mono text-neutral-500">SPONSOR #{index + 1}</span>
                        <span className="font-bold text-red-500">Verificado</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 border border-dashed border-neutral-800 rounded-lg">
                    <p className="text-xs text-neutral-500 italic">¿Quieres anunciar tu negocio aquí?<br/>Contacta al departamento de publicidad.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Teléfonos de Emergencia Rol (IC) */}
            <div className="bg-red-50/50 dark:bg-neutral-900/80 border border-red-200 dark:border-red-950/60 p-4 rounded-xl transition-colors">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-400 mb-2">🚨 Central de Emergencias IC</h4>
              <ul className="text-xs font-bold text-red-950 dark:text-red-200 space-y-1">
                <li className="flex justify-between"><span>LSPD (Policía):</span> <span>911</span></li>
                <li className="flex justify-between"><span>SAFD (Médicos/Bomberos):</span> <span>911</span></li>
                <li className="flex justify-between"><span>Línea Directa LSNN:</span> <span>55521192</span></li>
              </ul>
            </div>

          </div>

        </main>

        {/* PIE DE PÁGINA (FOOTER) */}
        <footer className="bg-white/95 text-gray-700 dark:bg-neutral-950 dark:text-gray-400 border-t-4 border-red-600 mt-16 font-serif backdrop-blur-md shadow-inner">
          <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-neutral-900">
            
            <div className="space-y-3">
              <h3 className="text-gray-900 font-bold uppercase tracking-tight text-lg dark:text-white">Los Santos News Network</h3>
              <p className="text-xs text-gray-700 leading-relaxed font-sans dark:text-gray-400">
                Somos la cadena de información periodística líder en todo el estado de San Andreas, comprometidos con la verdad y la inmediatez de los sucesos locales.
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <h3 className="text-gray-900 font-bold uppercase tracking-tight text-sm dark:text-white">Secciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => setCategoriaSeleccionada('INICIO')} className="text-left text-gray-900 hover:text-white dark:text-gray-200 dark:hover:text-white transition">Principal</button>
                <button onClick={() => setCategoriaSeleccionada('SUCESOS')} className="text-left text-gray-900 hover:text-white dark:text-gray-200 dark:hover:text-white transition">Sucesos Críticos</button>
                <button onClick={() => setCategoriaSeleccionada('POLÍTICA')} className="text-left text-gray-900 hover:text-white dark:text-gray-200 dark:hover:text-white transition">Gobernación</button>
                <button onClick={() => setCategoriaSeleccionada('SOCIEDAD')} className="text-left text-gray-900 hover:text-white dark:text-gray-200 dark:hover:text-white transition">Cultura y Eventos</button>
              </div>
            </div>

            <div className="space-y-4 font-sans">
              <h3 className="text-gray-900 font-bold uppercase tracking-tight text-sm dark:text-white">Configuración y Acceso</h3>
              
              <button 
                onClick={() => setModoOscuro(!modoOscuro)}
                className="w-full text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-2 rounded-2xl transition duration-200 shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-1.5 border border-neutral-800"
              >
                {modoOscuro ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
              </button>

              <Link href="/login" className="w-full text-center bg-neutral-900 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-2 rounded transition shadow-sm flex items-center justify-center gap-1.5 border border-neutral-800">
                👤 Portal Staff / Ciudadano
              </Link>
            </div>

          </div>

          <div className="max-w-6xl mx-auto px-4 py-8 text-[11px] space-y-4 font-sans">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-900 dark:text-gray-400 font-medium">
              <a href="#" className="text-gray-900 hover:underline dark:text-gray-400">Términos de Uso IC</a>
              <a href="#" className="text-gray-900 hover:underline dark:text-gray-400">Política de Privacidad</a>
              <a href="#" className="text-gray-900 hover:underline dark:text-gray-400">Código Deontológico Periodístico</a>
              <a href="#" className="text-gray-900 hover:underline dark:text-gray-400">Normativa de Prensa de San Andreas</a>
              <a href="#" className="text-gray-900 hover:underline dark:text-gray-400">Mapa del Sitio Web</a>
            </div>

            <div className="text-gray-900 leading-relaxed dark:text-gray-400">
              <p>© 2026 Los Santos News Network. Una división de San Andreas Broadcasting & Media Corporation. Todos los derechos reservados.</p>
              <p className="mt-1 text-gray-700 dark:text-gray-600">Todo el contenido publicado en este portal web tiene propósitos estrictamente de entretenimiento y simulación de rol (In-Character) dentro de la comunidad de SARP.</p>
            </div>
         </div>
        </footer>
      </div> 
  );
}