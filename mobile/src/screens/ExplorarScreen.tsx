import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listarDesafios, unirseDesafio } from '../api';
import { Desafio, Paginado } from '../types';
import { mensajeError } from '../errores';

const CATEGORIAS = ['', 'SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'];
const ESTADOS = ['', 'PROGRAMADO', 'ACTIVO', 'FINALIZADO', 'CANCELADO'];

export default function ExplorarScreen() {
  const nav = useNavigation<any>();
  const [data, setData] = useState<Paginado<Desafio>>({ items: [], total: 0, page: 1, limit: 10 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [uniendo, setUniendo] = useState(false);

  async function cargar(pagina = 1, acumular = false) {
    if (pagina === 1) setCargando(true); else setCargandoMas(true);
    setError('');
    try {
      const res = await listarDesafios({ categoria: categoria || undefined, estado: estado || undefined, page: pagina, limit: 10 });
      setData((prev) => acumular ? { ...res, items: [...prev.items, ...res.items] } : res);
    } catch (e) { setError(mensajeError(e)); }
    finally { setCargando(false); setCargandoMas(false); setRefrescando(false); }
  }
  useEffect(() => { cargar(1); }, [categoria, estado]);

  const onRefresh = () => { setRefrescando(true); cargar(1); };

  async function unirse() {
    if (!codigo.trim()) return;
    setUniendo(true); setError('');
    try { const d = await unirseDesafio(codigo.trim().toUpperCase()); setCodigo(''); nav.navigate('Detalle', { id: d.id }); }
    catch (e) { setError(mensajeError(e)); }
    finally { setUniendo(false); }
  }

  async function cargarMas() {
    if (data.items.length >= data.total) return;
    await cargar(data.page + 1, true);
  }

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Explorar</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <View style={s.fila}>
        <TextInput style={[s.input, { flex: 1 }]} placeholder="Codigo de invitacion" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" />
        <TouchableOpacity style={[s.boton, uniendo && s.botonOff]} disabled={uniendo} onPress={unirse}>
          <Text style={s.botonTxt}>{uniendo ? '...' : 'Unirse'}</Text>
        </TouchableOpacity>
      </View>
      <View style={s.fila}>
        {CATEGORIAS.map((c) => (
          <TouchableOpacity key={c || 'todas'} style={[s.chip, categoria === c && s.chipOn]} onPress={() => setCategoria(c)}>
            <Text style={s.chipTxt}>{c || 'Todas'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.fila}>
        {ESTADOS.map((e) => (
          <TouchableOpacity key={e || 'todos'} style={[s.chip, estado === e && s.chipOn]} onPress={() => setEstado(e)}>
            <Text style={s.chipTxt}>{e || 'Todos'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={data.items}
        keyExtractor={(d) => d.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={<Text style={s.vacio}>Sin resultados.</Text>}
        ListFooterComponent={cargandoMas ? <ActivityIndicator /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.tarjeta} onPress={() => nav.navigate('Detalle', { id: item.id })}>
            <Text style={s.nombre}>{item.nombre}</Text>
            <Text style={s.linea}>{item.categoria} · {item.estado}</Text>
            <Text style={s.linea}>{item.inicio} al {item.fin} · {item.participantes}/{item.maxParticipantes}</Text>
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
  fila: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8, gap: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#ddd' },
  boton: { backgroundColor: '#1a5fb4', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  botonOff: { opacity: 0.6 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e5e5' },
  chipOn: { backgroundColor: '#1a5fb4' },
  chipTxt: { fontSize: 12, color: '#333' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  vacio: { textAlign: 'center', marginTop: 24, color: '#888' },
  error: { color: '#a11', marginBottom: 8 },
});
