import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { meApi, setTokenGetter } from './src/api';
import { connectSocket, disconnectSocket } from './src/socket';
import { guardarSesion } from './src/storage';
import { SessionContext } from './src/session';
import IngresoScreen from './src/screens/IngresoScreen';
import InicioScreen from './src/screens/InicioScreen';
import ExplorarScreen from './src/screens/ExplorarScreen';
import CrearDesafioScreen from './src/screens/CrearDesafioScreen';
import DetalleScreen from './src/screens/DetalleScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import AliasScreen from './src/screens/AliasScreen';
import type { Persona } from './src/types';

declare const window: { location: { origin: string; search: string; hostname: string; href: string } };

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Explorar" component={ExplorarScreen} />
      <Tab.Screen name="Crear" component={CrearDesafioScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function AppInner({ redirectUri }: { redirectUri: string }) {
  const { isLoading, isAuthenticated, getAccessTokenSilently, logout, error: authError } = useAuth0();
  const [listo, setListo] = React.useState(false);
  const [usuarioId, setUsuarioIdState] = React.useState<string | null>(null);
  const [persona, setPersona] = React.useState<Persona | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [intento, setIntento] = React.useState(0);
  const [callbackDetails] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      error: params.get('error_description') || params.get('error'),
      hasAuthResponse: params.has('code') || params.has('state'),
    };
  });
  const authMessage = authError?.message || callbackDetails.error;

  React.useEffect(() => {
    setTokenGetter(async () => (isAuthenticated ? (await getAccessTokenSilently()) ?? null : null));
    return () => setTokenGetter(null);
  }, [getAccessTokenSilently, isAuthenticated]);

  React.useEffect(() => {
    if (isLoading) return;

    let cancelado = false;
    setListo(false);
    setError(null);
    (async () => {
      try {
        if (!isAuthenticated) {
          setUsuarioIdState(null);
          setPersona(null);
          disconnectSocket();
          await guardarSesion(null, null);
          return;
        }

        const p = await meApi.obtener();
        if (cancelado) return;
        setPersona(p);
        setUsuarioIdState(p.id);
        await guardarSesion(p.id, null);
        await connectSocket();
      } catch (e) {
        if (!cancelado) {
          console.error('Error al iniciar la sesión', e);
          setError(e instanceof Error ? e.message : 'No se pudo iniciar la sesión.');
        }
      } finally {
        if (!cancelado) setListo(true);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [intento, isAuthenticated, isLoading]);

  async function setSession(id: string | null) {
    if (id) {
      setUsuarioIdState(id);
      await guardarSesion(id, null);
      return;
    }

    setUsuarioIdState(null);
    setPersona(null);
    disconnectSocket();
    await guardarSesion(null, null);
    await logout({ logoutParams: { returnTo: redirectUri } });
  }

  return (
    <SessionContext.Provider value={{ usuarioId, setSession }}>
      <NavigationContainer>
        <View style={estilos.navegacion}>
          {!isAuthenticated && authMessage ? (
            <Text style={estilos.error}>{authMessage}</Text>
          ) : null}
          {!isAuthenticated && !isLoading && !authMessage && callbackDetails.hasAuthResponse ? (
            <Text style={estilos.error}>
              Auth0 returned to the app, but no authenticated session was created. Check the browser console for callback details.
            </Text>
          ) : null}
          {isLoading || !listo ? (
            <View style={estilos.centro}>
              <ActivityIndicator size="large" />
            </View>
          ) : error ? (
            <View style={estilos.centro}>
              <Text style={estilos.error}>{error}</Text>
              <TouchableOpacity onPress={() => setIntento((actual) => actual + 1)}>
                <Text style={estilos.reintentar}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!isAuthenticated ? (
                <Stack.Screen name="Ingreso" component={IngresoScreen} />
              ) : persona?.alias ? (
                <>
                  <Stack.Screen name="Main" component={Tabs} />
                  <Stack.Screen name="Detalle" component={DetalleScreen} options={{ headerShown: true }} />
                </>
              ) : usuarioId ? (
                <Stack.Screen name="Alias" component={() => <AliasScreen onListo={setPersona} />} />
              ) : (
                <Stack.Screen name="Ingreso" component={IngresoScreen} />
              )}
            </Stack.Navigator>
          )}
        </View>
      </NavigationContainer>
    </SessionContext.Provider>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  navegacion: { flex: 1 },
  error: { color: '#a11', textAlign: 'center', marginBottom: 12 },
  reintentar: { color: '#1a5fb4', fontWeight: 'bold' },
});

export default function App() {
  const loopbackAlias = window.location.hostname === '127.0.0.1';
  React.useEffect(() => {
    if (loopbackAlias) {
      const canonicalUrl = new URL(window.location.href);
      canonicalUrl.hostname = 'localhost';
      window.location.href = canonicalUrl.toString();
    }
  }, [loopbackAlias]);

  if (loopbackAlias) {
    return <View style={estilos.centro}><ActivityIndicator size="large" /></View>;
  }

  const redirectUri = window.location.origin;

  return (
    <Auth0Provider
      domain={process.env.EXPO_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID!}
      useRefreshTokens
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access',
      }}
    >
      <AppInner redirectUri={redirectUri} />
    </Auth0Provider>
  );
}
