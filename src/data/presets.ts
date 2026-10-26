import { VoiceOption, PresetSample } from '../types/tts';

export const GEMINI_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Femenina',
    badge: 'Popular',
    tone: 'Cálida, empática y expresiva',
    recommendedFor: 'Audiolibros, explicaciones, cursos y narración general',
    avatarColor: 'from-pink-500 to-rose-500',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Masculina',
    badge: 'Enérgica',
    tone: 'Joven, dinámica y conversacional',
    recommendedFor: 'Podcasts, videos de YouTube, tutoriales y redes sociales',
    avatarColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Masculina',
    badge: 'Cinematográfica',
    tone: 'Grave, profunda, solemne y potente',
    recommendedFor: 'Documentales, trailers, historias de misterio y dramatizaciones',
    avatarColor: 'from-blue-600 to-indigo-800',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Masculina',
    badge: 'Formal',
    tone: 'Serena, reflexiva, culta y confiable',
    recommendedFor: 'Artículos de opinión, ensayos, noticias y contenido corporativo',
    avatarColor: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Femenina',
    badge: 'Relajante',
    tone: 'Suave, melódica, pausada y calmante',
    recommendedFor: 'Meditación, bienestar, mindfulness e historias nocturnas',
    avatarColor: 'from-purple-500 to-cyan-500',
  },
];

export const STYLE_PRESETS = [
  {
    id: 'natural',
    label: 'Natural y fluida',
    prompt: 'Voz natural, espontánea y agradable en español, con cadencia humana y pausas precisas.',
  },
  {
    id: 'audiobook',
    label: 'Audiolibro inmersivo',
    prompt: 'Narrador de audiolibro profesional, cautivador, con rica entonación y matices dramáticos.',
  },
  {
    id: 'podcast',
    label: 'Podcast dinámico',
    prompt: 'Locutor de podcast cercano, amigable, enérgico y con entusiasmo contagioso.',
  },
  {
    id: 'news',
    label: 'Noticias formal',
    prompt: 'Locutor de informativo serio, objetivo, articulación impecable y ritmo constante.',
  },
  {
    id: 'meditation',
    label: 'Meditación y calma',
    prompt: 'Tono pausado, sereno, susurrado con suavidad, transmitiendo paz y respiración profunda.',
  },
  {
    id: 'storyteller',
    label: 'Cuentacuentos infantil',
    prompt: 'Narrador de fábulas muy expresivo, juguetón, con cambios divertidos de volumen y emoción.',
  },
  {
    id: 'promo',
    label: 'Comercial persuasivo',
    prompt: 'Voz publicitaria atractiva, motivadora, segura y que conecta directamente con la audiencia.',
  },
];

export const ACCENT_OPTIONS: { id: string; name: string; flag: string; description: string; promptDirective: string }[] = [
  {
    id: 'es-ES-standard',
    name: 'Castellano Peninsular (Estándar)',
    flag: '🇪🇸',
    description: 'Acento formal y limpio de España, con distinción clara entre "z/c" (/θ/) y "s" (/s/).',
    promptDirective: 'Idioma y acento: Español de España (castellano peninsular europeo). Pronunciación con distinción fonética peninsular española de la "c" y "z" (fonema /θ/) frente a la "s" (/s/). Entonación y cadencia natural de España.',
  },
  {
    id: 'es-ES-doblaje',
    name: 'Doblaje de Cine (España)',
    flag: '🎬',
    description: 'Voz teatral y cinematográfica con la dicción de los grandes actores de doblaje españoles.',
    promptDirective: 'Idioma y acento: Español de España (doblaje cinematográfico peninsular). Dicción impecable de actor de doblaje de Madrid/España, dramatismo contenido, proyección vocal brillante y distinción peninsular rigurosa.',
  },
  {
    id: 'es-ES-radio',
    name: 'Radio / Noticiero RNE',
    flag: '📻',
    description: 'Locución periodística de radio y televisión pública española.',
    promptDirective: 'Idioma y acento: Español de España (locutor de radio y telediario peninsular). Ritmo ágil, dicción informativa clara, modulación seria pero cercana, acento peninsular de España.',
  },
  {
    id: 'es-ES-fresco',
    name: 'Castellano Coloquial / Podcast',
    flag: '🎙️',
    description: 'Cercano, juvenil y espontáneo, como una conversación cotidiana en Madrid o Barcelona.',
    promptDirective: 'Idioma y acento: Español de España coloquial, fluido, desenfadado y amigable, entonación peninsular contemporánea.',
  },
  {
    id: 'es-neutral',
    name: 'Español Neutro Internacional',
    flag: '🌐',
    description: 'Acento hispanohablante global sin regionalismos marcados.',
    promptDirective: 'Idioma y acento: Español neutro internacional, pronunciación global equilibrada.',
  },
];

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-spain-doblaje',
    title: 'Doblaje Épico (Cine de España)',
    category: 'Publicidad',
    voice: 'Fenrir',
    style: 'Doblaje cinematográfico español peninsular, dramatismo épico y dicción teatral.',
    text: '¡Preparaos todos! Sé que el viaje ha sido extenuante, pero no retrocederemos ni un solo paso. Más allá de estas cordilleras nos aguarda la verdad que tanto tiempo hemos perseguido. Empuñad vuestro coraje, porque esta noche cambiaremos el destino de nuestro reino.',
  },
  {
    id: 'sample-audiobook-spain',
    title: 'Novela Española (Castellano)',
    category: 'Audiolibro',
    voice: 'Kore',
    style: 'Narrador de audiolibro profesional con acento castellano peninsular, rico y cálido.',
    text: 'Caminaba despacio por las callejuelas empedradas del barrio de las Letras en Madrid. El olor a castañas asadas impregnaba el aire de noviembre mientras las farolas titilaban entre la niebla. Al llegar al zaguán de su casa, encendió la pequeña lámpara del escritorio y abrió el viejo manuscrito encuadernado en cuero.',
  },
  {
    id: 'sample-tech-spain',
    title: 'Podcast Tech de España',
    category: 'Podcast',
    voice: 'Puck',
    style: 'Locutor de podcast de España, dinámico, amigable y con vocabulario tecnológico peninsular.',
    text: '¡Muy buenas a todos y bienvenidos al podcast! Hoy os traemos un tema que os va a flipar: los nuevos procesadores cuánticos ya se están probando en centros de investigación en España. Apagad el ordenador un momento y poneos cómodos, porque lo que viene a continuación es una auténtica pasada.',
  },
  {
    id: 'sample-news-spain',
    title: 'Informativo RNE (España)',
    category: 'Noticias',
    voice: 'Charon',
    style: 'Locutor de telediario español peninsular, riguroso, formal y de dicción perfecta.',
    text: 'Buenas tardes. El Consejo de Ministros ha aprobado esta mañana el nuevo plan estratégico de transición ecológica y energías renovables. En el ámbito meteorológico, la Agencia Estatal prevé un descenso notable de las temperaturas diurnas en toda la meseta norte y la cornisa cantábrica durante las próximas veinticuatro horas.',
  },
  {
    id: 'sample-meditation-spain',
    title: 'Meditación Guiada en Castellano',
    category: 'Meditación',
    voice: 'Zephyr',
    style: 'Tono pausado, sereno y susurrado en español peninsular suave.',
    text: 'Tómate un momento para ti. Siente cómo tu respiración fluye de manera natural, sin forzarla. Deja marchar los pensamientos del día a día, como nubes que cruzan el cielo de la tarde. En este instante, en este rincón de calma, permítete descansar plenamente.',
  },
];

