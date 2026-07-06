"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function DetalleNoticia() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nombrePersonaje, setNombrePersonaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const theme = window.localStorage.getItem('lsnn-theme');
    const prefersDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setModoOscuro(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  // Carga la noticia y sus comentarios correspondientes desde Supabase
  useEffect(() => {
    async function cargarDatos() {
      if (!id) return;
      
      // 1. Obtener la noticia por ID
      const { data: nota, error: errorNota } = await supabase
        .from('noticias')
        .select('*')
        .eq('id', id)
        .single();

      if (nota) {
        setNoticia(nota);
      }

      // 2. Obtener los comentarios vinculados a esta noticia
      const { data: coms, error: errorComs } = await supabase
        .from('comentarios')
        .select('*')
        .eq('noticia_id', id)
        .order('created_at', { ascending: true });

      if (coms) {
        setComentarios(coms);
      }
      
      setCargando(false);
    }

    cargarDatos();
  }, [id]);

  // Guarda el comentario de forma real en la base de datos
  const deponerComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !nombrePersonaje.trim()) return;

    const formatoUsuario = nombrePersonaje.replace(/\s+/g, '_');

    const { data, error } = await supabase
      .from('comentarios')
      .insert([
        { 
          noticia_id: id, 
          usuario: formatoUsuario, 
          texto: nuevoComentario 
        }
      ])
      .select()
      .single();

    if (error) {
      alert("Error al publicar el comentario: " + error.message);
    } else if (data) {
      setComentarios([...comentarios, data]);
      setNuevoComentario("");
    }
  };

  if (cargando) {
    return <div className="p-8 text-center text-gray-500 animate-pulse font-bold">Sincronizando con LSNN Database...</div>;
  }

  if (!noticia) {
    return (
      <div className={`p-8 text-center min-h-screen flex flex-col justify-center items-center ${modoOscuro ? 'bg-neutral-950 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
        <p className="text-red-500 text-lg font-bold">Error 404: Reportaje no encontrado en los archivos de prensa.</p>
        <a href="/" className="mt-4 text-sm text-red-600 font-bold hover:underline">← Volver a Portada</a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${modoOscuro ? 'bg-neutral-950 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* ENCABEZADO PEQUEÑO DE RETORNO */}
      <header className={`border-b py-4 shadow-sm transition-colors duration-300 ${modoOscuro ? 'border-neutral-800 bg-neutral-950' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <a href="/" className={`text-sm font-bold hover:underline transition flex items-center gap-1 ${modoOscuro ? 'text-red-400' : 'text-red-600 hover:text-black'}`}>
            ← Volver a Portada
          </a>
          <span className="text-xs font-black px-2 py-1 uppercase tracking-tighter bg-red-600 text-white">
            LSNN Interno
          </span>
        </div>
      </header>

      {/* CONTENEDOR DEL ARTÍCULO */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        <article className={`rounded-xl p-6 md:p-10 shadow-sm transition-colors duration-300 ${modoOscuro ? 'bg-neutral-900 border border-neutral-800 text-gray-100' : 'bg-white border border-gray-200 text-gray-900'}`}>
          
          {/* META-INFORMACIÓN */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-red-600 text-white text-xs uppercase font-extrabold px-2 py-0.5 rounded">
              {noticia.categoria}
            </span>
            <span className={`text-xs font-semibold ${modoOscuro ? 'text-neutral-300' : 'text-gray-400'}`}>
              {new Date(noticia.created_at).toLocaleString()}
            </span>
          </div>

          {/* TITULARES */}
          <h1 className={`text-3xl md:text-5xl font-black leading-tight mb-4 font-serif ${modoOscuro ? 'text-white' : 'text-gray-950'}`}>
            {noticia.titulo}
          </h1>
          <p className={`text-lg md:text-xl font-medium leading-relaxed mb-6 border-l-4 pl-4 italic ${modoOscuro ? 'text-neutral-300 border-neutral-700' : 'text-gray-600 border-gray-300'}`}>
            {noticia.subtitulo}
          </p>

          {/* CRÉDITOS DE AUTORÍA */}
          <div className={`border-y py-3 mb-6 flex items-center justify-between text-xs ${modoOscuro ? 'border-neutral-800 text-neutral-300' : 'border-gray-200 text-gray-500'}`}>
            <span>Redacción por: <strong className={`${modoOscuro ? 'text-white' : 'text-gray-800'}`}>{noticia.autor}</strong></span>
            <span className={`${modoOscuro ? 'text-neutral-400' : 'text-gray-400'}`}>Edición verificada IC</span>
          </div>

          {/* IMAGEN DE LA NOTICIA */}
          <div className={`w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8 shadow-inner transition-colors duration-300 ${modoOscuro ? 'bg-neutral-800' : 'bg-gray-100'}`}>
            <a href={noticia.imagen} target="_blank" rel="noreferrer noopener" className="block w-full h-full">
              <img src={noticia.imagen} alt="Reportaje fotográfico" className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
            </a>
          </div>

          {/* CUERPO DE LA NOTICIA */}
          <div className={`space-y-6 text-base md:text-lg leading-relaxed font-normal ${modoOscuro ? 'text-gray-100' : 'text-gray-800'}`}>
            {noticia.contenido.map((parrafo, idx) => (
              <p key={idx}>{parrafo}</p>
            ))}
          </div>

        </article>

        {/* 💬 SECCIÓN DE COMENTARIOS DE LOS CIUDADANOS */}
        <section className={`mt-12 rounded-xl p-6 md:p-10 shadow-sm transition-colors duration-300 ${modoOscuro ? 'bg-neutral-900 border border-neutral-800 text-gray-100' : 'bg-white border border-gray-200 text-gray-900'}`}>
          <h3 className={`text-xl font-bold uppercase border-b-2 pb-2 mb-6 tracking-tight ${modoOscuro ? 'text-white border-neutral-700' : 'text-gray-950 border-black'}`}>
            Comentarios de la Ciudadanía ({comentarios.length})
          </h3>

          {/* FORMULARIO PARA DEJAR COMENTARIO */}
          <form onSubmit={deponerComentario} className={`space-y-4 mb-8 rounded-lg p-4 border transition-colors duration-300 ${modoOscuro ? 'bg-neutral-950 border-neutral-800 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${modoOscuro ? 'text-neutral-300' : 'text-gray-500'}`}>Publicar un comentario In-Character</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${modoOscuro ? 'text-gray-200' : 'text-gray-700'}`}>Nombre de tu Personaje:</label>
                <input 
                  type="text" 
                  placeholder="Ej: Dimitri_Romanov"
                  value={nombrePersonaje}
                  onChange={(e) => setNombrePersonaje(e.target.value)}
                  className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition ${modoOscuro ? 'bg-neutral-900 border border-neutral-700 text-gray-100 placeholder:text-neutral-500' : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${modoOscuro ? 'text-gray-200' : 'text-gray-700'}`}>Tu Comentario:</label>
              <textarea 
                rows="3"
                placeholder="Escribe tu opinión respetando el entorno del personaje..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition ${modoOscuro ? 'bg-neutral-900 border border-neutral-700 text-gray-100 placeholder:text-neutral-500' : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="bg-black hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition shadow-sm"
            >
              Enviar Comentario
            </button>
          </form>

          {/* LISTADO DE COMENTARIOS PUBLICADOS */}
          <div className="space-y-4">
            {comentarios.map((com) => (
              <div key={com.id} className={`border-b pb-4 last:border-none last:pb-0 transition-colors duration-300 ${modoOscuro ? 'border-neutral-800' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className={`font-bold hover:underline cursor-pointer ${modoOscuro ? 'text-white' : 'text-gray-950'}`}>
                    👤 {com.usuario}
                  </span>
                  <span className={`${modoOscuro ? 'text-neutral-400' : 'text-gray-400'}`}>
                    {new Date(com.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm p-2.5 rounded border transition-colors duration-300 ${modoOscuro ? 'bg-neutral-950 border-neutral-800 text-gray-100' : 'bg-gray-50/50 border-gray-100 text-gray-700'}`}>
                  {com.texto}
                </p>
              </div>
            ))}
          </div>

        </section>

      </main>
    </div>
  );
}