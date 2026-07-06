"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function PanelRedaccion() {
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [categoria, setCategoria] = useState("Sucesos");
  const [autor, setAutor] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [parrafos, setParrafos] = useState([""]);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarCambioParrafo = (index, value) => {
    const nuevosParrafos = [...parrafos];
    nuevosParrafos[index] = value;
    setParrafos(nuevosParrafos);
  };

  const añadirParrafo = () => setParrafos([...parrafos, ""]);
  const eliminarParrafo = (index) => {
    if (parrafos.length === 1) return;
    setParrafos(parrafos.filter((_, i) => i !== index));
  };

  const publicarArticulo = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const formatoAutor = autor.replace(/\s+/g, '_');
    const cuerpoFiltrado = parrafos.filter(p => p.trim() !== "");

    const { error } = await supabase
      .from('noticias')
      .insert([
        {
          titulo,
          subtitulo,
          categoria,
          autor: formatoAutor,
          imagen: imagenUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
          contenido: cuerpoFiltrado
        }
      ]);

    setCargando(false);

    if (error) {
      alert("Error al publicar en Supabase: " + error.message);
    } else {
      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        setTitulo("");
        setSubtitulo("");
        setAutor("");
        setImagenUrl("");
        setParrafos([""]);
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-black border-b border-gray-800 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="bg-red-600 text-white font-black text-sm px-2.5 py-1 rounded tracking-tighter uppercase">LSNN</span>
          <h1 className="text-sm font-bold uppercase tracking-wider text-gray-300">Terminal de Redacción</h1>
        </div>
        
        {/* ENLACES DE NAVEGACIÓN DE LA BARRA SUPERIOR */}
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <Link href="/dashboard" className="text-gray-400 hover:text-red-500 transition flex items-center gap-1">
            📊 Volver al Dashboard
          </Link>
          <span className="text-neutral-700">|</span>
          <Link href="/" className="text-gray-400 hover:text-white transition flex items-center gap-1">
            ← Salir a Portada
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 md:p-8 shadow-2xl">
          <div className="mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Redactar Nueva Nota</h2>
          </div>

          {mensajeExito && (
            <div className="mb-6 bg-green-950/50 border border-green-500 text-green-200 text-sm p-4 rounded-lg">
              ✔ ¡Artículo subido a la base de datos de Supabase con éxito!
            </div>
          )}

          <form onSubmit={publicarArticulo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del Reportero (IC):</label>
                <input type="text" placeholder="Ej: Saul_Ramos" value={autor} onChange={(e) => setAutor(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría:</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 cursor-pointer">
                  <option value="Sucesos">Sucesos</option>
                  <option value="Política">Política</option>
                  <option value="Economía">Economía</option>
                  <option value="Sociedad">Sociedad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Titular Principal:</label>
              <input type="text" placeholder="Escribe el título..." value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 font-bold" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subtítulo:</label>
              <textarea rows="2" placeholder="Resumen corto..." value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" required></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enlace de la Captura (Imgur/Discord):</label>
              <input type="url" placeholder="https://..." value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 text-xs" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Cuerpo del Reportaje:</label>
                <button type="button" onClick={añadirParrafo} className="bg-gray-900 border border-gray-700 text-xs font-bold px-3 py-1 rounded text-gray-300">+</button>
              </div>

              {parrafos.map((parrafo, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="text-xs font-bold text-gray-600 bg-gray-900 p-2.5 rounded border border-gray-800">#{index + 1}</span>
                  <textarea rows="3" placeholder="Contenido..." value={parrafo} onChange={(e) => manejarCambioParrafo(index, e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" required></textarea>
                  <button type="button" onClick={() => eliminarParrafo(index)} className="bg-red-950/30 border border-red-900 text-red-400 p-2.5 rounded text-sm">🗑</button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-6 flex justify-end">
              <button type="submit" disabled={cargando} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-lg transition tracking-wider disabled:opacity-50">
                {cargando ? "Publicando..." : "Publicar Reportaje de Prensa"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}