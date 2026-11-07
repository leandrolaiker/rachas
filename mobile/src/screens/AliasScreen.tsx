import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { meApi } from '../api';
import { useSession } from '../session';
import { avisar } from '../ui';

type Props = {
  onListo: (persona: any) => void;
};

export default function AliasScreen({ onListo }: Props) {
  const { setSession } = useSession();
  const [alias, setAlias] = React.useState('');
  const [guardando, setGuardando] = React.useState(false);
  const [error, setError] = React.useState('');

  async function guardar() {
    const valor = alias.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(valor)) {
      setError('La contraseña debe tener entre 3 y 20 caracteres (letras, números, guion bajo).');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const persona = await meApi.alias(valor);
      await setSession(persona.id, null);
      onListo(persona);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el alias.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Elegí tu alias</Text>
      <Text style={estilos.sub}>Este alias es visible en la app. No puede repetirse.</Text>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Text style={estilos.seccion}>Alias</Text>
      <TextInput
        style={estilos.input}
        placeholder="Alias (3-20, letras, números, guion bajo)"
        value={alias}
        onChangeText={setAlias}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={estilos.boton} onPress={guardar} disabled={guardando}>
        <Text style={estilos.botonTexto}>{guardando ? 'Guardando...' : 'Guardar alias'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  sub: { fontSize: 14, color: '#666', marginBottom: 16 },
  seccion: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  boton: { backgroundColor: '#1a5fb4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  error: { color: '#a11', marginBottom: 8 },
  label: { color: '#555', marginTop: 8, marginBottom: 4 },
  fondoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  fondoVacioTexto: { color: '#666', fontSize: 14, textAlign: 'center' },
});