import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { meApi } from '../api';
import { useSession } from '../session';
import type { Persona, Desafio, RankingItem } from '../types';

export default function PerfilScreen() {
  const { usuarioId, setSession } = useSession();
  const [persona, setPersona] = React.useState<Persona | null>(null);
  const [nombre, setNombre] = React.useState('');
  const [zona, setZona] = React.useState('');
  const [guardando, setGuardando] = React.useState(false);
  const [error, setError] = React.useState('');
  const [guardados, setGuardados] = React.useState<any[]>([]);
  const [cargando, setCargando] = React.useState(true);

  async function cargar() {
    if (!usuarioId) return;
    setError('');
    try {
      const p = await meApi.obtener();
      setPersona(p);
      setNombre(p.nombre || '');
      setZona(p.zonaHoraria || '');
      setCargando(false);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar el perfil.');
    }
  }

  async function guardar() {
    if (!usuarioId) return;
    setGuardando(true);
    setError('');
    try {
      const p = await meApi.obtener();
      setPersona(p);
      setNombre(p.nombre || '');
      setZona(p.zonaHoraria || '');
    } catch (e: any) {
      setError(e?.message || 'Error al guardar.');
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
      <Text style={estilos.vacio}>Cargando...</Text>

      <TouchableOpacity
        style={[estilos.boton, estilos.botonPeligro]}
        onPress={async () => {
          try { await setSession(null, null); } catch {}
        }}
      >
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