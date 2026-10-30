import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { personasApi } from '../api';
import { useSession } from '../session';

export default function IngresoScreen() {
  const { setSession } = useSession();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState('America/Argentina/Buenos_Aires');
  const [guardando, setGuardando] = useState(false);

  async function login() {
    setGuardando(true);
    try {
      const res = await personasApi.login(identificador, password);
      await setSession(res.persona.id, res.token);
    } catch (e: any) {
      Alert.alert('No se pudo ingresar', e?.message || 'Error');
    } finally {
      setGuardando(false);
    }
  }

  async function registrar() {
    setGuardando(true);
    try {
      await personasApi.crear({ nombre, alias, email, zonaHoraria: zona, password });
      const res = await personasApi.login(alias, password);
      await setSession(res.persona.id, res.token);
    } catch (e: any) {
      Alert.alert('No se pudo registrar', e?.message || 'Error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Rachas</Text>
      <Text style={estilos.sub}>Ingreso</Text>

      {!modoRegistro ? (
        <>
          <Text style={estilos.seccion}>Iniciar sesion</Text>
          <TextInput style={estilos.input} placeholder="Alias o email" value={identificador} onChangeText={setIdentificador} autoCapitalize="none" />
          <TextInput style={estilos.input} placeholder="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={estilos.boton} onPress={login} disabled={guardando}>
            <Text style={estilos.botonTexto}>{guardando ? 'Ingresando...' : 'Ingresar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModoRegistro(true)}>
            <Text style={estilos.link}>Registrarme</Text>
          </TouchableOpacity>
          <Text style={estilos.vacio}>Usuarios de prueba: luci_f / martin_g / sofi_r con contrasena rachas123</Text>
        </>
      ) : (
        <>
          <Text style={estilos.seccion}>Nuevo registro</Text>
          <TextInput style={estilos.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={estilos.input} placeholder="Alias (3-20, letras/num/_)" value={alias} onChangeText={setAlias} autoCapitalize="none" />
          <TextInput style={estilos.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={estilos.input} placeholder="Contrasena (min 4)" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={estilos.input} placeholder="Zona horaria" value={zona} onChangeText={setZona} />
          <TouchableOpacity style={estilos.boton} onPress={registrar} disabled={guardando}>
            <Text style={estilos.botonTexto}>{guardando ? 'Guardando...' : 'Crear cuenta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModoRegistro(false)}>
            <Text style={estilos.link}>Volver</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, flexGrow: 1 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 16, color: '#666', marginBottom: 16 },
  seccion: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  boton: { backgroundColor: '#1a5fb4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  link: { color: '#1a5fb4', marginTop: 8 },
  vacio: { color: '#666', marginBottom: 8, marginTop: 12 },
});