declare const window: any;

export function avisar(titulo: string, mensaje?: string) {
  window.alert(mensaje ? `${titulo}\n${mensaje}` : titulo);
}

export function confirmar(mensaje: string) {
  return window.confirm(mensaje);
}
