const RONDAS=[
 {n:"Investigar", f:[
  {k:"rol",x:"Eres un abogado disciplinarista con 12 años de experiencia en oficinas de control interno que ordena hechos sin valorar la prueba."},
  {k:"rol",x:"Eres un investigador que diseña el plan de pruebas de una indagación y distingue lo pertinente de lo que solo alarga el proceso."},
  {k:"ctx",x:"Llegó una queja anónima contra un funcionario por irregularidades en un proceso de contratación firmado hace ocho meses."},
  {k:"ctx",x:"El expediente tiene doscientos folios, tres informes de supervisión y ninguna prueba testimonial todavía."},
  {k:"ins",x:"Entrega una cronología en tres columnas: fecha, hecho y folio que lo respalda."},
  {k:"ins",x:"Lista los deberes presuntamente comprometidos y los vacíos que debo cerrar antes de decidir si abro investigación."}]},
 {n:"Defender", f:[
  {k:"rol",x:"Eres un defensor disciplinario que analiza pliegos de cargos elemento por elemento y no inventa argumentos."},
  {k:"rol",x:"Eres un abogado que prepara a un servidor público para decir la verdad con orden y sin omitir nada relevante."},
  {k:"ctx",x:"El pliego de cargos califica la falta como grave a título de culpa y el término para presentar descargos vence en diez días."},
  {k:"ctx",x:"El servidor firmó el acto siguiendo un concepto jurídico interno que hoy se cuestiona."},
  {k:"ins",x:"Analiza por cada cargo si están acreditadas la tipicidad, la ilicitud sustancial y la culpabilidad, con el folio que lo sustenta."},
  {k:"ins",x:"Redacta la solicitud de pruebas explicando para cada una su pertinencia, conducencia y utilidad."}]},
 {n:"Decidir", f:[
  {k:"rol",x:"Eres un profesional de apoyo de un despacho disciplinario que estructura proyectos de decisión y deja las valoraciones al operador."},
  {k:"rol",x:"Eres un revisor de segunda instancia que busca el punto más débil de un fallo antes de que sea apelado."},
  {k:"ctx",x:"El expediente está en etapa de juzgamiento y el término de prescripción vence en cuatro meses."},
  {k:"ctx",x:"La investigación concluyó con tres hechos probados y uno discutido por una contradicción entre dos testimonios."},
  {k:"ins",x:"Presenta dos alternativas de calificación de la falta y marca cada una con [DECISIÓN DEL OPERADOR DISCIPLINARIO]."},
  {k:"ins",x:"Arma una tabla de valoración probatoria con la prueba, lo que acredita y la duda que subsiste."}]},
 {n:"Uso responsable de IA", f:[
  {k:"rol",x:"Eres un asesor de integridad pública que evalúa los riesgos disciplinarios de usar IA en las funciones de un cargo."},
  {k:"rol",x:"Eres un auditor que revisa documentos oficiales redactados con apoyo de IA buscando citas inventadas y datos personales."},
  {k:"ctx",x:"Una entidad territorial quiere que sus abogados usen herramientas de IA generativa y todavía no tiene una política escrita."},
  {k:"ctx",x:"Un servidor firmó un acto administrativo con una sentencia citada por la IA que no existe y el hecho ya llegó a control interno."},
  {k:"ins",x:"Entrega una matriz con la tarea, el deber que puede comprometerse, el riesgo y el control que lo reduce."},
  {k:"ins",x:"No confirmes que una cita existe. Clasifica su riesgo e indica dónde comprobarla en la fuente oficial."}]}
];
