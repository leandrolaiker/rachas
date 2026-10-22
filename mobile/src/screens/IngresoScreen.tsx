import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { usePersona } from '../../App';
import { crearPersona, listarPersonas } from '../api';
import { Persona } from '../types';
import { mensajeError } from '../errores';

export default function IngresoScreen() {
  const { setPersona } = usePersona();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [registrando, setRegistrando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState('America/Argentina/Buenos_Aires');

  async function cargar() {
    setCargando(true);
    setError('');
    try { setPersonas(await listarPersonas()); }
    catch (e) { setError(mensajeError(e)); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, []);

  async function registrar() {
    setRegistrando(true); setError('');
    try { const p = await crearPersona({ nombre: nombre.trim(), alias: alias.trim(), email: email.trim(), zonaHoraria: zona.trim() }); setPersona(p); }
    catch (e) { setError(mensajeError(e)); }
    finally { setRegistrando(false); }
  }

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Rachas</Text>
      <Text style={s.sub}>Elegi una persona o registrate</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Text style={s.seccion}>Personas existentes</Text>
      {personas.length === 0 ? <Text style={s.vacio}>No hay personas registradas.</Text> : null}
      <FlatList data={personas} keyExtractor={(p) => p.id} renderItem={({ item }) => (
        <TouchableOpacity style={s.tarjeta} onPress={() => setPersona(item)}>
          <Text style={s.nombre}>{item.nombre}</Text>
          <Text style={s.linea}>@{item.alias} · {item.email}</Text>
        </TouchableOpacity>
      )} />
      <Text style={s.seccion}>Registro nuevo</Text>
      <TextInput style={s.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={s.input} placeholder="Alias (3-20, letras/num/_)" value={alias} onChangeText={setAlias} autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Zona horaria" value={zona} onChangeText={setZona} />
      <TouchableOpacity style={[s.boton, registrando && s.botonOff]} disabled={registrando} onPress={registrar}>
        <Text style={s.botonTxt}>{registrando ? 'Registrando...' : 'Registrarme'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginTop: 24 },
  sub: { color: '#666', marginBottom: 12 },
  seccion: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, elevation: 1 },
  nombre: { fontWeight: 'bold' },
  linea: { color: '#555', fontSize: 13 },
  vacio: { color: '#888', fontStyle: 'italic' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  boton: { backgroundColor: '#1a5fb4', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  botonOff: { opacity: 0.6 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#a11', marginBottom: 8 },
});
