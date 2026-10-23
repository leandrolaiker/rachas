import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { desafiosApi } from '../api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSession } from '../session';

const CATEGORIAS = ['SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'];

export default function CrearDesafioScreen({ navigation }: any) {
  const { usuarioId } = useSession();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('SALUD');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [maxParticipantes, setMaxParticipantes] = useState('10');
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function crear() {
    setError('');
    if (!inicio || !fin) { setError('Completa las fechas (YYYY-MM-DD).'); return; }
    setGuardando(true);
    try {
      const d = await desafiosApi.crear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        inicio: inicio.trim(),
        fin: fin.trim(),
        maxParticipantes: Number(maxParticipantes),
      });
      navigation.navigate('Detalle', { id: d.id });
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Crear desafio</Text>
      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <Text style={estilos.label}>Nombre</Text>
      <TextInput style={estilos.input} value={nombre} onChangeText={setNombre} placeholder="3-60 caracteres" />

      <Text style={estilos.label}>Descripcion</Text>
      <TextInput style={estilos.input} value={descripcion} onChangeText={setDescripcion} placeholder="Opcional, max 280" multiline />

      <Text style={estilos.label}>Categoria</Text>
      <View style={estilos.row}>
        {CATEGORIAS.map((c) => (
          <TouchableOpacity key={c} style={[estilos.chip, categoria === c && estilos.chipActivo]} onPress={() => setCategoria(c)}>
            <Text style={estilos.chipTexto}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={estilos.label}>Inicio</Text>
      {Platform.OS === 'web' ? (
        (React.createElement('input', {
          type: 'date',
          value: inicio,
          onChange: (e: any) => setInicio(e.target.value),
          style: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8, width: '100%', fontSize: 16 },
        }) as any)
      ) : (
        <>
          <TouchableOpacity style={estilos.input} onPress={() => setShowInicio(true)}>
            <Text>{inicio || 'Seleccionar fecha'}</Text>
          </TouchableOpacity>
          {showInicio ? (
            <DateTimePicker
              value={inicio ? new Date(inicio + 'T12:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, date?: Date) => {
                if (Platform.OS === 'android') setShowInicio(false);
                if (date) {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  setInicio(`${y}-${m}-${d}`);
                }
              }}
            />
          ) : null}
          {Platform.OS === 'ios' && showInicio ? (
            <TouchableOpacity style={estilos.boton} onPress={() => setShowInicio(false)}>
              <Text style={estilos.botonTexto}>Confirmar</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <Text style={estilos.label}>Fin</Text>
      {Platform.OS === 'web' ? (
        (React.createElement('input', {
          type: 'date',
          value: fin,
          onChange: (e: any) => setFin(e.target.value),
          style: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8, width: '100%', fontSize: 16 },
        }) as any)
      ) : (
        <>
          <TouchableOpacity style={estilos.input} onPress={() => setShowFin(true)}>
            <Text>{fin || 'Seleccionar fecha'}</Text>
          </TouchableOpacity>
          {showFin ? (
            <DateTimePicker
              value={fin ? new Date(fin + 'T12:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, date?: Date) => {
                if (Platform.OS === 'android') setShowFin(false);
                if (date) {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  setFin(`${y}-${m}-${d}`);
                }
              }}
            />
          ) : null}
          {Platform.OS === 'ios' && showFin ? (
            <TouchableOpacity style={estilos.boton} onPress={() => setShowFin(false)}>
              <Text style={estilos.botonTexto}>Confirmar</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <Text style={estilos.label}>Max participantes (2-20)</Text>
      <TextInput style={estilos.input} value={maxParticipantes} onChangeText={setMaxParticipantes} keyboardType="numeric" />

      <TouchableOpacity style={estilos.boton} onPress={crear} disabled={guardando}>
        <Text style={estilos.botonTexto}>{guardando ? 'Creando...' : 'Crear'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee', marginRight: 6, marginBottom: 6 },
  chipActivo: { backgroundColor: '#1a5fb4' },
  chipTexto: { color: '#333', fontSize: 12 },
  boton: { backgroundColor: '#1a5fb4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#a11', marginBottom: 8 },
});
