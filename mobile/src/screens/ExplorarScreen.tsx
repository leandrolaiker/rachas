import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { desafiosApi } from '../api';
import type { Desafio } from '../types';

const CATEGORIAS = ['', 'SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'];
const ESTADOS = ['', 'PROGRAMADO', 'ACTIVO', 'FINALIZADO', 'CANCELADO'];

export default function ExplorarScreen({ navigation }: any) {
  const [items, setItems] = useState<Desafio[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [uniendo, setUniendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function cargar(p = 1, reset = false) {
    setError('');
    try {
      const res = await desafiosApi.listar({ categoria: categoria || undefined, estado: estado || undefined, page: p, limit: 10 });
      setItems(reset || p === 1 ? res.items : [...items, ...res.items]);
      setTotal(res.total);
      setPage(p);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  React.useEffect(() => { setCargando(true); cargar(1, true); }, [categoria, estado]);

  async function unirse() {
    setUniendo(true);
    setMensaje('');
    try {
      await desafiosApi.unirse(codigo.trim().toUpperCase());
      setMensaje('Te uniste correctamente.');
      setCodigo('');
      cargar(1, true);
    } catch (e: any) {
      setMensaje(e?.message || 'Error');
    } finally {
      setUniendo(false);
    }
  }

  if (cargando) return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Explorar</Text>
      {error ? <Text style={estilos.error}>{error} <Text onPress={() => { setCargando(true); cargar(1, true); }} style={estilos.link}>Reintentar</Text></Text> : null}

      <View style={estilos.filtros}>
        <ScrollViewH CATEGORIAS={CATEGORIAS} valor={categoria} onChange={setCategoria} />
      </View>
      <View style={estilos.filtros}>
        <ScrollViewH CATEGORIAS={ESTADOS} valor={estado} onChange={setEstado} />
      </View>

      <View style={estilos.union}>
        <TextInput style={estilos.input} placeholder="Codigo de invitacion" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" />
        <TouchableOpacity style={estilos.boton} onPress={unirse} disabled={uniendo || !codigo}>
          <Text style={estilos.botonTexto}>{uniendo ? 'Uniendome...' : 'Unirse'}</Text>
        </TouchableOpacity>
      </View>
      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(1, true); }} />}
        ListEmptyComponent={<Text style={estilos.vacio}>No hay desafios.</Text>}
        onEndReached={() => { if (items.length < total) cargar(page + 1); }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity style={estilos.tarjeta} onPress={() => navigation.navigate('Detalle', { id: item.id })}>
            <Text style={estilos.nombre}>{item.nombre}</Text>
            <Text style={estilos.linea}>{item.categoria} · {item.estado}</Text>
            <Text style={estilos.linea}>{item.inicio} al {item.fin} · {item.participantes ?? 0}/{item.maxParticipantes}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ScrollViewH({ CATEGORIAS, valor, onChange }: any) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {CATEGORIAS.map((c: string) => (
        <TouchableOpacity key={c || 'todos'} style={[estilos.chip, valor === c && estilos.chipActivo]} onPress={() => onChange(c)}>
          <Text style={estilos.chipTexto}>{c || 'Todos'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  filtros: { marginBottom: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee', marginRight: 6, marginBottom: 6 },
  chipActivo: { backgroundColor: '#1a5fb4' },
  chipTexto: { color: '#333', fontSize: 12 },
  union: { flexDirection: 'row', marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  boton: { backgroundColor: '#1a5fb4', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  error: { color: '#a11', marginBottom: 8 },
  link: { color: '#1a5fb4' },
  vacio: { textAlign: 'center', marginTop: 24, color: '#666' },
  mensaje: { color: '#1b7a3d', marginBottom: 8 },
});
