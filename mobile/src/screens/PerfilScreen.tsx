import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePersona } from '../../App';
import { actualizarPersona, desafiosDePersona, obtenerDesafio } from '../api';
import { Desafio } from '../types';
import { mensajeError } from '../errores';

export default function PerfilScreen() {
  const nav = useNavigation<any>();
  const { persona, setPersona, cerrarSesion } = usePersona();
  const [nombre, setNombre] = useState(persona?.nombre || '');
  const [zona, setZona] = useState(persona?.zonaHoraria || 'America/Argentina/Buenos_Aires');
  const [historial, setHistorial] = useState<Desafio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    if (!persona) return;
    setCargando(true); setError('');
    try {
      const lista = await desafiosDePersona(persona.id);
      const finalizados = lista.filter((d) => d.estado === 'FINALIZADO');
      const conGanador = await Promise.all(finalizados.map(async (d) => {
        try { const full = await obtenerDesafio(d.id); return full; } catch { return d; }
      }));
      setHistorial(conGanador);
    } catch (e) { setError(mensajeError(e)); }
    finally { setCargando(false); }
  }
  useEffect(() => { cargar(); }, [persona]);

  async function guardar() {
    if (!persona) return;
    setGuardando(true); setError('');
    try {
      const actualizada = await actualizarPersona(persona.id, { nombre: nombre.trim(), zonaHoraria: zona.trim() });
      setPersona(actualizada);
    } catch (e) { setError(mensajeError(e)); }
    finally { setGuardando(false); }
  }

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Perfil</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Text style={s.label}>Nombre</Text>
      <TextInput style={s.input} value={nombre} onChangeText={setNombre} />
      <Text style={s.label}>Zona horaria</Text>
      <TextInput style={s.input} value={zona} onChangeText={setZona} />
      <TouchableOpacity style={[s.boton, guardando && s.botonOff]} disabled={guardando} onPress={guardar}>
        <Text style={s.botonTxt}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
      </TouchableOpacity>
      <Text style={s.seccion}>Desafios finalizados</Text>
      {historial.length === 0 ? <Text style={s.vacio}>Sin desafios finalizados.</Text> : null}
      {historial.map((d) => (
        <View key={d.id} style={s.tarjeta}>
          <Text style={s.nombre}>{d.nombre}</Text>
          <Text style={s.linea}>{d.inicio} al {d.fin}</Text>
          <Text style={s.linea}>{d.ganador ? (d.ganador.personaId === persona?.id ? 'Ganaste' : `Gano ${d.ganador.alias}`) : 'Sin ganador'}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.botonSec} onPress={cerrarSesion}>
        <Text style={s.botonSecTxt}>Cerrar sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  label: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  seccion: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  boton: { backgroundColor: '#1a5fb4', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  botonOff: { opacity: 0.6 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  botonSec: { backgroundColor: '#e5e5e5', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  botonSecTxt: { color: '#333' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, elevation: 1 },
  nombre: { fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  vacio: { color: '#888', fontStyle: 'italic' },
  error: { color: '#a11', marginBottom: 8 },
});
