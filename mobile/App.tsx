import React, { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { traerDesafios, ApiError, Desafio, EstadoDesafio } from './src/api';

const Contenedor = Platform.OS === 'web' ? View : SafeAreaView;

function colorEstado(estado: EstadoDesafio) {
  if (estado === 'ACTIVO') return '#1b7a3d';
  if (estado === 'PROGRAMADO') return '#8a6d00';
  if (estado === 'FINALIZADO') return '#555';
  return '#a11';
}

export default function App() {
  const [datos, setDatos] = useState<Desafio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargar() {
    try {
      setError('');
      const lista = await traerDesafios();
      setDatos(lista);
    } catch (e: unknown) {
      if (e instanceof ApiError) setError(e.message);
      else setError('No pude traer los desafios. Revisa que el back este corriendo.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  if (cargando) {
    return (
      <Contenedor style={estilos.centro}>
        <ActivityIndicator size="large" />
        <Text style={estilos.mensaje}>Trayendo los desafios...</Text>
      </Contenedor>
    );
  }

  if (error && datos.length === 0) {
    return (
      <Contenedor style={estilos.centro}>
        <Text style={estilos.titulo}>Rachas</Text>
        <Text style={estilos.mensaje}>{error}</Text>
        <Text style={estilos.detalle} onPress={cargar}>Toca para reintentar</Text>
      </Contenedor>
    );
  }

  return (
    <Contenedor style={estilos.pantalla}>
      <Text style={estilos.titulo}>Rachas</Text>
      <Text style={estilos.subtitulo}>Desafios con amigos</Text>
      {error ? <Text style={estilos.aviso}>{error}</Text> : null}
      <ScrollView style={estilos.lista} contentContainerStyle={estilos.listaContenido}>
        {datos.length === 0 ? (
          <Text style={estilos.mensaje}>Todavia no hay desafios.</Text>
        ) : (
          datos.map((item) => (
            <View key={item.id} style={estilos.tarjeta}>
              <Text style={estilos.nombre}>{item.nombre}</Text>
              <Text style={estilos.linea}>{item.categoria} - {item.inicio} al {item.fin}</Text>
              <Text style={[estilos.estado, { color: colorEstado(item.estado) }]}>{item.estado}</Text>
              <Text style={estilos.linea}>{item.participantes ?? 0}/{item.maxParticipantes} participantes</Text>
            </View>
          ))
        )}
      </ScrollView>
    </Contenedor>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa', ...(Platform.OS === 'web' ? { minHeight: '100vh' as any, maxWidth: 640, width: '100%', marginHorizontal: 'auto' as any } : {}) },
  lista: { flex: 1 },
  listaContenido: { paddingBottom: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, ...(Platform.OS === 'web' ? { minHeight: '100vh' as any } : {}) },
  titulo: { fontSize: 28, fontWeight: 'bold' },
  subtitulo: { fontSize: 15, color: '#666', marginBottom: 12 },
  mensaje: { marginTop: 12, fontSize: 15, textAlign: 'center' },
  detalle: { marginTop: 8, color: '#1a5fb4', fontSize: 15 },
  aviso: { color: '#a11', marginBottom: 8 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold' },
  linea: { fontSize: 13, color: '#555', marginTop: 4 },
  estado: { fontWeight: 'bold', marginTop: 6 },
});

registerRootComponent(App);
