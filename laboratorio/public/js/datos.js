/* Opciones del selector en cascada del taller de derecho disciplinario. */
window.AREAS = [
  { id: "interno", nombre: "Control disciplinario interno", sub: ["Quejas e indagación previa", "Investigación disciplinaria", "Juzgamiento", "Segunda instancia", "Prevención y capacitación"] },
  { id: "ministerio", nombre: "Procuraduría y personerías", sub: ["Poder preferente", "Servidores de elección popular", "Contratación estatal", "Derechos humanos", "Intervención y prevención"] },
  { id: "judicial", nombre: "Disciplina judicial", sub: ["Funcionarios y empleados judiciales", "Abogados (Ley 1123)", "Primera instancia", "Apelaciones y consultas", "Nulidades"] },
  { id: "defensa", nombre: "Defensa del disciplinado", sub: ["Versión libre", "Descargos", "Pruebas", "Alegatos y recursos", "Nulidades"] },
  { id: "especiales", nombre: "Regímenes especiales", sub: ["Fuerza Pública", "Universidades e instituciones educativas", "Particulares que ejercen funciones públicas", "Tribunales de ética profesional"] },
  { id: "sancionatorio", nombre: "Derecho administrativo sancionatorio", sub: ["Superintendencias", "Sancionatorio ambiental", "Multas y sanciones contractuales", "Sancionatorio sectorial", "Recursos en sede administrativa"] },
  { id: "contencioso", nombre: "Control judicial de la sanción", sub: ["Nulidad y restablecimiento del derecho", "Defensa de la entidad", "Debido proceso", "Medidas cautelares"] },
  { id: "academia", nombre: "Academia e investigación", sub: ["Docencia", "Investigación jurídica", "Verificación de fuentes", "Ética e inteligencia artificial"] },
];
window.ROLES = ["Operador de instrucción", "Operador de juzgamiento", "Profesional de apoyo", "Jefe de control interno", "Magistrado o juez", "Defensor o apoderado", "Servidor público", "Docente o estudiante"];
window.ENFOQUES = ["Investigar y probar", "Motivar decisiones", "Defender", "Prevenir faltas", "Controlar términos", "Revisar antes de firmar", "Usar IA con responsabilidad"];
window.JURISDICCIONES = ["Ley 1952 de 2019 (CGD)", "Ley 1123 de 2007 (abogados)", "Régimen especial", "Sancionatorio administrativo"];
window.NIVELES = ["Primera vez con IA", "La uso a veces", "La uso a diario"];
window.TONOS = ["Formal de decisión", "Técnico y sobrio", "Claro para el ciudadano", "Directo y breve"];
window.TAREAS = [
  { id: "investigar", nombre: "Investigar y ordenar", d: "Queja, hechos, cronología y folios." },
  { id: "probar", nombre: "Planear y valorar la prueba", d: "Pertinencia, conducencia, utilidad." },
  { id: "decidir", nombre: "Proyectar decisiones", d: "Autos y fallos con motivación." },
  { id: "defender", nombre: "Defender", d: "Pliego, descargos, alegatos, recursos." },
  { id: "revisar", nombre: "Revisar antes de firmar", d: "Citas, coherencia y datos personales." },
  { id: "terminos", nombre: "Términos y prescripción", d: "Cronograma y alertas de vencimiento." },
  { id: "prevenir", nombre: "Prevenir faltas", d: "Capacitación y riesgo disciplinario." },
  { id: "ia", nombre: "Usar IA con responsabilidad", d: "Verificación, declaración y trazabilidad." },
];
