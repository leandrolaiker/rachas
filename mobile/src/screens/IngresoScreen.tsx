import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth0 } from '@auth0/auth0-react';

export default function IngresoScreen() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [error, setError] = React.useState<string | null>(null);

  async function loginConGoogle() {
    await iniciarSesion({
      authorizationParams: {
        connection: 'google-oauth2',
        prompt: 'consent',
      },
    });
  }

  async function iniciarSesion(options?: Parameters<typeof loginWithRedirect>[0]) {
    setError(null);
    try {
      await loginWithRedirect(options);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>Rachas</Text>
      <Text style={estilos.sub}>Ingreso con Auth0</Text>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <TouchableOpacity style={estilos.boton} onPress={loginConGoogle} disabled={isLoading}>
        <Text style={estilos.botonTexto}>{isLoading ? 'Redirigiendo...' : 'Continuar con Google'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={estilos.linkTouchable} onPress={() => iniciarSesion()}>
        <Text style={estilos.link}>Ingresar con email y contraseña</Text>
      </TouchableOpacity>
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
  linkTouchable: { marginTop: 12, padding: 8 },
  link: { color: '#1a5fb4', marginTop: 8 },
  error: { color: '#a11', marginBottom: 8 },
  vacio: { color: '#666', marginBottom: 8, marginTop: 12 },
});
