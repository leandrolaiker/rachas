import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../session';
import { personasApi, desafiosApi } from '../api';
import type { Persona, Desafio, RankingItem } from '../types';

export default function PerfilScreen() {
  const { usuarioId, setSession } = useSession();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [nombre, setNombre] = useState('');
  const [zona, setZona] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [finalizados, setFinalizados] = useState<{ desafio: Desafio; posicion: number | null; puntos: number; ganador: string | null }[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    if (!usuarioId) return;
    setError('');
    try {
      const p = await personasApi.una(usuarioId);
      setPersona(p);
      setNombre(p.nombre);
      setZona(p.zonaHoraria);
      const res = await desafiosApi.listar({ personaId: usuarioId, estado: 'FINALIZADO', limit: 50 });
      const out: any[] = [];
      for (const d of res.items) {
        let posicion: number | null = null;
        let puntos = 0;
        let ganador: string | null = null;
        try {
          const rk = await desafiosApi.ranking(d.id);
          const fila = rk.find((r) => r.personaId === usuarioId);
          posicion = fila ? fila.posicion : null;
          puntos = fila ? fila.puntos : 0;
          ganador = rk.length ? rk[0].alias : null;
        } catch {}
        out.push({ desafio: d, posicion, puntos, ganador });
      }
      setFinalizados(out);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, [usuarioId]);

  async function guardar() {
    if (!usuarioId) return;
    setGuardando(true);
    setError('');
    try {
      const p = await personasApi.actualizar(usuarioId, { nombre: nombre.trim(), zonaHoraria: zona.trim() });
      setPersona(p);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Perfil</Text>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      {persona ? (
        <>
          <Text style={estilos.label}>@{persona.alias} · {persona.email}</Text>
          <Text style={estilos.label}>Nombre</Text>
          <TextInput style={estilos.input} value={nombre} onChangeText={setNombre} />
          <Text style={estilos.label}>Zona horaria</Text>
          <TextInput style={estilos.input} value={zona} onChangeText={setZona} />
          <TouchableOpacity style={estilos.boton} onPress={guardar} disabled={guardando}>
            <Text style={estilos.botonTexto}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <Text style={estilos.seccion}>Desafios finalizados</Text>
      {finalizados.length === 0 ? <Text style={estilos.vacio}>No tenes desafios finalizados.</Text> : null}
      {finalizados.map((f) => (
        <View key={f.desafio.id} style={estilos.tarjeta}>
          <Text style={estilos.nombre}>{f.desafio.nombre}</Text>
          <Text style={estilos.linea}>Posicion: {f.posicion ?? '-'} · Puntos: {f.puntos}</Text>
          <Text style={estilos.linea}>Ganador: {f.ganador ?? '-'}</Text>
        </View>
      ))}

      <TouchableOpacity style={[estilos.boton, estilos.botonPeligro]} onPress={() => setSession(null)}>
        <Text style={estilos.botonTexto}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  seccion: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  label: { color: '#555', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  boton: { backgroundColor: '#1a5fb4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  botonPeligro: { backgroundColor: '#a11' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 2 },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  linea: { color: '#555', fontSize: 13, marginTop: 2 },
  error: { color: '#a11', marginBottom: 8 },
  vacio: { color: '#666', marginBottom: 8 },
});
