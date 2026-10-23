import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rachas:usuarioId';

export async function guardarSesion(id: string | null) {
  if (id) await AsyncStorage.setItem(KEY, id);
  else await AsyncStorage.removeItem(KEY);
}

export async function leerSesion(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}