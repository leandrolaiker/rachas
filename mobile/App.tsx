import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { setUsuarioId } from './src/api';
import { leerSesion, guardarSesion } from './src/storage';
import { SessionContext } from './src/session';
import IngresoScreen from './src/screens/IngresoScreen';
import InicioScreen from './src/screens/InicioScreen';
import ExplorarScreen from './src/screens/ExplorarScreen';
import CrearDesafioScreen from './src/screens/CrearDesafioScreen';
import DetalleScreen from './src/screens/DetalleScreen';
import PerfilScreen from './src/screens/PerfilScreen';

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

export default function App() {
  const [listo, setListo] = useState(false);
  const [usuarioId, setUsuarioIdState] = useState<string | null>(null);

  async function setSession(id: string | null) {
    setUsuarioId(id);
    setUsuarioIdState(id);
    await guardarSesion(id);
  }

  useEffect(() => {
    (async () => {
      try {
        const id = await leerSesion();
        setUsuarioId(id);
        setUsuarioIdState(id);
      } catch (e) {
        console.error('leerSesion failed', e);
      } finally {
        setListo(true);
      }
    })();
  }, []);

  if (!listo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SessionContext.Provider value={{ usuarioId, setSession }}>
      <NavigationContainer>
        <Stack.Navigator>
          {usuarioId ? (
            <>
              <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
              <Stack.Screen name="Detalle" component={DetalleScreen} />
            </>
          ) : (
            <Stack.Screen name="Ingreso" component={IngresoScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SessionContext.Provider>
  );
}