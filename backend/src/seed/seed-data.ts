import { Level, VideoStatus } from '../common/level.enum.js';

/**
 * URLs públicas de videos de PRUEBA (verificadas: responden 206 video/mp4 o video/webm).
 * Sustitúyelas por las videoclases reales cuando estén grabadas.
 */
export const TEST_VIDEO_URLS = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-30s.mp4',
  'https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
] as const;

export const TEST_MATERIALS = [
  { title: 'Apuntes de la clase (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { title: 'Hoja de práctica (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
];

export interface SeedTeacher {
  key: string;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  avatarColor: string;
}

export const TEACHERS: SeedTeacher[] = [
  {
    key: 'anahuac',
    name: 'Prof. Anáhuac Ríos',
    email: 'anahuac.rios@asesoriasgauss.mx',
    specialty: 'Cálculo y precálculo',
    bio: 'Ingeniero físico. Lleva 9 años preparando a estudiantes para el examen de admisión.',
    avatarColor: '#1B5FA8',
  },
  {
    key: 'lucia',
    name: 'Mtra. Lucía Bermúdez',
    email: 'lucia.bermudez@asesoriasgauss.mx',
    specialty: 'Física y química',
    bio: 'Química por la UNAM. Explica cada tema con experimentos que puedes hacer en casa.',
    avatarColor: '#2E9E6D',
  },
  {
    key: 'diego',
    name: 'Mtro. Diego Salvatierra',
    email: 'diego.salvatierra@asesoriasgauss.mx',
    specialty: 'Estadística y álgebra lineal',
    bio: 'Actuario. Da clases de estadística aplicada y álgebra lineal a nivel licenciatura.',
    avatarColor: '#22262B',
  },
  {
    key: 'itzel',
    name: 'Mtra. Itzel Carranza',
    email: 'itzel.carranza@asesoriasgauss.mx',
    specialty: 'Matemáticas y ciencias de secundaria',
    bio: 'Maestra de secundaria con enfoque en bases sólidas de álgebra y biología.',
    avatarColor: '#D62839',
  },
];

export interface SeedLesson {
  title: string;
  /** Duración en formato mm:ss. */
  duration: string;
  status?: VideoStatus;
  summary?: string;
}

export interface SeedUnit {
  title: string;
  lessons: SeedLesson[];
}

export interface SeedSubject {
  name: string;
  level: Level;
  color: string;
  description: string;
  teacher: string;
  units: SeedUnit[];
}

export const SUBJECTS: SeedSubject[] = [
  {
    name: 'Cálculo diferencial',
    level: Level.Preparatoria,
    color: '#1A1F2B',
    description: 'Límites, derivadas y sus aplicaciones, de cero a examen de admisión.',
    teacher: 'anahuac',
    units: [
      {
        title: 'Funciones',
        lessons: [
          { title: 'Qué es una función', duration: '10:12' },
          { title: 'Dominio y rango', duration: '11:48' },
        ],
      },
      {
        title: 'Límites',
        lessons: [
          { title: 'Límites al infinito', duration: '12:04' },
          { title: 'Continuidad de funciones', duration: '13:31' },
        ],
      },
      {
        title: 'Reglas de derivación',
        lessons: [
          { title: 'La derivada como razón de cambio', duration: '14:25' },
          { title: 'Regla de la potencia', duration: '11:30' },
          { title: 'Producto y cociente', duration: '13:47' },
          {
            title: 'Regla de la cadena, paso a paso',
            duration: '16:40',
            summary:
              'Derivamos funciones compuestas identificando la función externa y la interna, con tres ejercicios resueltos y un error frecuente al final. Al terminar: resuelve la práctica de 5 reactivos para marcar la lección como completada.',
          },
          { title: 'Práctica: 8 ejercicios breves', duration: '20:05' },
        ],
      },
      {
        title: 'Aplicaciones',
        lessons: [
          { title: 'Máximos y mínimos', duration: '17:11' },
          { title: 'Problemas de optimización', duration: '14:44', status: VideoStatus.Draft },
        ],
      },
    ],
  },
  {
    name: 'Física II',
    level: Level.Preparatoria,
    color: '#1B5FA8',
    description: 'Dinámica, trabajo y energía con problemas tipo examen.',
    teacher: 'lucia',
    units: [
      {
        title: 'Dinámica',
        lessons: [
          { title: 'Leyes de Newton I', duration: '12:20' },
          { title: 'Leyes de Newton II', duration: '15:02' },
          { title: 'Fricción y planos inclinados', duration: '18:36' },
        ],
      },
      {
        title: 'Trabajo y energía',
        lessons: [
          { title: 'Trabajo mecánico', duration: '11:15' },
          { title: 'Conservación de la energía', duration: '14:58', status: VideoStatus.Draft },
        ],
      },
    ],
  },
  {
    name: 'Química orgánica',
    level: Level.Preparatoria,
    color: '#4A90E2',
    description: 'Del átomo de carbono a los grupos funcionales.',
    teacher: 'lucia',
    units: [
      {
        title: 'Hidrocarburos',
        lessons: [
          { title: 'El átomo de carbono', duration: '09:44' },
          { title: 'Nomenclatura orgánica', duration: '16:21' },
          { title: 'Alcanos, alquenos y alquinos', duration: '13:09' },
        ],
      },
    ],
  },
  {
    name: 'Historia de México',
    level: Level.Preparatoria,
    color: '#22262B',
    description: 'De Mesoamérica al México contemporáneo.',
    teacher: 'itzel',
    units: [
      {
        title: 'México independiente',
        lessons: [
          { title: 'Causas de la Independencia', duration: '12:50' },
          { title: 'La Reforma', duration: '14:03' },
        ],
      },
    ],
  },
  {
    name: 'Álgebra',
    level: Level.Secundaria,
    color: '#1B5FA8',
    description: 'Ecuaciones, sistemas y productos notables.',
    teacher: 'itzel',
    units: [
      {
        title: 'Ecuaciones',
        lessons: [
          { title: 'Ecuaciones de primer grado', duration: '09:30' },
          { title: 'Sistemas de ecuaciones 2×2', duration: '08:40' },
          { title: 'Productos notables', duration: '12:15' },
        ],
      },
    ],
  },
  {
    name: 'Biología',
    level: Level.Secundaria,
    color: '#2E9E6D',
    description: 'La célula, los seres vivos y su entorno.',
    teacher: 'itzel',
    units: [
      {
        title: 'La célula',
        lessons: [
          { title: 'Célula animal y vegetal', duration: '10:05' },
          { title: 'Mitosis y meiosis', duration: '13:40' },
        ],
      },
    ],
  },
  {
    name: 'Estadística',
    level: Level.Universidad,
    color: '#4A90E2',
    description: 'Probabilidad, distribuciones e inferencia.',
    teacher: 'diego',
    units: [
      {
        title: 'Distribuciones',
        lessons: [
          { title: 'Variables aleatorias', duration: '15:30' },
          { title: 'Distribución normal y estandarización', duration: '21:05' },
          { title: 'Teorema del límite central', duration: '18:12', status: VideoStatus.Draft },
        ],
      },
    ],
  },
  {
    name: 'Álgebra lineal',
    level: Level.Universidad,
    color: '#1A1F2B',
    description: 'Vectores, matrices y transformaciones lineales.',
    teacher: 'diego',
    units: [
      {
        title: 'Matrices',
        lessons: [
          { title: 'Operaciones con matrices', duration: '14:10' },
          { title: 'Determinantes', duration: '16:45' },
        ],
      },
    ],
  },
];

export function toSeconds(mmss: string): number {
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
}
