import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { usePersona } from '../../App';
import { crearDesafio } from '../api';
import { mensajeError } from '../errores';

const CATEGORIAS = ['SALUD', 'ESTUDIO', 'FINANZAS', 'BIENESTAR', 'OTRO'];

function aDia(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function CrearScreen() {
  const nav = useNavigation<any>();
  const { persona } = usePersona();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('SALUD');
  const [inicio, setInicio] = useState(new Date());
  const [fin, setFin] = useState(new Date(Date.now() + 10 * 86400000));
  const [maxP, setMaxP] = useState('10');
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function guardar() {
    setError('');
    const ini = aDia(inicio);
    const fi = aDia(fin);
    if (nombre.trim().length < 3 || nombre.trim().length > 60) { setError('El nombre debe tener 3 a 60 caracteres.'); return; }
    if (descripcion.length > 280) { setError('La descripcion es muy larga.'); return; }
    if (fi < ini) { setError('La fecha de fin es anterior al inicio.'); return; }
    const dur = Math.round((fin.getTime() - inicio.getTime()) / 86400000) + 1;
    if (dur < 3 || dur > 90) { setError('La duracion debe ser de 3 a 90 dias.'); return; }
    const hoy = aDia(new Date());
    if (ini < hoy) { setError('No puede empezar en el pasado.'); return; }
    const cupo = Number(maxP);
    if (isNaN(cupo) || cupo < 2 || cupo > 20) { setError('El cupo debe ser entre 2 y 20.'); return; }
    setGuardando(true);
    try {
      const d = await crearDesafio({ nombre: nombre.trim(), descripcion: descripcion.trim(), categoria, inicio: ini, fin: fi, maxParticipantes: cupo });
      nav.replace('Detalle', { id: d.id });
    } catch (e) { setError(mensajeError(e)); }
    finally { setGuardando(false); }
  }

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Crear desafio</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TextInput style={s.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={s.input} placeholder="Descripcion (opcional)" value={descripcion} onChangeText={setDescripcion} multiline />
      <Text style={s.label}>Categoria</Text>
      <View style={s.fila}>
        {CATEGORIAS.map((c) => (
          <TouchableOpacity key={c} style={[s.chip, categoria === c && s.chipOn]} onPress={() => setCategoria(c)}>
            <Text style={s.chipTxt}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>Inicio: {aDia(inicio)}</Text>
      <TouchableOpacity style={s.botonSec} onPress={() => setMostrarInicio(true)}><Text style={s.botonSecTxt}>Elegir fecha de inicio</Text></TouchableOpacity>
      {mostrarInicio && <DateTimePicker value={inicio} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, d) => { setMostrarInicio(false); if (d) setInicio(d); }} />}
      <Text style={s.label}>Fin: {aDia(fin)}</Text>
      <TouchableOpacity style={s.botonSec} onPress={() => setMostrarFin(true)}><Text style={s.botonSecTxt}>Elegir fecha de fin</Text></TouchableOpacity>
      {mostrarFin && <DateTimePicker value={fin} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, d) => { setMostrarFin(false); if (d) setFin(d); }} />}
      <TextInput style={s.input} placeholder="Max. participantes (2-20)" value={maxP} onChangeText={setMaxP} keyboardType="numeric" />
      <TouchableOpacity style={[s.boton, guardando && s.botonOff]} disabled={guardando} onPress={guardar}>
        <Text style={s.botonTxt}>{guardando ? 'Guardando...' : 'Crear'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  label: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e5e5' },
  chipOn: { backgroundColor: '#1a5fb4' },
  chipTxt: { fontSize: 12, color: '#333' },
  boton: { backgroundColor: '#1a5fb4', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonOff: { opacity: 0.6 },
  botonTxt: { color: '#fff', fontWeight: 'bold' },
  botonSec: { backgroundColor: '#e5e5e5', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  botonSecTxt: { color: '#333' },
  error: { color: '#a11', marginBottom: 8 },
});
