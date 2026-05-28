const Host = window.location.hostname;

export const Entorno = {
  Produccion: false,
  ApiUrl: `http://${Host}:3000/api/`,
  NombreEmpresa: 'ConfeccionesCreateli'
};
