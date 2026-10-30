import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_ID = 'rachas:usuarioId';
const KEY_TOKEN = 'rachas:token';

export async function guardarSesion(id: string | null, token: string | null = null) {
  if (id) await AsyncStorage.setItem(KEY_ID, id);
  else await AsyncStorage.removeItem(KEY_ID);
  if (token) await AsyncStorage.setItem(KEY_TOKEN, token);
  else await AsyncStorage.removeItem(KEY_TOKEN);
}

export async function leerSesion(): Promise<{ id: string | null; token: string | null }> {
  const id = await AsyncStorage.getItem(KEY_ID);
  const token = await AsyncStorage.getItem(KEY_TOKEN);
  return { id, token };
}