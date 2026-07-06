"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados independientes para el módulo de clima modular
  const [climaEmoji, setClimaEmoji] = useState('☀️');
  const [climaTexto, setClimaTexto] = useState('Despejado');
  const [climaTemperatura, setClimaTemperatura] = useState('28');

  // Estados para los demás datos editables
  const [criminalidad, setCriminalidad] = useState('');
  const [alertaLspd, setAlertaLspd] = useState('');
  const [ultimaHora, setUltimaHora] = useState(''); // Nuevo estado para la barra superior de marquesina
  
  // Lista dinámica para gestionar múltiples publicidades simultáneas
  const [publicidades, setPublicidades] = useState([{ titulo: '', texto: '' }]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function verificarAcceso() {
      // 1. Obtener sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUsuario(session.user);

      // 2. Obtener rol del perfil
      const { data: prof } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
      
      if (!prof || prof.rol === 'LECTOR') {
        alert('Acceso denegado: No eres miembro activo del Staff de LSNN.');
        router.push('/');
        return;
      }
      setPerfil(prof);

      // 3. Traer los datos actuales del Clima/Publicidad
      const { data: ciudad } = await supabase.from('estado_ciudad').select('*').eq('id', 1).single();
      if (ciudad) {
        // Procesar el string del clima (Ej: "☀️ Despejado (28°C)")
        const climaString = ciudad.clima || "";
        const regexClima = /^([^\s]+)\s+(.+?)\s*\((\d+)(?:°C)?\)$/;
        const match = climaString.match(regexClima);

        if (match) {
          setClimaEmoji(match[1]);       
          setClimaTexto(match[2]);       
          setClimaTemperatura(match[3]); 
        } else if (climaString) {
          setClimaTexto(climaString);
        }

        setCriminalidad(ciudad.criminalidad);
        setAlertaLspd(ciudad.alerta_lspd);
        setUltimaHora(ciudad.ultima_hora || ''); // Carga del dato desde Supabase

        // Procesar la publicidad dinámica almacenada como JSONB
        if (ciudad.publicidad_texto) {
          if (Array.isArray(ciudad.publicidad_texto)) {
            setPublicidades(ciudad.publicidad_texto);
          } else {
            setPublicidades([{ titulo: 'Anuncio Publicitario', texto: city.publicidad_texto }]);
          }
        }
      }
      setCargando(false);
    }
    verificarAcceso();
  }, [router]);

  // Funciones de control de la lista de publicidad dinámica
  const manejarCambioPublicidad = (index, campo, valor) => {
    const nuevasPubs = [...publicidades];
    nuevasPubs[index][campo] = valor;
    setPublicidades(nuevasPubs);
  };

  const agregarPublicidad = () => {
    setPublicidades([...publicidades, { titulo: '', texto: '' }]);
  };

  const eliminarPublicidad = (index) => {
    if (publicidades.length === 1) return;
    setPublicidades(publicidades.filter((_, i) => i !== index));
  };

  const guardarCambiosGobernacion = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const climaFormateado = `${climaEmoji} ${climaTexto.trim()} (${climaTemperatura}°C)`;
    const publicidadesFiltradas = publicidades.filter(p => p.titulo.trim() !== "" || p.texto.trim() !== "");

    try {
      const { error } = await supabase.from('estado_ciudad').update({
        clima: climaFormateado,
        criminalidad,
        alerta_lspd: alertaLspd,
        ultima_hora: ultimaHora.trim(), // Sincronización del nuevo campo
        publicidad_texto: publicidadesFiltradas,
        updated_at: new Date()
      }).eq('id', 1);

      if (error) throw error;
      alert('¡Portal de LSNN actualizado con éxito! La marquesina de Última Hora está en vivo.');
    } catch (err) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (cargando) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold">Verificando credenciales de credencial de prensa...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR DEL DASHBOARD */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <span className="bg-red-600 text-white font-black px-2 py-1 rounded text-xs uppercase tracking-tighter">LSNN STAFF</span>
            <h2 className="text-lg font-bold mt-2 font-serif text-white">{perfil?.username}</h2>
            <p className="text-[10px] text-red-500 font-black tracking-widest uppercase mt-0.5">Rango: {perfil?.rol}</p>
          </div>

          <nav className="space-y-2 text-sm font-bold uppercase tracking-wider">
            <Link href="/dashboard" className="block p-3 rounded bg-neutral-800 text-red-500">
              📊 Panel de Control
            </Link>
            <Link href="/redaccion" className="block p-3 rounded hover:bg-neutral-800 transition text-gray-400 hover:text-white">
              ✍️ Redactar Noticia
            </Link>
            <Link href="/" className="block p-3 rounded hover:bg-neutral-800 transition text-gray-400 hover:text-white">
              🏠 Volver a la Web Principal
            </Link>
          </nav>
        </div>

        <button onClick={cerrarSesion} className="w-full mt-8 bg-neutral-950 border border-neutral-800 hover:bg-red-950 text-red-500 font-bold uppercase py-2 text-xs rounded transition">
          Cerrar Sesión General
        </button>
      </aside>

      {/* CONTENIDO DE CONFIGURACIÓN */}
      <main className="flex-1 p-8 max-w-5xl">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white font-serif mb-2">Administración del Entorno</h1>
        <p className="text-sm text-gray-400 mb-8">Modifica los módulos inmersivos globales que visualizan los usuarios en tiempo real en la página principal.</p>

        <form onSubmit={guardarCambiosGobernacion} className="space-y-6">
          
          {/* NUEVO SUB-MÓDULO INTERNO: MARQUESINA DE ÚLTIMA HORA */}
          <div className="bg-neutral-900 border-l-4 border-red-600 p-6 rounded-r-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/10 space-y-3 shadow-md">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">🚨 Cintillo de Inmersión: Última Hora</h3>
              <p className="text-xs text-gray-400 mt-0.5">Este texto cruzará horizontalmente el extremo superior de la portada simulando alertas periodísticas en vivo.</p>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Ej: [LSPD] Operativo en South Central resulta en múltiples detenciones -- [WEATHER] Ola de calor..."
                value={ultimaHora} 
                onChange={e => setUltimaHora(e.target.value)} 
                className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded text-sm text-white focus:outline-none focus:border-red-600 font-mono text-red-400 placeholder:text-neutral-700"
                required
              />
            </div>
          </div>
          
          {/* MÓDULO 1: ESTADO DE LA CIUDAD */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-red-500 border-b border-neutral-800 pb-2">🌤️ Satélite y Seguridad de Los Santos</h3>
            
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4">
              
              {/* CLIMA ACTUAL MODULAR */}
              <div className="flex-1">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Clima Actual e Inmersión</label>
                <div className="flex gap-2">
                  <select
                    value={climaEmoji}
                    onChange={(e) => setClimaEmoji(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="☀️">☀️ Soleado</option>
                    <option value="☁️">☁️ Nublado</option>
                    <option value="🌧️">🌧️ Lluvia</option>
                    <option value="⛈️">⛈️ Tormenta</option>
                    <option value="🌫️">🌫️ Niebla</option>
                    <option value="🍃">🍃 Ventoso</option>
                    <option value="🌙">🌙 Noche</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Ej: Despejado"
                    value={climaTexto} 
                    onChange={e => setClimaTexto(e.target.value)} 
                    className="flex-1 bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-red-600" 
                    required
                  />

                  <div className="relative flex items-center w-24">
                    <input 
                      type="number" 
                      placeholder="28"
                      value={climaTemperatura} 
                      onChange={e => setClimaTemperatura(e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 pr-7 rounded text-sm text-white text-center focus:outline-none focus:border-red-600" 
                      required
                    />
                    <span className="absolute right-2.5 text-xs font-bold text-neutral-500 pointer-events-none">°C</span>
                  </div>
                </div>
              </div>

              {/* ÍNDICE DE CRIMINALIDAD */}
              <div className="w-full lg:w-1/4">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Índice de Criminalidad</label>
                <input type="text" value={criminalidad} onChange={e => setCriminalidad(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-red-600" />
              </div>

              {/* CÓDIGO OPERATIVO LSPD */}
              <div className="w-full lg:w-1/4">
                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Código Operativo LSPD</label>
                <input type="text" value={alertaLspd} onChange={e => setAlertaLspd(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-red-600" />
              </div>
            </div>
          </div>

          {/* MÓDULO 2: GESTIÓN DE PATROCINIOS DINÁMICOS MULTIPLES */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-yellow-500">💰 Gestión de Patrocinios y Marcas</h3>
              <button 
                type="button" 
                onClick={agregarPublicidad} 
                className="bg-neutral-950 border border-neutral-700 hover:border-yellow-500 text-xs font-bold px-3 py-1 rounded text-yellow-500 transition"
              >
                + Añadir Marca Patrocinadora
              </button>
            </div>

            <div className="space-y-6">
              {publicidades.map((pub, index) => (
                <div key={index} className="bg-neutral-950/40 p-4 border border-neutral-800/80 rounded-lg relative space-y-3">
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Patrocinio #{index + 1}</span>
                    {publicidades.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => eliminarPublicidad(index)} 
                        className="text-red-500 hover:text-red-400 text-xs font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded transition"
                      >
                        🗑 Remover Marca
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Nombre de la Empresa Comercial</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Aura Athletics"
                      value={pub.titulo} 
                      onChange={e => manejarCambioPublicidad(index, 'titulo', e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-yellow-600" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Slogan o Mensaje del Anuncio</label>
                    <textarea 
                      rows="2" 
                      placeholder='Ej: "Viste como un atleta profesional..."'
                      value={pub.texto} 
                      onChange={e => manejarCambioPublicidad(index, 'texto', e.target.value)} 
                      className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white resize-none focus:outline-none focus:border-yellow-600"
                      required
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-black uppercase py-3 px-6 text-xs tracking-widest rounded-lg transition shadow-lg">
              {guardando ? 'Sincronizando Base de Datos...' : '💾 Publicar Cambios en Vivo'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}