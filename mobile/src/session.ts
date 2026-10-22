import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona } from './types';

const CLAVE = 'rachas:persona';

export async function leerSesion(): Promise<Persona | null> {
  const raw = await AsyncStorage.getItem(CLAVE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Persona;
  } catch {
    return null;
  }
}

export async function guardarSesion(persona: Persona) {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(persona));
}

export async function borrarSesion() {
  await AsyncStorage.removeItem(CLAVE);
}
