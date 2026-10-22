import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePersona } from '../../App';
import { obtenerDesafio, participantesDesafio, rankingDesafio, registrarCheckin, listarCheckins, deshacerCheckin, abandonarDesafio, cancelarDesafio } from '../api';
import { Desafio, Persona, RankingFila, Checkin, Paginado } from '../types';
import { mensajeError } from '../errores';

export default function DetalleScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { persona } = usePersona();
  const id = route.params.id;
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [participantes, setParticipantes] = useState<Persona[]>([]);
  const [ranking, setRanking] = useState<RankingFila[]>([]);
  const [checkins, setCheckins] = useState<Paginado<Checkin>>({ items: [], total: 0, page: 1, limit: 20 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  const [nota, setNota] = useState('');
  const [valor, setValor] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function cargar() {
    setError('');
    try {
      const [d, p, r, c] = await Promise.all([
        obtenerDesafio(id),
        participantesDesafio(id),
        rankingDesafio(id),
        listarCheckins(id, persona!.id, 1, 20),
      ]);
      setDesafio(d); setParticipantes(p); setRanking(r); setCheckins(c);
    } catch (e) { setError(mensajeError(e)); }
    finally { setCargando(false); setRefrescando(false); }
  }
  useEffect(() => { cargar(); }, [id]);

  const onRefresh = () => { setRefrescando(true); cargar(); };

  async function registrar(dia?: string) {
    setOcupado(true); setError('');
    try {
      await registrarCheckin(id, { dia, nota: nota.trim(), valor: valor ? Number(valor) : undefined });
      setNota(''); setValor(''); await cargar();
    } catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  }

  async function deshacer() {
    setOcupado(true); setError('');
    try { await deshacerCheckin(id); await cargar(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  }

  async function abandonar() {
    setOcupado(true); setError('');
    try { await abandonarDesafio(id); nav.goBack(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  }

  async function cancelar() {
    setOcupado(true); setError('');
    try { await cancelarDesafio(id); await cargar(); }
    catch (e) { setError(mensajeError(e)); }
    finally { setOcupado(false); }
  }

  if (cargando) return <View style={s.centro}><ActivityIndicator size="large" /></View>;
  if (!desafio) return <View style={s.centro}><Text>No se encontro el desafio.</Text></View>;

  const esCreador = desafio.creadorId === persona?.id;
  const participa = participantes.some((p) => p.id === persona?.id);

  return (
    <View style={s.pantalla}>
      <FlatList
        data={checkins.items}
        keyExtractor={(c) => c.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            <Text style={s.titulo}>{desafio.nombre}</Text>
            <Text style={s.linea}>{desafio.descripcion}</Text>
            <Text style={s.linea}>{desafio.categoria} · {desafio.estado}</Text>
            <Text style={s.linea}>{desafio.inicio} al {desafio.fin}</Text>
            <Text style={s.linea}>Participantes: {desafio.participantes}/{desafio.maxParticipantes}</Text>
            <Text style={s.linea}>Codigo: {desafio.codigo}</Text>
            {desafio.ganador ? <Text style={s.linea}>Ganador: {desafio.ganador.alias} ({desafio.ganador.puntos} pts)</Text> : null}
            {error ? <Text style={s.error}>{error}</Text> : null}
            {participa && desafio.estado === 'ACTIVO' ? (
              <View style={s.bloque}>
                <Text style={s.sub}>Check-in</Text>
                <TextInput style={s.input} placeholder="Nota (opcional)" value={nota} onChangeText={setNota} />
                <TextInput style={s.input} placeholder="Valor (opcional)" value={valor} onChangeText={setValor} keyboardType="numeric" />
                <View style={s.fila}>
                  <TouchableOpacity style={[s.boton, ocupado && s.botonOff]} disabled={ocupado} onPress={() => registrar()}>
                    <Text style={s.botonTxt}>{ocupado ? '...' : 'Registrar hoy'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.boton, ocupado && s.botonOff]} disabled={ocupado} onPress={() => registrar(new Date(Date.now() - 86400000).toISOString().slice(0, 10))}>
                    <Text style={s.botonTxt}>Registrar ayer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.botonSec, ocupado && s.botonOff]} disabled={ocupado} onPress={deshacer}>
                    <Text style={s.botonSecTxt}>Deshacer ultimo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            <View style={s.bloque}>
              <Text style={s.sub}>Ranking</Text>
              {ranking.map((r) => (
                <Text key={r.personaId} style={s.linea}>{r.posicion}. {r.alias} - {r.puntos} pts (racha {r.rachaActual})</Text>
              ))}
            </View>
            <View style={s.bloque}>
              <Text style={s.sub}>Participantes</Text>
              {participantes.map((p) => (
                <Text key={p.id} style={s.linea}>@{p.alias} - {p.nombre}</Text>
              ))}
            </View>
            <View style={s.bloque}>
              <Text style={s.sub}>Mis check-ins</Text>
            </View>
            <View style={s.fila}>
              {!esCreador && participa ? (
                <TouchableOpacity style={[s.botonSec, ocupado && s.botonOff]} disabled={ocupado} onPress={abandonar}>
                  <Text style={s.botonSecTxt}>Abandonar</Text>
                </TouchableOpacity>
              ) : null}
              {esCreador ? (
                <TouchableOpacity style={[s.botonSec, ocupado && s.botonOff]} disabled={ocupado} onPress={cancelar}>
                  <Text style={s.botonSecTxt}>Cancelar desafio</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={s.vacio}>Sin check-ins todavia.</Text>}
        renderItem={({ item }) => (
          <View style={s.tarjeta}>
            <Text style={s.nombre}>{item.dia} - {item.puntos} pts</Text>
            {item.nota ? <Text style={s.linea}>{item.nota}</Text> : null}
            {item.valor != null ? <Text style={s.linea}>Valor: {item.valor}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  sub: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  bloque: { marginTop: 12 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  boton: { backgroundColor: '#1b7a3d', padding: 10, borderRadius: 8, alignItems: 'center' },
  botonOff: { opacity: 0.5 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  botonSec: { backgroundColor: '#e5e5e5', padding: 10, borderRadius: 8, alignItems: 'center' },
  botonSecTxt: { color: '#333' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, elevation: 1 },
  nombre: { fontWeight: 'bold' },
  vacio: { textAlign: 'center', marginTop: 12, color: '#888' },
  error: { color: '#a11', marginBottom: 8 },
});
