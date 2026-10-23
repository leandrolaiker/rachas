import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../session';
import { personasApi, checkinsApi } from '../api';
import type { ResumenItem } from '../types';

export default function InicioScreen({ navigation }: any) {
  const { usuarioId } = useSession();
  const [datos, setDatos] = useState<ResumenItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [accionando, setAccionando] = useState<string | null>(null);

  async function cargar() {
    if (!usuarioId) return;
    setError('');
    try {
      setDatos(await personasApi.inicio(usuarioId));
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useEffect(() => { cargar(); }, [usuarioId]);

  async function checkin(item: ResumenItem) {
    setAccionando(item.desafio.id);
    try {
      await checkinsApi.registrar(item.desafio.id, {});
      await cargar();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error');
    } finally {
      setAccionando(null);
    }
  }

  if (cargando) return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Inicio</Text>
      {error ? <Text style={estilos.error}>{error} <Text onPress={cargar} style={estilos.link}>Reintentar</Text></Text> : null}
      <FlatList
        data={datos}
        keyExtractor={(i) => i.desafio.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListEmptyComponent={<Text style={estilos.vacio}>No tenes desafios vigentes.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={estilos.tarjeta} onPress={() => navigation.navigate('Detalle', { id: item.desafio.id })}>
            <Text style={estilos.nombre}>{item.desafio.nombre}</Text>
            <Text style={estilos.linea}>{item.desafio.estado} · {item.desafio.inicio} al {item.desafio.fin}</Text>
            <Text style={estilos.linea}>Racha: {item.rachaActual} · Posicion: {item.posicion ?? '-'} · Puntos: {item.puntos}</Text>
            <TouchableOpacity
              style={[estilos.boton, item.checkinHoy && estilos.botonDeshabilitado]}
              disabled={item.checkinHoy || accionando === item.desafio.id}
              onPress={() => checkin(item)}
            >
              <Text style={estilos.botonTexto}>{item.checkinHoy ? 'Check-in hecho hoy' : (accionando === item.desafio.id ? 'Registrando...' : 'Hacer check-in')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  boton: { backgroundColor: '#1b7a3d', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { backgroundColor: '#999' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#a11', marginBottom: 8 },
  link: { color: '#1a5fb4' },
  vacio: { textAlign: 'center', marginTop: 24, color: '#666' },
});
