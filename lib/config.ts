// Como ahora todo vive en el mismo dominio (un solo proyecto de Next.js),
// estos son paths relativos, no hace falta escribir el dominio completo.
export const DESTINOS_SUGERIDOS = [
  {
    label: "Landing principal (venta)",
    url: "/",
  },
  {
    label: "Registro clase gratuita",
    url: "/registro",
  },
  {
    label: "Inscripción al curso pago",
    url: "/inscripcion-curso",
  },
];

// Datos para que el alumno haga la transferencia. Reemplazá con los reales
// antes de publicar — estos son placeholders.
export const DATOS_PAGO = {
  banco: "Banco [tu banco]",
  titular: "Marcelo Rodríguez Estrada",
  cbu: "0000000000000000000000",
  alias: "IA.PARA.EMPRENDER",
  cuit: "20-00000000-0",
  // A este número le llega el "ya transferí, ahí va el comprobante"
  whatsappComprobante: "5491167076678",
};
