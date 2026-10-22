import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePersona } from '../../App';
import { resumenInicio, registrarCheckin } from '../api';
import { ResumenItem } from '../types';
import { mensajeError } from '../errores';

export default function InicioScreen() {
  const { persona } = usePersona();
  const nav = useNavigation<any>();
  const [items, setItems] = useState<ResumenItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  async function cargar() {
    setError('');
    try { setItems(await resumenInicio()); }
    catch (e) { setError(mensajeError(e)); }
    finally { setCargando(false); setRefrescando(false); }
  }
  useEffect(() => { cargar(); }, []);

  const onRefresh = useCallback(() => { setRefrescando(true); cargar(); }, []);

  async function checkinRapido(item: ResumenItem) {
    setOcupado(item.id);
    try { await registrarCheckin(item.id, {}); await cargar(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(null); }
  }

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Mis desafios</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={s.vacio}>No tienes desafios vigentes.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.tarjeta} onPress={() => nav.navigate('Detalle', { id: item.id })}>
            <Text style={s.nombre}>{item.nombre}</Text>
            <Text style={s.linea}>{item.categoria} · {item.inicio} al {item.fin}</Text>
            <Text style={s.linea}>Racha: {item.rachaActual} · Posicion: {item.posicion ?? '-'} · {item.hizoCheckinHoy ? 'Ya hiciste check-in hoy' : 'Pendiente'}</Text>
            <TouchableOpacity
              style={[s.boton, (item.hizoCheckinHoy || ocupado === item.id) && s.botonOff]}
              disabled={item.hizoCheckinHoy || ocupado === item.id}
              onPress={() => checkinRapido(item)}
            >
              <Text style={s.botonTxt}>{ocupado === item.id ? 'Registrando...' : 'Check-in'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  boton: { backgroundColor: '#1b7a3d', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonOff: { opacity: 0.5 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  vacio: { textAlign: 'center', marginTop: 24, color: '#888' },
  error: { color: '#a11', marginBottom: 8 },
});
