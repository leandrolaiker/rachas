import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { personasApi } from '../api';
import { useSession } from '../session';
import type { Persona } from '../types';

export default function IngresoScreen() {
  const { setSession } = useSession();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState('America/Argentina/Buenos_Aires');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      setPersonas(await personasApi.listar());
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function registrar() {
    setGuardando(true);
    try {
      const p = await personasApi.crear({ nombre, alias, email, zonaHoraria: zona });
      await setSession(p.id);
    } catch (e: any) {
      Alert.alert('No se pudo registrar', e?.message || 'Error');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Rachas</Text>
      <Text style={estilos.sub}>Ingreso</Text>
      {error ? <Text style={estilos.error}>{error} <Text onPress={cargar} style={estilos.link}>Reintentar</Text></Text> : null}

      {!modoRegistro ? (
        <>
          <Text style={estilos.seccion}>Elegir una persona ya registrada</Text>
          {personas.length === 0 ? <Text style={estilos.vacio}>No hay personas registradas.</Text> : null}
          {personas.map((p) => (
            <TouchableOpacity key={p.id} style={estilos.tarjeta} onPress={() => setSession(p.id)}>
              <Text style={estilos.nombre}>{p.nombre}</Text>
              <Text style={estilos.detalle}>@{p.alias} · {p.email}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={estilos.boton} onPress={() => setModoRegistro(true)}>
            <Text style={estilos.botonTexto}>Registrarme</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={estilos.seccion}>Nuevo registro</Text>
          <TextInput style={estilos.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={estilos.input} placeholder="Alias (3-20, letras/num/_)" value={alias} onChangeText={setAlias} autoCapitalize="none" />
          <TextInput style={estilos.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={estilos.input} placeholder="Zona horaria" value={zona} onChangeText={setZona} />
          <TouchableOpacity style={estilos.boton} onPress={registrar} disabled={guardando}>
            <Text style={estilos.botonTexto}>{guardando ? 'Guardando...' : 'Crear cuenta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModoRegistro(false)}>
            <Text style={estilos.link}>Volver</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 16, color: '#666', marginBottom: 16 },
  seccion: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 2 },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  detalle: { color: '#555', fontSize: 13, marginTop: 2 },
  boton: { backgroundColor: '#1a5fb4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  error: { color: '#a11', marginBottom: 8 },
  link: { color: '#1a5fb4', marginTop: 8 },
  vacio: { color: '#666', marginBottom: 8 },
});
