// Mock data store for the LMS application

export type StudyProfile = "Visual" | "Auditivo" | "Kinestesico"
export type AnxietyLevel = "Bajo" | "Medio" | "Alto"
export type TopicStatus = "completed" | "current" | "locked"

export interface AnxietyMetrics {
  tabSwitches: number[]       // per-session tab switch count (last 10 sessions)
  consecutiveClicks: number[] // rapid consecutive clicks per session
  missedClicks: number[]      // misclicks per session
  timePerQuestion: number[]   // avg seconds per quiz question per session
  idleTime: number[]          // idle seconds before answering per session
  scrollReversals: number[]   // scroll up/down reversals per session
}

export interface Student {
  id: string
  name: string
  avatar: string
  profile: StudyProfile
  anxietyLevel: AnxietyLevel
  averageScore: number
  progress: number
  enrolledCourses: string[]
  completedDiagnostic: boolean
  profileScores: {
    Visual: number
    Auditivo: number
    Kinestesico: number
  }
  anxietyMetrics: AnxietyMetrics
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface Topic {
  id: string
  title: string
  description: string
  status: TopicStatus
  videoUrl?: string
  audioUrl?: string
  textContent?: string
  quiz: QuizQuestion[]
  duration: string
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  topics: Topic[]
  studentsEnrolled: number
  category: string
  enrollmentKey?: string
}

export interface DiagnosticQuestion {
  id: string
  question: string
  options: { label: string; profile: StudyProfile }[]
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "d1",
    question: "Cuando aprendo algo nuevo, prefiero...",
    options: [
      { label: "Ver un video o mirar diagramas", profile: "Visual" },
      { label: "Escuchar una explicacion o podcast", profile: "Auditivo" },
      { label: "Probarlo con ejercicios practicos", profile: "Kinestesico" },
    ],
  },
  {
    id: "d2",
    question: "Recuerdo mejor la informacion cuando...",
    options: [
      { label: "La veo escrita o en un grafico", profile: "Visual" },
      { label: "La escucho en voz alta o la discuto", profile: "Auditivo" },
      { label: "Interactuo fisicamente con el material", profile: "Kinestesico" },
    ],
  },
  {
    id: "d3",
    question: "Cuando estudio para un examen, generalmente...",
    options: [
      { label: "Reviso notas, resalto puntos clave y uso colores", profile: "Visual" },
      { label: "Leo notas en voz alta o explico conceptos a otros", profile: "Auditivo" },
      { label: "Creo tarjetas y camino mientras repaso", profile: "Kinestesico" },
    ],
  },
  {
    id: "d4",
    question: "En clase, aprendo mejor cuando el profesor...",
    options: [
      { label: "Usa diapositivas, diagramas y demostraciones visuales", profile: "Visual" },
      { label: "Explica conceptos a traves de charlas y discusiones", profile: "Auditivo" },
      { label: "Incluye actividades grupales y experimentos practicos", profile: "Kinestesico" },
    ],
  },
  {
    id: "d5",
    question: "Cuando necesito resolver un problema, generalmente...",
    options: [
      { label: "Lo dibujo o visualizo la solucion", profile: "Visual" },
      { label: "Hablo sobre el problema paso a paso", profile: "Auditivo" },
      { label: "Construyo un modelo o lo resuelvo fisicamente", profile: "Kinestesico" },
    ],
  },
]

const sessionLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"]

export { sessionLabels }

export const courses: Course[] = [
  {
    id: "math-101",
    title: "Fundamentos de Matematicas",
    description: "Construye una base solida en algebra, geometria y calculo basico.",
    icon: "Calculator",
    category: "Matematicas",
    studentsEnrolled: 156,
    enrollmentKey: "MATH-2026-XK9",
    topics: [
      {
        id: "t1",
        title: "Introduccion al Algebra",
        description: "Aprende los conceptos basicos de expresiones algebraicas, variables y ecuaciones.",
        status: "completed",
        duration: "45 min",
        videoUrl: "https://example.com/video/algebra-intro",
        audioUrl: "https://example.com/audio/algebra-intro",
        textContent: "El algebra es la rama de las matematicas que se ocupa de simbolos y las reglas para manipular esos simbolos. En algebra, esos simbolos representan cantidades sin valores fijos, conocidas como variables.\n\nLas variables son simbolos (generalmente letras) que representan valores desconocidos. Por ejemplo, en la ecuacion x + 5 = 10, x es una variable que representa el valor 5.\n\nConceptos clave:\n- Las constantes son valores fijos (como 5, -3, o pi)\n- Los coeficientes son numeros multiplicados por variables (en 3x, 3 es el coeficiente)\n- Los terminos semejantes tienen la misma variable elevada a la misma potencia\n- Puedes combinar terminos semejantes: 2x + 3x = 5x",
        quiz: [
          { id: "q1", question: "Cual es el valor de x en: 2x + 4 = 10?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q2", question: "Simplifica: 3x + 2x", options: ["5x", "6x", "5x^2", "6"], correctAnswer: 0 },
          { id: "q3", question: "Cual NO es una expresion algebraica?", options: ["3x + 2", "x^2 - 1", "5 + 3 = 8", "2y - 7"], correctAnswer: 2 },
        ],
      },
      {
        id: "t2",
        title: "Ecuaciones Lineales",
        description: "Resuelve ecuaciones lineales de una y dos variables y graficalas.",
        status: "current",
        duration: "60 min",
        videoUrl: "https://example.com/video/linear-equations",
        audioUrl: "https://example.com/audio/linear-equations",
        textContent: "Una ecuacion lineal es una ecuacion donde la mayor potencia de la variable es 1. La forma general es ax + b = c, donde a, b y c son constantes.\n\nPara resolver una ecuacion lineal:\n1. Simplifica ambos lados combinando terminos semejantes\n2. Mueve los terminos variables a un lado y las constantes al otro\n3. Divide ambos lados por el coeficiente de la variable\n\nEjemplo: Resuelve 3x + 7 = 22\nPaso 1: Resta 7 de ambos lados: 3x = 15\nPaso 2: Divide ambos lados por 3: x = 5",
        quiz: [
          { id: "q4", question: "Resuelve: 5x - 3 = 12", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q5", question: "Cual es la pendiente en y = 3x + 2?", options: ["2", "3", "5", "1"], correctAnswer: 1 },
          { id: "q6", question: "La grafica de una ecuacion lineal siempre es una...", options: ["Curva", "Circulo", "Linea recta", "Parabola"], correctAnswer: 2 },
        ],
      },
      {
        id: "t3",
        title: "Ecuaciones Cuadraticas",
        description: "Comprende y resuelve ecuaciones cuadraticas usando factorizacion y la formula cuadratica.",
        status: "locked",
        duration: "75 min",
        videoUrl: "https://example.com/video/quadratics",
        audioUrl: "https://example.com/audio/quadratics",
        textContent: "Una ecuacion cuadratica tiene la forma ax^2 + bx + c = 0, donde a no es cero. La grafica de una cuadratica es una parabola.\n\nMetodos para resolver:\n1. Factorizacion: Reescribe la ecuacion como (x - r1)(x - r2) = 0\n2. Formula cuadratica: x = (-b +/- sqrt(b^2 - 4ac)) / 2a\n3. Completar el cuadrado",
        quiz: [
          { id: "q7", question: "Cual es el grado de una ecuacion cuadratica?", options: ["1", "2", "3", "4"], correctAnswer: 1 },
          { id: "q8", question: "La grafica de una ecuacion cuadratica es una...", options: ["Linea", "Circulo", "Parabola", "Hiperbola"], correctAnswer: 2 },
          { id: "q9", question: "En x^2 - 5x + 6 = 0, cuales son las raices?", options: ["1 y 6", "2 y 3", "-2 y -3", "1 y 5"], correctAnswer: 1 },
        ],
      },
      {
        id: "t4",
        title: "Introduccion a la Geometria",
        description: "Explora puntos, lineas, angulos y figuras geometricas basicas.",
        status: "locked",
        duration: "50 min",
        videoUrl: "https://example.com/video/geometry-intro",
        audioUrl: "https://example.com/audio/geometry-intro",
        textContent: "La geometria es la rama de las matematicas que se ocupa de las formas, tamanos y las propiedades del espacio.",
        quiz: [
          { id: "q10", question: "Cuantos grados tiene un angulo recto?", options: ["45", "90", "180", "360"], correctAnswer: 1 },
          { id: "q11", question: "Un triangulo tiene cuantos lados?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q12", question: "Suma de angulos en un triangulo?", options: ["90", "180", "270", "360"], correctAnswer: 1 },
        ],
      },
    ],
  },
  {
    id: "prog-101",
    title: "Introduccion a la Programacion",
    description: "Aprende los fundamentos de programacion con ejercicios practicos de codigo.",
    icon: "Code",
    category: "Ciencias de la Computacion",
    studentsEnrolled: 203,
    enrollmentKey: "PROG-2026-AB3",
    topics: [
      {
        id: "p1",
        title: "Variables y Tipos de Datos",
        description: "Comprende los bloques fundamentales de la programacion: variables, cadenas, numeros y booleanos.",
        status: "completed",
        duration: "40 min",
        videoUrl: "https://example.com/video/variables",
        audioUrl: "https://example.com/audio/variables",
        textContent: "Las variables son contenedores para almacenar valores de datos. Cada variable tiene un nombre y un tipo.\n\nTipos de datos comunes:\n- String: Valores de texto entre comillas (\"Hola Mundo\")\n- Number/Integer: Numeros enteros (42, -7)\n- Float/Decimal: Numeros con punto decimal (3.14)\n- Boolean: Valores verdadero o falso",
        quiz: [
          { id: "pq1", question: "Cual es un nombre de variable valido?", options: ["2nombre", "mi-var", "miVar", "mi var"], correctAnswer: 2 },
          { id: "pq2", question: "Que tipo de dato es 'true'?", options: ["String", "Number", "Boolean", "Float"], correctAnswer: 2 },
          { id: "pq3", question: "Que tipo de dato es 3.14?", options: ["Integer", "Float", "String", "Boolean"], correctAnswer: 1 },
        ],
      },
      {
        id: "p2",
        title: "Flujo de Control",
        description: "Aprende sobre sentencias if/else, bucles y logica condicional.",
        status: "current",
        duration: "55 min",
        videoUrl: "https://example.com/video/control-flow",
        audioUrl: "https://example.com/audio/control-flow",
        textContent: "El flujo de control determina el orden en que se ejecuta el codigo. Las tres principales estructuras de control son:\n\n1. Secuencial: El codigo se ejecuta linea por linea\n2. Seleccion: Las sentencias if/else eligen entre caminos\n3. Iteracion: Los bucles repiten bloques de codigo",
        quiz: [
          { id: "pq4", question: "Que verifica una sentencia if?", options: ["Un bucle", "Una condicion", "Un nombre de variable", "Una funcion"], correctAnswer: 1 },
          { id: "pq5", question: "Que bucle siempre se ejecuta al menos una vez?", options: ["for", "while", "do-while", "foreach"], correctAnswer: 2 },
          { id: "pq6", question: "Que es la iteracion?", options: ["Declarar variables", "Repetir codigo", "Definir funciones", "Importar modulos"], correctAnswer: 1 },
        ],
      },
      {
        id: "p3",
        title: "Funciones",
        description: "Crea bloques reutilizables de codigo con funciones y parametros.",
        status: "locked",
        duration: "50 min",
        videoUrl: "https://example.com/video/functions",
        audioUrl: "https://example.com/audio/functions",
        textContent: "Las funciones son bloques reutilizables de codigo disenados para realizar una tarea especifica.",
        quiz: [
          { id: "pq7", question: "Que palabra clave define una funcion en JavaScript?", options: ["def", "func", "function", "method"], correctAnswer: 2 },
          { id: "pq8", question: "Que es el valor de retorno de una funcion?", options: ["Su nombre", "Su salida", "Sus parametros", "Su contador"], correctAnswer: 1 },
          { id: "pq9", question: "Que son los parametros?", options: ["Valores de retorno", "Nombres de funciones", "Valores de entrada a una funcion", "Contadores de bucle"], correctAnswer: 2 },
        ],
      },
    ],
  },
  {
    id: "sci-101",
    title: "Fundamentos de Ciencias",
    description: "Explora el mundo natural a traves de los conceptos basicos de fisica, quimica y biologia.",
    icon: "Atom",
    category: "Ciencias",
    studentsEnrolled: 134,
    enrollmentKey: "SCI-2026-QR7",
    topics: [
      {
        id: "s1",
        title: "Introduccion a la Fisica",
        description: "Comprende los conceptos fundamentales de movimiento, fuerza y energia.",
        status: "current",
        duration: "55 min",
        videoUrl: "https://example.com/video/physics-intro",
        audioUrl: "https://example.com/audio/physics-intro",
        textContent: "La fisica es el estudio de la materia, la energia y las interacciones entre ellas. Los conceptos fundamentales incluyen:\n\n- Movimiento: Los objetos cambian de posicion con el tiempo\n- Fuerza: Un empujon o jalon que cambia el movimiento de un objeto\n- Energia: La capacidad de realizar trabajo\n- Las Leyes de Newton del Movimiento describen como las fuerzas afectan a los objetos",
        quiz: [
          { id: "sq1", question: "Que es la fuerza?", options: ["Un tipo de energia", "Un empujon o jalon", "Una unidad de medida", "Una reaccion quimica"], correctAnswer: 1 },
          { id: "sq2", question: "Quien formulo las leyes del movimiento?", options: ["Einstein", "Newton", "Galileo", "Hawking"], correctAnswer: 1 },
          { id: "sq3", question: "La energia es la capacidad de hacer...", options: ["Fuerza", "Movimiento", "Trabajo", "Gravedad"], correctAnswer: 2 },
        ],
      },
      {
        id: "s2",
        title: "Quimica Basica",
        description: "Aprende sobre atomos, elementos, compuestos y reacciones quimicas.",
        status: "locked",
        duration: "60 min",
        videoUrl: "https://example.com/video/chemistry",
        audioUrl: "https://example.com/audio/chemistry",
        textContent: "La quimica es el estudio de la materia y los cambios que sufre.",
        quiz: [
          { id: "sq4", question: "Cual es la unidad mas pequena de un elemento?", options: ["Molecula", "Atomo", "Celula", "Electron"], correctAnswer: 1 },
          { id: "sq5", question: "H2O es la formula del...", options: ["Oxigeno", "Hidrogeno", "Agua", "Dioxido de carbono"], correctAnswer: 2 },
          { id: "sq6", question: "La tabla periodica organiza...", options: ["Moleculas", "Compuestos", "Elementos", "Reacciones"], correctAnswer: 2 },
        ],
      },
    ],
  },
]

export const students: Student[] = [
  {
    id: "s1", name: "Alice Johnson", avatar: "AJ", profile: "Visual", anxietyLevel: "Bajo", averageScore: 92, progress: 78, enrolledCourses: ["math-101", "prog-101"], completedDiagnostic: true,
    profileScores: { Visual: 88, Auditivo: 72, Kinestesico: 65 },
    anxietyMetrics: { tabSwitches: [2,1,3,0,1,2,1,0,1,2], consecutiveClicks: [1,0,2,0,1,0,0,1,0,1], missedClicks: [0,1,0,0,1,0,1,0,0,0], timePerQuestion: [18,15,20,16,14,19,17,15,16,18], idleTime: [3,2,4,1,2,3,2,1,3,2], scrollReversals: [1,2,1,0,1,2,1,1,0,1] }
  },
  {
    id: "s2", name: "Bob Williams", avatar: "BW", profile: "Auditivo", anxietyLevel: "Medio", averageScore: 85, progress: 65, enrolledCourses: ["math-101", "sci-101"], completedDiagnostic: true,
    profileScores: { Visual: 60, Auditivo: 85, Kinestesico: 70 },
    anxietyMetrics: { tabSwitches: [5,4,6,3,5,4,7,5,4,6], consecutiveClicks: [3,2,4,2,3,5,2,3,4,3], missedClicks: [2,3,1,2,3,2,1,3,2,2], timePerQuestion: [25,22,28,24,26,23,27,25,24,26], idleTime: [8,6,9,7,8,6,10,7,8,9], scrollReversals: [4,3,5,4,3,5,4,3,5,4] }
  },
  {
    id: "s3", name: "Clara Davis", avatar: "CD", profile: "Kinestesico", anxietyLevel: "Bajo", averageScore: 88, progress: 82, enrolledCourses: ["prog-101"], completedDiagnostic: true,
    profileScores: { Visual: 55, Auditivo: 62, Kinestesico: 90 },
    anxietyMetrics: { tabSwitches: [1,0,2,1,0,1,0,1,0,1], consecutiveClicks: [0,1,0,0,1,0,0,0,1,0], missedClicks: [0,0,1,0,0,0,1,0,0,0], timePerQuestion: [12,14,11,13,12,15,13,12,14,11], idleTime: [2,1,2,1,1,2,1,2,1,1], scrollReversals: [0,1,0,1,0,0,1,0,1,0] }
  },
  {
    id: "s4", name: "Daniel Martinez", avatar: "DM", profile: "Visual", anxietyLevel: "Alto", averageScore: 71, progress: 45, enrolledCourses: ["math-101", "sci-101", "prog-101"], completedDiagnostic: true,
    profileScores: { Visual: 78, Auditivo: 65, Kinestesico: 58 },
    anxietyMetrics: { tabSwitches: [12,10,14,11,13,15,12,14,11,13], consecutiveClicks: [8,7,9,6,8,10,7,9,8,7], missedClicks: [5,6,4,7,5,6,8,5,6,7], timePerQuestion: [45,42,50,38,48,44,52,40,46,43], idleTime: [20,18,25,22,19,24,21,23,20,22], scrollReversals: [8,9,7,10,8,9,11,8,9,10] }
  },
  {
    id: "s5", name: "Emma Brown", avatar: "EB", profile: "Auditivo", anxietyLevel: "Bajo", averageScore: 95, progress: 90, enrolledCourses: ["math-101", "prog-101"], completedDiagnostic: true,
    profileScores: { Visual: 70, Auditivo: 95, Kinestesico: 68 },
    anxietyMetrics: { tabSwitches: [0,1,0,0,1,0,0,1,0,0], consecutiveClicks: [0,0,1,0,0,0,0,1,0,0], missedClicks: [0,0,0,1,0,0,0,0,1,0], timePerQuestion: [10,12,11,13,10,11,12,10,11,12], idleTime: [1,2,1,1,2,1,1,2,1,1], scrollReversals: [0,0,1,0,0,1,0,0,0,1] }
  },
  {
    id: "s6", name: "Frank Wilson", avatar: "FW", profile: "Kinestesico", anxietyLevel: "Medio", averageScore: 78, progress: 55, enrolledCourses: ["sci-101"], completedDiagnostic: true,
    profileScores: { Visual: 58, Auditivo: 65, Kinestesico: 82 },
    anxietyMetrics: { tabSwitches: [4,3,5,4,3,5,4,3,4,5], consecutiveClicks: [2,3,2,3,2,4,2,3,2,3], missedClicks: [1,2,1,2,1,1,2,1,2,1], timePerQuestion: [22,20,24,21,23,22,25,20,23,21], idleTime: [6,5,7,6,5,8,6,5,7,6], scrollReversals: [3,2,4,3,2,3,4,2,3,3] }
  },
  {
    id: "s7", name: "Grace Lee", avatar: "GL", profile: "Visual", anxietyLevel: "Bajo", averageScore: 90, progress: 72, enrolledCourses: ["math-101", "prog-101", "sci-101"], completedDiagnostic: true,
    profileScores: { Visual: 92, Auditivo: 68, Kinestesico: 60 },
    anxietyMetrics: { tabSwitches: [1,2,1,0,1,1,2,0,1,1], consecutiveClicks: [0,1,0,1,0,0,1,0,0,1], missedClicks: [0,0,1,0,0,1,0,0,0,1], timePerQuestion: [14,16,13,15,14,16,15,13,14,15], idleTime: [2,3,2,2,3,2,2,3,2,2], scrollReversals: [1,1,0,1,1,0,1,1,0,1] }
  },
  {
    id: "s8", name: "Henry Taylor", avatar: "HT", profile: "Auditivo", anxietyLevel: "Alto", averageScore: 67, progress: 38, enrolledCourses: ["math-101"], completedDiagnostic: true,
    profileScores: { Visual: 55, Auditivo: 72, Kinestesico: 50 },
    anxietyMetrics: { tabSwitches: [15,12,18,14,16,13,17,15,14,16], consecutiveClicks: [10,8,12,9,11,8,13,10,9,11], missedClicks: [7,8,6,9,7,8,10,7,8,9], timePerQuestion: [55,50,60,48,58,52,62,50,56,54], idleTime: [25,22,30,28,24,32,26,28,25,27], scrollReversals: [10,12,9,11,10,12,13,10,11,12] }
  },
]
