import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../session';
import { desafiosApi, checkinsApi } from '../api';
import type { Desafio, Persona, RankingItem, Checkin, RachasInfo } from '../types';

export default function DetalleScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { usuarioId } = useSession();
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [participantes, setParticipantes] = useState<Persona[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [misCheckins, setMisCheckins] = useState<Checkin[]>([]);
  const [rachas, setRachas] = useState<RachasInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [nota, setNota] = useState('');
  const [valor, setValor] = useState('');
  const [accionando, setAccionando] = useState('');

  const esCreador = !!usuarioId && desafio?.creadorId === usuarioId;

  async function cargar() {
    setError('');
    try {
      const d = await desafiosApi.uno(id);
      setDesafio(d);
      const [ps, rk] = await Promise.all([
        desafiosApi.participantes(id),
        desafiosApi.ranking(id),
      ]);
      setParticipantes(ps);
      setRanking(rk);
      if (usuarioId) {
        try {
          const hc = await checkinsApi.listar(id, usuarioId, 1, 100);
          setMisCheckins(hc.items);
        } catch { setMisCheckins([]); }
        try {
          setRachas(await checkinsApi.rachas(id, usuarioId));
        } catch { setRachas(null); }
      }
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useEffect(() => { cargar(); }, [id, usuarioId]);

  async function checkin() {
    if (!usuarioId) return;
    setAccionando('checkin');
    try {
      await checkinsApi.registrar(id, { nota: nota.trim(), valor: valor ? Number(valor) : undefined });
      setNota(''); setValor('');
      await cargar();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error');
    } finally {
      setAccionando('');
    }
  }

  async function deshacer() {
    if (!usuarioId) return;
    setAccionando('deshacer');
    try {
      await checkinsApi.deshacer(id);
      await cargar();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error');
    } finally {
      setAccionando('');
    }
  }

  async function abandonar() {
    Alert.alert('Abandonar', 'Seguro que queres abandonar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abandonar', style: 'destructive', onPress: async () => {
        setAccionando('abandonar');
        try { await desafiosApi.abandonar(id); navigation.goBack(); }
        catch (e: any) { Alert.alert('Error', e?.message || 'Error'); }
        finally { setAccionando(''); }
      } },
    ]);
  }

  async function cancelar() {
    Alert.alert('Cancelar desafio', 'Seguro que queres cancelar?', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancelar', style: 'destructive', onPress: async () => {
        setAccionando('cancelar');
        try { await desafiosApi.cancelar(id); await cargar(); }
        catch (e: any) { Alert.alert('Error', e?.message || 'Error'); }
        finally { setAccionando(''); }
      } },
    ]);
  }

  if (cargando) return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;
  if (error || !desafio) return <View style={estilos.centro}><Text style={estilos.error}>{error || 'No encontrado'}</Text><Text onPress={cargar} style={estilos.link}>Reintentar</Text></View>;

  return (
    <ScrollView style={estilos.pantalla} refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}>
      <Text style={estilos.titulo}>{desafio.nombre}</Text>
      <Text style={estilos.linea}>{desafio.descripcion}</Text>
      <Text style={estilos.linea}>{desafio.categoria} · {desafio.estado}</Text>
      <Text style={estilos.linea}>{desafio.inicio} al {desafio.fin}</Text>
      <Text style={estilos.linea}>Cupo: {desafio.participantes ?? participantes.length}/{desafio.maxParticipantes}</Text>
      <Text style={estilos.codigo}>Codigo: {desafio.codigo}</Text>

      {rachas ? (
        <View style={estilos.bloque}>
          <Text style={estilos.sub}>Tu racha</Text>
          <Text style={estilos.linea}>Actual: {rachas.rachaActual} · Mejor: {rachas.mejorRacha} · Puntos: {rachas.puntos}</Text>
        </View>
      ) : null}

      {usuarioId && desafio.estado === 'ACTIVO' ? (
        <View style={estilos.bloque}>
          <Text style={estilos.sub}>Check-in</Text>
          <TextInput style={estilos.input} placeholder="Nota (opcional)" value={nota} onChangeText={setNota} />
          <TextInput style={estilos.input} placeholder="Valor (opcional)" value={valor} onChangeText={setValor} keyboardType="numeric" />
          <View style={estilos.row}>
            <TouchableOpacity style={estilos.boton} onPress={checkin} disabled={accionando === 'checkin'}>
              <Text style={estilos.botonTexto}>{accionando === 'checkin' ? 'Registrando...' : 'Registrar check-in'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[estilos.boton, estilos.botonSec]} onPress={deshacer} disabled={accionando === 'deshacer'}>
              <Text style={estilos.botonTexto}>{accionando === 'deshacer' ? '...' : 'Deshacer hoy'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {misCheckins.length > 0 ? (
        <View style={estilos.bloque}>
          <Text style={estilos.sub}>Tu historial</Text>
          {misCheckins.map((c) => (
            <Text key={c.id} style={estilos.linea}>{c.dia} · {c.puntos} pts {c.nota ? `- ${c.nota}` : ''}</Text>
          ))}
        </View>
      ) : null}

      <View style={estilos.bloque}>
        <Text style={estilos.sub}>Ranking</Text>
        {ranking.length === 0 ? <Text style={estilos.linea}>Sin participantes.</Text> : null}
        {ranking.map((r) => (
          <Text key={r.personaId} style={estilos.linea}>{r.posicion}. {r.alias} · {r.puntos} pts · racha {r.rachaActual}</Text>
        ))}
        {desafio.estado === 'FINALIZADO' && ranking.length > 0 ? (
          <Text style={estilos.ganador}>Ganador: {ranking[0].alias}</Text>
        ) : null}
      </View>

      <View style={estilos.bloque}>
        <Text style={estilos.sub}>Participantes</Text>
        {participantes.length === 0 ? <Text style={estilos.linea}>Sin participantes.</Text> : null}
        {participantes.map((p) => (
          <Text key={p.id} style={estilos.linea}>{p.nombre} (@{p.alias})</Text>
        ))}
      </View>

      <View style={estilos.row}>
        {usuarioId && desafio.creadorId !== usuarioId ? (
          <TouchableOpacity style={[estilos.boton, estilos.botonPeligro]} onPress={abandonar}>
            <Text style={estilos.botonTexto}>Abandonar</Text>
          </TouchableOpacity>
        ) : null}
        {esCreador ? (
          <TouchableOpacity style={[estilos.boton, estilos.botonPeligro]} onPress={cancelar}>
            <Text style={estilos.botonTexto}>Cancelar desafio</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {accionando === 'abandonar' || accionando === 'cancelar' ? <ActivityIndicator /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  linea: { fontSize: 14, color: '#333', marginTop: 4 },
  codigo: { fontSize: 16, fontWeight: 'bold', marginTop: 8, color: '#1a5fb4' },
  bloque: { marginTop: 12, padding: 12, backgroundColor: '#f4f4f4', borderRadius: 10 },
  sub: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  boton: { backgroundColor: '#1a5fb4', padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8, marginBottom: 8, flex: 1 },
  botonSec: { backgroundColor: '#555' },
  botonPeligro: { backgroundColor: '#a11' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#a11', marginBottom: 8 },
  link: { color: '#1a5fb4', marginTop: 8 },
  ganador: { fontWeight: 'bold', color: '#1b7a3d', marginTop: 8 },
});
