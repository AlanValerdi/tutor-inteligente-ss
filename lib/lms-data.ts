// Mock data store for the LMS application

export type StudyProfile = "Visual" | "Auditory" | "Kinesthetic"
export type AnxietyLevel = "Low" | "Medium" | "High"
export type TopicStatus = "completed" | "current" | "locked"

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
}

export interface DiagnosticQuestion {
  id: string
  question: string
  options: { label: string; profile: StudyProfile }[]
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "d1",
    question: "When learning something new, I prefer to...",
    options: [
      { label: "Watch a video or look at diagrams", profile: "Visual" },
      { label: "Listen to an explanation or podcast", profile: "Auditory" },
      { label: "Try it out hands-on with practice exercises", profile: "Kinesthetic" },
    ],
  },
  {
    id: "d2",
    question: "I remember information best when I...",
    options: [
      { label: "See it written down or in a chart", profile: "Visual" },
      { label: "Hear it spoken aloud or discuss it", profile: "Auditory" },
      { label: "Physically engage with the material", profile: "Kinesthetic" },
    ],
  },
  {
    id: "d3",
    question: "When studying for a test, I usually...",
    options: [
      { label: "Review notes, highlight key points, and use color coding", profile: "Visual" },
      { label: "Read notes aloud or explain concepts to others", profile: "Auditory" },
      { label: "Create flashcards and walk around while reviewing", profile: "Kinesthetic" },
    ],
  },
  {
    id: "d4",
    question: "In a classroom, I learn best when the teacher...",
    options: [
      { label: "Uses slides, diagrams, and visual demonstrations", profile: "Visual" },
      { label: "Explains concepts through lectures and discussions", profile: "Auditory" },
      { label: "Includes group activities and hands-on experiments", profile: "Kinesthetic" },
    ],
  },
  {
    id: "d5",
    question: "When I need to solve a problem, I typically...",
    options: [
      { label: "Draw it out or visualize the solution", profile: "Visual" },
      { label: "Talk through the problem step by step", profile: "Auditory" },
      { label: "Build a model or physically work through it", profile: "Kinesthetic" },
    ],
  },
]

export const courses: Course[] = [
  {
    id: "math-101",
    title: "Mathematics Fundamentals",
    description: "Build a strong foundation in algebra, geometry, and basic calculus.",
    icon: "Calculator",
    category: "Mathematics",
    studentsEnrolled: 156,
    topics: [
      {
        id: "t1",
        title: "Introduction to Algebra",
        description: "Learn the basics of algebraic expressions, variables, and equations.",
        status: "completed",
        duration: "45 min",
        videoUrl: "https://example.com/video/algebra-intro",
        audioUrl: "https://example.com/audio/algebra-intro",
        textContent: "Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols. In algebra, those symbols represent quantities without fixed values, known as variables. The fundamental operations of algebra include addition, subtraction, multiplication, and division.\n\nVariables are symbols (usually letters) that represent unknown values. For example, in the equation x + 5 = 10, x is a variable representing the value 5.\n\nAlgebraic expressions combine variables, numbers, and operations. For example: 3x + 2y - 7 is an algebraic expression with two variables.\n\nKey concepts:\n- Constants are fixed values (like 5, -3, or pi)\n- Coefficients are numbers multiplied by variables (in 3x, 3 is the coefficient)\n- Like terms have the same variable raised to the same power\n- You can combine like terms: 2x + 3x = 5x",
        quiz: [
          { id: "q1", question: "What is the value of x in: 2x + 4 = 10?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q2", question: "Simplify: 3x + 2x", options: ["5x", "6x", "5x^2", "6"], correctAnswer: 0 },
          { id: "q3", question: "Which is NOT an algebraic expression?", options: ["3x + 2", "x^2 - 1", "5 + 3 = 8", "2y - 7"], correctAnswer: 2 },
        ],
      },
      {
        id: "t2",
        title: "Linear Equations",
        description: "Solve one-variable and two-variable linear equations and graph them.",
        status: "current",
        duration: "60 min",
        videoUrl: "https://example.com/video/linear-equations",
        audioUrl: "https://example.com/audio/linear-equations",
        textContent: "A linear equation is an equation where the highest power of the variable is 1. The general form is ax + b = c, where a, b, and c are constants.\n\nTo solve a linear equation:\n1. Simplify both sides by combining like terms\n2. Move variable terms to one side and constants to the other\n3. Divide both sides by the coefficient of the variable\n\nExample: Solve 3x + 7 = 22\nStep 1: Subtract 7 from both sides: 3x = 15\nStep 2: Divide both sides by 3: x = 5\n\nTwo-variable linear equations (y = mx + b) can be graphed on a coordinate plane, creating a straight line. The slope (m) represents the rate of change, and the y-intercept (b) is where the line crosses the y-axis.",
        quiz: [
          { id: "q4", question: "Solve: 5x - 3 = 12", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q5", question: "What is the slope in y = 3x + 2?", options: ["2", "3", "5", "1"], correctAnswer: 1 },
          { id: "q6", question: "A linear equation's graph is always a...", options: ["Curve", "Circle", "Straight line", "Parabola"], correctAnswer: 2 },
        ],
      },
      {
        id: "t3",
        title: "Quadratic Equations",
        description: "Understand and solve quadratic equations using factoring and the quadratic formula.",
        status: "locked",
        duration: "75 min",
        videoUrl: "https://example.com/video/quadratics",
        audioUrl: "https://example.com/audio/quadratics",
        textContent: "A quadratic equation has the form ax^2 + bx + c = 0, where a is not zero. The graph of a quadratic is a parabola.\n\nMethods to solve:\n1. Factoring: Rewrite the equation as (x - r1)(x - r2) = 0\n2. Quadratic Formula: x = (-b +/- sqrt(b^2 - 4ac)) / 2a\n3. Completing the square\n\nThe discriminant (b^2 - 4ac) determines the number of solutions:\n- Positive: two distinct real solutions\n- Zero: one repeated solution\n- Negative: no real solutions",
        quiz: [
          { id: "q7", question: "What is the degree of a quadratic equation?", options: ["1", "2", "3", "4"], correctAnswer: 1 },
          { id: "q8", question: "The graph of a quadratic equation is a...", options: ["Line", "Circle", "Parabola", "Hyperbola"], correctAnswer: 2 },
          { id: "q9", question: "In x^2 - 5x + 6 = 0, what are the roots?", options: ["1 and 6", "2 and 3", "-2 and -3", "1 and 5"], correctAnswer: 1 },
        ],
      },
      {
        id: "t4",
        title: "Introduction to Geometry",
        description: "Explore points, lines, angles, and basic geometric shapes.",
        status: "locked",
        duration: "50 min",
        videoUrl: "https://example.com/video/geometry-intro",
        audioUrl: "https://example.com/audio/geometry-intro",
        textContent: "Geometry is the branch of mathematics concerned with shapes, sizes, and the properties of space.",
        quiz: [
          { id: "q10", question: "How many degrees in a right angle?", options: ["45", "90", "180", "360"], correctAnswer: 1 },
          { id: "q11", question: "A triangle has how many sides?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
          { id: "q12", question: "Sum of angles in a triangle?", options: ["90", "180", "270", "360"], correctAnswer: 1 },
        ],
      },
    ],
  },
  {
    id: "prog-101",
    title: "Introduction to Programming",
    description: "Learn programming fundamentals with hands-on coding exercises.",
    icon: "Code",
    category: "Computer Science",
    studentsEnrolled: 203,
    topics: [
      {
        id: "p1",
        title: "Variables and Data Types",
        description: "Understand the building blocks of programming: variables, strings, numbers, and booleans.",
        status: "completed",
        duration: "40 min",
        videoUrl: "https://example.com/video/variables",
        audioUrl: "https://example.com/audio/variables",
        textContent: "Variables are containers for storing data values. Every variable has a name and a type.\n\nCommon data types:\n- String: Text values wrapped in quotes (\"Hello World\")\n- Number/Integer: Whole numbers (42, -7)\n- Float/Decimal: Numbers with decimal points (3.14)\n- Boolean: True or false values\n\nVariable naming rules:\n- Must start with a letter or underscore\n- Cannot contain spaces\n- Case-sensitive (myVar and MyVar are different)\n- Should be descriptive (use 'userName' not just 'u')",
        quiz: [
          { id: "pq1", question: "Which is a valid variable name?", options: ["2name", "my-var", "myVar", "my var"], correctAnswer: 2 },
          { id: "pq2", question: "What data type is 'true'?", options: ["String", "Number", "Boolean", "Float"], correctAnswer: 2 },
          { id: "pq3", question: "What data type is 3.14?", options: ["Integer", "Float", "String", "Boolean"], correctAnswer: 1 },
        ],
      },
      {
        id: "p2",
        title: "Control Flow",
        description: "Learn about if/else statements, loops, and conditional logic.",
        status: "current",
        duration: "55 min",
        videoUrl: "https://example.com/video/control-flow",
        audioUrl: "https://example.com/audio/control-flow",
        textContent: "Control flow determines the order in which code executes. The three main control structures are:\n\n1. Sequential: Code runs line by line from top to bottom\n2. Selection: if/else statements choose between paths\n3. Iteration: Loops repeat code blocks\n\nIf/else statements:\nif (condition) { /* code if true */ } else { /* code if false */ }\n\nLoops:\n- for loop: Repeat a set number of times\n- while loop: Repeat while a condition is true\n- do-while loop: Execute once, then check condition",
        quiz: [
          { id: "pq4", question: "What does an if statement check?", options: ["A loop", "A condition", "A variable name", "A function"], correctAnswer: 1 },
          { id: "pq5", question: "Which loop always runs at least once?", options: ["for", "while", "do-while", "foreach"], correctAnswer: 2 },
          { id: "pq6", question: "What is iteration?", options: ["Declaring variables", "Repeating code", "Defining functions", "Importing modules"], correctAnswer: 1 },
        ],
      },
      {
        id: "p3",
        title: "Functions",
        description: "Create reusable blocks of code with functions and parameters.",
        status: "locked",
        duration: "50 min",
        videoUrl: "https://example.com/video/functions",
        audioUrl: "https://example.com/audio/functions",
        textContent: "Functions are reusable blocks of code designed to perform a specific task.",
        quiz: [
          { id: "pq7", question: "What keyword defines a function in JavaScript?", options: ["def", "func", "function", "method"], correctAnswer: 2 },
          { id: "pq8", question: "What is a function's return value?", options: ["Its name", "Its output", "Its parameters", "Its loop count"], correctAnswer: 1 },
          { id: "pq9", question: "What are parameters?", options: ["Return values", "Function names", "Input values to a function", "Loop counters"], correctAnswer: 2 },
        ],
      },
    ],
  },
  {
    id: "sci-101",
    title: "Science Foundations",
    description: "Explore the natural world through physics, chemistry, and biology basics.",
    icon: "Atom",
    category: "Science",
    studentsEnrolled: 134,
    topics: [
      {
        id: "s1",
        title: "Introduction to Physics",
        description: "Understand fundamental concepts of motion, force, and energy.",
        status: "current",
        duration: "55 min",
        videoUrl: "https://example.com/video/physics-intro",
        audioUrl: "https://example.com/audio/physics-intro",
        textContent: "Physics is the study of matter, energy, and the interactions between them. Fundamental concepts include:\n\n- Motion: Objects change position over time\n- Force: A push or pull that changes an object's motion\n- Energy: The ability to do work\n- Newton's Laws of Motion describe how forces affect objects",
        quiz: [
          { id: "sq1", question: "What is force?", options: ["A type of energy", "A push or pull", "A unit of measurement", "A chemical reaction"], correctAnswer: 1 },
          { id: "sq2", question: "Who formulated the laws of motion?", options: ["Einstein", "Newton", "Galileo", "Hawking"], correctAnswer: 1 },
          { id: "sq3", question: "Energy is the ability to do...", options: ["Force", "Motion", "Work", "Gravity"], correctAnswer: 2 },
        ],
      },
      {
        id: "s2",
        title: "Basic Chemistry",
        description: "Learn about atoms, elements, compounds, and chemical reactions.",
        status: "locked",
        duration: "60 min",
        videoUrl: "https://example.com/video/chemistry",
        audioUrl: "https://example.com/audio/chemistry",
        textContent: "Chemistry is the study of matter and the changes it undergoes.",
        quiz: [
          { id: "sq4", question: "What is the smallest unit of an element?", options: ["Molecule", "Atom", "Cell", "Electron"], correctAnswer: 1 },
          { id: "sq5", question: "H2O is the formula for...", options: ["Oxygen", "Hydrogen", "Water", "Carbon dioxide"], correctAnswer: 2 },
          { id: "sq6", question: "The periodic table organizes...", options: ["Molecules", "Compounds", "Elements", "Reactions"], correctAnswer: 2 },
        ],
      },
    ],
  },
]

export const students: Student[] = [
  { id: "s1", name: "Alice Johnson", avatar: "AJ", profile: "Visual", anxietyLevel: "Low", averageScore: 92, progress: 78, enrolledCourses: ["math-101", "prog-101"], completedDiagnostic: true },
  { id: "s2", name: "Bob Williams", avatar: "BW", profile: "Auditory", anxietyLevel: "Medium", averageScore: 85, progress: 65, enrolledCourses: ["math-101", "sci-101"], completedDiagnostic: true },
  { id: "s3", name: "Clara Davis", avatar: "CD", profile: "Kinesthetic", anxietyLevel: "Low", averageScore: 88, progress: 82, enrolledCourses: ["prog-101"], completedDiagnostic: true },
  { id: "s4", name: "Daniel Martinez", avatar: "DM", profile: "Visual", anxietyLevel: "High", averageScore: 71, progress: 45, enrolledCourses: ["math-101", "sci-101", "prog-101"], completedDiagnostic: true },
  { id: "s5", name: "Emma Brown", avatar: "EB", profile: "Auditory", anxietyLevel: "Low", averageScore: 95, progress: 90, enrolledCourses: ["math-101", "prog-101"], completedDiagnostic: true },
  { id: "s6", name: "Frank Wilson", avatar: "FW", profile: "Kinesthetic", anxietyLevel: "Medium", averageScore: 78, progress: 55, enrolledCourses: ["sci-101"], completedDiagnostic: true },
  { id: "s7", name: "Grace Lee", avatar: "GL", profile: "Visual", anxietyLevel: "Low", averageScore: 90, progress: 72, enrolledCourses: ["math-101", "prog-101", "sci-101"], completedDiagnostic: true },
  { id: "s8", name: "Henry Taylor", avatar: "HT", profile: "Auditory", anxietyLevel: "High", averageScore: 67, progress: 38, enrolledCourses: ["math-101"], completedDiagnostic: true },
]
