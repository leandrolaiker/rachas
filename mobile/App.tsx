import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { leerSesion, guardarSesion, borrarSesion } from './src/session';
import { Persona } from './src/types';
import IngresoScreen from './src/screens/IngresoScreen';
import InicioScreen from './src/screens/InicioScreen';
import ExplorarScreen from './src/screens/ExplorarScreen';
import CrearScreen from './src/screens/CrearScreen';
import DetalleScreen from './src/screens/DetalleScreen';
import PerfilScreen from './src/screens/PerfilScreen';

type Ctx = { persona: Persona | null; setPersona: (p: Persona | null) => void; cerrarSesion: () => Promise<void> };
export const PersonaContext = createContext<Ctx>({ persona: null, setPersona: () => {}, cerrarSesion: async () => {} });
export function usePersona() { return useContext(PersonaContext); }

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Explorar" component={ExplorarScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    leerSesion().then((p) => { setPersona(p); setCargando(false); });
  }, []);

  async function cerrarSesion() {
    await borrarSesion();
    setPersona(null);
  }

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PersonaContext.Provider value={{ persona, setPersona: (p) => { if (p) guardarSesion(p); setPersona(p); }, cerrarSesion }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!persona ? (
            <Stack.Screen name="Ingreso" component={IngresoScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
              <Stack.Screen name="Detalle" component={DetalleScreen} />
              <Stack.Screen name="Crear" component={CrearScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PersonaContext.Provider>
  );
}
