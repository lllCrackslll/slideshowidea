import type { Carousel, Genre, GenreId } from "./types";

export const GENRES: Genre[] = [
  { id: "neuroscience", emoji: "🧠", label: "Méthodes & Neurosciences" },
  { id: "debunking", emoji: "❌", label: "Débunking & Erreurs" },
  { id: "routines", emoji: "📅", label: "Routines & Organisation" },
  { id: "tech", emoji: "🛠️", label: "Tech Stack & Outils" },
];

export function genreLabel(id: GenreId): string {
  return GENRES.find((g) => g.id === id)?.label ?? id;
}

export const DEFAULT_CAROUSEL: Carousel = {
  id: "default",
  genre: "neuroscience",
  topic: "Courbe de l'oubli",
  slides: [
    {
      id: "d1",
      text: "Tu révises 4 heures.\nTrois jours plus tard, tout a disparu.",
      visual:
        "Chambre d'étudiant la nuit, notes éparpillées, écran qui éclaire le visage.",
    },
    {
      id: "d2",
      text: "C'est la courbe de l'oubli.\nSans rappel, tu perds ~70% en 24h.",
      visual:
        "Graphique Ebbinghaus minimaliste, ligne blanche qui chute sur fond noir.",
    },
    {
      id: "d3",
      text: "Le fix : 4 rappels.\nJ+1 · J+3 · J+7 · J+30.",
      visual:
        "Timeline horizontale avec 4 points lumineux, esthétique Linear.",
    },
    {
      id: "d4",
      text: "Active recall > relire.\nFerme tes notes. Écris ce que tu retiens.",
      visual: "iPad, Apple Pencil, page blanche, café, lumière tamisée.",
    },
    {
      id: "d5",
      text: "Sauvegarde ce post.\nTon cerveau n'est pas cassé.\nTon système l'est.",
      visual: "Bureau minimaliste sombre avec café et iPad.",
    },
  ],
  caption:
    "Tu n'as pas « une mauvaise mémoire ». Tu n'as pas de système de rappel.\n\nLa courbe de l'oubli (Ebbinghaus) : sans révision espacée, la majorité de ce que tu apprends s'évapore en 24h.\n\nProtocole simple :\n→ J+1 : rappel actif (sans notes)\n→ J+3 : même chose\n→ J+7 : mix + cartes\n→ J+30 : dernier passage\n\nRelire n'est pas réviser. Fermer le cours et se tester, si.\n\nSauvegarde pour le jour des partiels.",
  hashtags: [
    "#etudiant",
    "#study",
    "#studytok",
    "#revision",
    "#courbedeloubli",
    "#neuroscience",
    "#productivite",
    "#learnontiktok",
    "#methodes",
    "#focus",
  ],
};

type Template = {
  topicHint: string;
  slides: { text: string; visual: string }[];
  caption: string;
  hashtags: string[];
};

const TEMPLATES: Record<GenreId, Template[]> = {
  neuroscience: [
    {
      topicHint: "Courbe de l'oubli",
      slides: [
        {
          text: "Tu bosses {topic}.\nEt dans 48h, c'est comme si tu n'avais rien fait.",
          visual:
            "Étudiant face à un mur de notes, lumière froide, expression vide.",
        },
        {
          text: "Ton cerveau n'enregistre pas.\nIl trie. Ce qui n'est pas rappelé est jeté.",
          visual:
            "Animation mentale : fichiers qui se dissolvent dans un fond noir.",
        },
        {
          text: "Espacement > volume.\n4 rappels battent 4 heures d'affilée.",
          visual: "Calendrier minimaliste avec 4 jours marqués d'un point blanc.",
        },
        {
          text: "Rappel actif : ferme {topic}.\nÉcris 5 points de mémoire. Vérifie.",
          visual: "Page blanche, stylo, cours fermé à côté, café.",
        },
        {
          text: "La mémoire n'est pas un don.\nC'est un planning.",
          visual: "Bureau sombre, iPad, tasse, une seule feuille au centre.",
        },
      ],
      caption:
        "{Topic} ne reste pas tout seul dans ta tête.\n\nSans rappels, tu perds l'essentiel en 24–48h. Ce n'est pas de la paresse — c'est le design du cerveau.\n\nProtocole :\n→ J+1 rappel sans notes\n→ J+3\n→ J+7\n→ J+30\n\nSauvegarde. Ton futur toi va remercier.",
      hashtags: [
        "#etudiant",
        "#study",
        "#studytok",
        "#revision",
        "#neuroscience",
        "#memoire",
        "#productivite",
        "#learnontiktok",
      ],
    },
    {
      topicHint: "Active recall",
      slides: [
        {
          text: "Relire {topic} te donne l'illusion de savoir.",
          visual: "Surlignage fluo sur un polycopié, plan serré, lumière plate.",
        },
        {
          text: "Le cerveau aime la reconnaissance.\nL'examen demande le rappel.",
          visual: "Deux colonnes : « je reconnais » vs « je restitue ».",
        },
        {
          text: "Ferme le cours.\nUne question. Une feuille. Zéro notes.",
          visual: "iPad vide, clavier fermé, minuteur 10:00.",
        },
        {
          text: "Chaque trou de mémoire\nest un plan de révision gratuit.",
          visual: "Liste de questions avec des cases vides, esthétique brute.",
        },
        {
          text: "Si tu ne peux pas l'expliquer,\ntu ne le sais pas encore.",
          visual: "Tableau noir, une phrase au centre, craie blanche.",
        },
      ],
      caption:
        "Active recall, version simple — appliqué à {topic}.\n\n1. Une question\n2. Réponse de mémoire\n3. Vérifie\n4. Note uniquement ce qui a foiré\n\nRelire 40 pages, c'est du confort. Se tester 10 minutes, c'est de la mémoire.\n\nSauvegarde avant tes partiels.",
      hashtags: [
        "#etudiant",
        "#study",
        "#activerecall",
        "#revision",
        "#methodes",
        "#studytok",
        "#learnontiktok",
        "#focus",
      ],
    },
    {
      topicHint: "Charge cognitive",
      slides: [
        {
          text: "Tu n'es pas « nul en {topic} ».\nTon cerveau est saturé.",
          visual:
            "Bureau chaotique : 6 onglets, 3 stylos, notifs, lumière trop forte.",
        },
        {
          text: "La charge cognitive a un plafond.\nAu-delà, plus rien n'entre.",
          visual: "Verre qui déborde, fond noir, esthétique publicitaire.",
        },
        {
          text: "Une idée. Une page.\nZéro musique avec paroles.",
          visual: "Setup minimal : un cours, un carnet, téléphone dans un tiroir.",
        },
        {
          text: "Interleave : 25 min {topic},\n5 min d'un autre chapitre.",
          visual: "Deux blocs de couleur sur un planner, très clean.",
        },
        {
          text: "Moins d'inputs.\nPlus de rétention.",
          visual: "Pièce sombre, une lampe, un cahier ouvert.",
        },
      ],
      caption:
        "Si {topic} « ne rentre pas », commence par enlever, pas par ajouter.\n\n→ 1 source à la fois\n→ téléphone hors pièce\n→ 25 min profondes, pas 2h floues\n→ une page de synthèse à la fin\n\nTon attention est une ressource. Traite-la comme ça.",
      hashtags: [
        "#etudiant",
        "#study",
        "#focus",
        "#chargecognitive",
        "#productivite",
        "#studytok",
        "#revision",
        "#deepwork",
      ],
    },
  ],
  debunking: [
    {
      topicHint: "Relire n'est pas réviser",
      slides: [
        {
          text: "Le mythe le plus cher\ndes étudiants : relire {topic}.",
          visual: "Étudiant qui surligne un cours entier, plan large, ironique.",
        },
        {
          text: "Ça fait « travaillé ».\nÇa ne fait pas « su ».",
          visual: "Barre de progression 100% lecture, 12% restitution.",
        },
        {
          text: "La relecture fluide = familiarité.\nPas de maîtrise.",
          visual: "Texte qui défile trop vite, œil qui suit sans s'arrêter.",
        },
        {
          text: "Test : ferme {topic}.\nRécite la structure en 60 secondes.",
          visual: "Minuteur 01:00, page blanche, cours retourné.",
        },
        {
          text: "Si tu bloques, tu viens de trouver\nta vraie séance de révision.",
          visual: "Seul mot au tableau : « structure ».",
        },
      ],
      caption:
        "Debunk : relire {topic} n'est pas réviser.\n\nTu reconnais les phrases. L'examen te demande de les produire.\n\nRemplace 1h de relecture par :\n→ 10 min de plan de mémoire\n→ 10 min de questions\n→ 10 min de correction\n\nMoins confortable. Beaucoup plus rentable.",
      hashtags: [
        "#etudiant",
        "#debunk",
        "#revision",
        "#study",
        "#erreurs",
        "#studytok",
        "#methodes",
        "#learnontiktok",
      ],
    },
    {
      topicHint: "Le surligneur",
      slides: [
        {
          text: "Ton cours de {topic} est fluo.\nTa note ne l'est pas.",
          visual: "Polycopié entièrement jaune, gros plan, presque absurde.",
        },
        {
          text: "Surligner, c'est classer.\nCe n'est pas encoder.",
          visual: "Cerveau schématique : flèche « marquage » vs « mémoire ».",
        },
        {
          text: "Règle : 1 phrase par page.\nSi tout est important, rien ne l'est.",
          visual: "Une seule ligne soulignée sur une page noire et blanche.",
        },
        {
          text: "Après le marqueur : une question.\nToujours.",
          visual: "Marge du cours transformée en liste de questions.",
        },
        {
          text: "Le fluo n'est pas un plan.\nC'est une décoration.",
          visual: "Marqueur posé, fermé, à côté d'une fiche de rappel.",
        },
      ],
      caption:
        "Le surligneur ne t'a jamais fait réussir {topic}.\n\nIl crée une fausse sensation de progrès. Ton cerveau aime les couleurs, pas forcément le contenu.\n\nProtocole :\n1. Lis sans rien marquer\n2. Ferme\n3. Écris 3 idées\n4. Ouvre et compare\n5. Surligne uniquement les trous\n\nSauvegarde si tu es encore en mode fluo.",
      hashtags: [
        "#etudiant",
        "#debunk",
        "#study",
        "#revision",
        "#conseils",
        "#studytok",
        "#productivite",
        "#focus",
      ],
    },
    {
      topicHint: "Réviser la veille",
      slides: [
        {
          text: "Réviser {topic} la veille,\nc'est un pari. Pas une méthode.",
          visual: "3h12 du matin, Red Bull, cours ouvert, œil rouge.",
        },
        {
          text: "La mémoire de travail tient peu.\nL'examen demande de la longue durée.",
          visual: "Sablier presque vide sur un bureau noir.",
        },
        {
          text: "Une nuit de sommeil\nbat une nuit de panique.",
          visual: "Split screen : lit fait vs écran à 4h. Le lit gagne.",
        },
        {
          text: "Veille = 1 fiche + 10 questions.\nPas 80 pages.",
          visual: "Une fiche A5, un stylo, téléphone en mode avion.",
        },
        {
          text: "Le cram n'est pas du grind.\nC'est du déni organisé.",
          visual: "Calendrier : 4 sessions courtes > 1 nuit blanche.",
        },
      ],
      caption:
        "Réviser {topic} uniquement la veille, c'est maximiser le stress et minimiser le rappel.\n\nLe sommeil consolide. Le binge détruit.\n\nSi tu es déjà la veille :\n→ 1 structure\n→ 10 questions\n→ 1 sommeil\n→ 0 nouvelle notion à 2h du mat\n\nPour la prochaine fois : J-7, J-3, J-1. Pas J-0.23.",
      hashtags: [
        "#etudiant",
        "#partiels",
        "#debunk",
        "#revision",
        "#study",
        "#sommeil",
        "#studytok",
        "#organisation",
      ],
    },
  ],
  routines: [
    {
      topicHint: "Réviser les partiels",
      slides: [
        {
          text: "Les partiels ne se gagnent pas\nla semaine J. Ils se construisent.",
          visual:
            "Planner ouvert, 3 matières, cases cochées, lumière du matin.",
        },
        {
          text: "{Topic} : 4 blocs de 50 min.\nPas 8h « on verra bien ».",
          visual: "Time-blocking : 4 rectangles blancs sur fond noir.",
        },
        {
          text: "Matin = acquisition.\nAprès-midi = rappel actif.",
          visual: "Icônes soleil / lune, deux modes de travail distincts.",
        },
        {
          text: "Shutdown 21h30.\nUne phrase : « demain, chapitre X ».",
          visual: "Cahier fermé, lampe éteinte, bureau clair.",
        },
        {
          text: "La routine bat la motivation.\nTous les soirs.",
          visual: "Même setup, 5 jours d'affilée, photos identiques.",
        },
      ],
      caption:
        "Routine partiels pour {topic} :\n\n08:30 — 50 min acquisition\nPause 10\n50 min questions\nPause 20 + marche\n50 min trous / fiches\n50 min autre matière (interleaving)\n\n21:30 shutdown. Écris la première action de demain.\n\nTu n'as pas besoin d'être inspiré. Tu as besoin d'une heure de début.",
      hashtags: [
        "#etudiant",
        "#partiels",
        "#routine",
        "#organisation",
        "#study",
        "#planning",
        "#studytok",
        "#productivite",
      ],
    },
    {
      topicHint: "Deep work",
      slides: [
        {
          text: "90 minutes sur {topic}.\nZéro notif. Zéro « juste un truc ».",
          visual: "Téléphone dans un tiroir, porte fermée, lampe unique.",
        },
        {
          text: "Le deep work n'est pas une vibe.\nC'est une contrainte d'environnement.",
          visual: "Mode avion, onglets fermés, un seul document.",
        },
        {
          text: "Rituel de 2 minutes :\neau, minuteur, intention écrite.",
          visual: "Post-it : « À la fin : savoir expliquer X ».",
        },
        {
          text: "Si tu sors, tu notes.\nTu ne « checks » pas.",
          visual: "Capture d'un parking lot : idées hors sujet, à plus tard.",
        },
        {
          text: "Une vraie session\n> trois fausses journées.",
          visual: "Compteur 01:30:00, bureau vide, café.",
        },
      ],
      caption:
        "Deep work étudiant — {topic}.\n\nAvant :\n→ intention en une phrase\n→ téléphone ailleurs\n→ 90 min chrono\n\nPendant :\n→ une tâche\n→ parking lot pour les idées hors sujet\n\nAprès :\n→ 5 lignes de ce que tu peux enseigner\n\nC'est ça, une journée réussie. Pas 11h de présence.",
      hashtags: [
        "#etudiant",
        "#deepwork",
        "#focus",
        "#study",
        "#routine",
        "#productivite",
        "#studytok",
        "#organisation",
      ],
    },
    {
      topicHint: "Time blocking",
      slides: [
        {
          text: "Ta to-do n'est pas un plan.\nC'est une liste d'intentions.",
          visual: "Longue to-do non cochée vs calendrier avec 3 blocs.",
        },
        {
          text: "Si {topic} n'a pas d'heure,\nil n'existera pas.",
          visual: "Google Calendar dark mode, bloc 9:00–10:30 « {topic} ».",
        },
        {
          text: "3 blocs max par jour.\nLe reste est du bruit.",
          visual: "Journée : 3 rectangles, beaucoup de vide volontaire.",
        },
        {
          text: "Bloque aussi les pauses.\nSinon elles mangent le travail.",
          visual: "Alarme 10 min, marche, pas de feed.",
        },
        {
          text: "Ce qui n'est pas calé\nest déjà reporté.",
          visual: "Agenda du soir : demain déjà écrit.",
        },
      ],
      caption:
        "Time blocking pour {topic} :\n\n1. Choisis 3 blocs (pas 12 tâches)\n2. Donne une heure de début\n3. Donne un livrable (« fiche chapitre 4 »)\n4. Protège-les comme un cours\n\nUne to-do dit « un jour ». Un bloc dit « mardi 9h ».\n\nSauvegarde si tu vis encore dans les listes infinies.",
      hashtags: [
        "#etudiant",
        "#timeblocking",
        "#organisation",
        "#planning",
        "#study",
        "#routine",
        "#productivite",
        "#studytok",
      ],
    },
  ],
  tech: [
    {
      topicHint: "Anki",
      slides: [
        {
          text: "Anki ne sert à rien\nsi tes cartes sont des pavés.",
          visual: "Carte Anki illisible, 12 lignes, dark mode.",
        },
        {
          text: "1 carte = 1 fait.\nPour {topic} : une idée, une face.",
          visual: "Carte ultra courte : question / un mot-clé.",
        },
        {
          text: "Écris tes cartes après le rappel.\nPas pendant la lecture.",
          visual: "Cours fermé, Anki ouvert, 5 cartes nouvelles.",
        },
        {
          text: "20 cartes / jour battent\n200 cartes de panique le dimanche.",
          visual: "Streak Anki propre, petit nombre, consistant.",
        },
        {
          text: "L'outil n'apprend pas à ta place.\nIl te force à te souvenir.",
          visual: "iPhone, session Anki 8 min, transports, lumière naturelle.",
        },
      ],
      caption:
        "Anki pour {topic}, sans se noyer :\n\n→ cartes atomiques\n→ créées après un test de mémoire\n→ 15–25 nouvelles / jour max\n→ reviews tous les jours, même 6 min\n\nAnki n'est pas un second cours. C'est le filet de la courbe de l'oubli.\n\nSauvegarde avant de construire un deck de 900 cartes illisibles.",
      hashtags: [
        "#etudiant",
        "#anki",
        "#spacedrepetition",
        "#study",
        "#techstack",
        "#revision",
        "#studytok",
        "#outils",
      ],
    },
    {
      topicHint: "Notion",
      slides: [
        {
          text: "Ton Notion est magnifique.\nTon examen s'en fiche.",
          visual: "Dashboard Notion aesthetic, 0 page réellement apprise.",
        },
        {
          text: "Le piège : builder {topic}\nau lieu de le retravailler.",
          visual: "Templates, icônes, databases — zéro question.",
        },
        {
          text: "Règle : 1 page « source ».\n1 page « questions ».",
          visual: "Deux pages Notion, UI sombre, rien d'autre.",
        },
        {
          text: "Si ça prend plus de 10 min\nà ranger, c'est de la procrastination.",
          visual: "Minuteur 10:00 à côté de l'app.",
        },
        {
          text: "Un outil simple utilisé\nbat un système parfait vide.",
          visual: "Notes app vs Notion. La notes app gagne le soir d'examen.",
        },
      ],
      caption:
        "Notion pour {topic} : version anti-aesthetic.\n\nAutorisé :\n→ une page cours\n→ une page questions / erreurs\n→ un calendrier de rappels\n\nInterdit :\n→ 4 databases\n→ 2h de covers\n→ un CRM de tes chapitres\n\nSi tu ranges plus que tu ne te testes, tu n'étudies pas. Tu décores.",
      hashtags: [
        "#etudiant",
        "#notion",
        "#productivity",
        "#study",
        "#techstack",
        "#organisation",
        "#studytok",
        "#outils",
      ],
    },
    {
      topicHint: "iPad & GoodNotes",
      slides: [
        {
          text: "L'iPad n'est pas une méthode.\nC'est un tableau plus cher.",
          visual: "iPad + Apple Pencil, GoodNotes, café, setup soigné.",
        },
        {
          text: "Pour {topic} : écris, ne copie pas.\nLa copie = relecture déguisée.",
          visual: "Split : PDF du prof vs page manuscrite de questions.",
        },
        {
          text: "3 calques max.\nCours / questions / erreurs.",
          visual: "GoodNotes, 3 onglets, dark, très lisible.",
        },
        {
          text: "Exporte une fiche A4.\nSi tu ne peux pas, c'est trop chargé.",
          visual: "Une page synthèse, marges, 7 puces.",
        },
        {
          text: "Le pencil aide si tu penses.\nPas si tu transcris.",
          visual: "Bureau minimaliste sombre avec café et iPad.",
        },
      ],
      caption:
        "iPad / GoodNotes pour {topic} :\n\n1. Annoter ≠ apprendre\n2. Transforme chaque page en 2–3 questions\n3. Fiche d'erreurs à part\n4. Une fois par semaine : page blanche, restituer sans le PDF\n\nLe hardware ne remplace pas le rappel. Il peut juste le rendre plus propre.\n\nSauvegarde si tu es encore en mode « je recopie le diapo ».",
      hashtags: [
        "#etudiant",
        "#ipad",
        "#goodnotes",
        "#study",
        "#digitalnotes",
        "#techstack",
        "#studytok",
        "#revision",
      ],
    },
  ],
};

const lastIndex: Partial<Record<GenreId, number>> = {};

function pickTemplate(genre: GenreId): Template {
  const bank = TEMPLATES[genre];
  if (bank.length === 1) return bank[0];
  let i = Math.floor(Math.random() * bank.length);
  if (i === lastIndex[genre]) i = (i + 1) % bank.length;
  lastIndex[genre] = i;
  return bank[i];
}

function interpolate(str: string, topic: string): string {
  const trimmed = topic.trim();
  const raw = trimmed || "ce sujet";
  const titled = raw.charAt(0).toUpperCase() + raw.slice(1);
  return str.replaceAll("{topic}", raw).replaceAll("{Topic}", titled);
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function topicHashtag(topic: string): string | null {
  const slug = topic
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return slug ? `#${slug.slice(0, 24)}` : null;
}

export function generateCarousel(genre: GenreId, topicInput: string): Carousel {
  const template = pickTemplate(genre);
  const topic = topicInput.trim() || template.topicHint;
  const extra = topicHashtag(topic);
  const hashtags = extra
    ? Array.from(new Set([extra, ...template.hashtags]))
    : template.hashtags;

  return {
    id: uid("c"),
    genre,
    topic,
    slides: template.slides.map((slide) => ({
      id: uid("s"),
      text: interpolate(slide.text, topic),
      visual: interpolate(slide.visual, topic),
    })),
    caption: interpolate(template.caption, topic),
    hashtags,
  };
}

export function formatCarouselText(carousel: Carousel): string {
  const slides = carousel.slides
    .map((slide, index) => {
      return [
        `SLIDE ${index + 1}/5`,
        slide.title ? `${slide.title}\n${slide.text}` : slide.text,
        "",
        `Idée de visuel : ${slide.visual}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return [
    `KOGNIA — ${genreLabel(carousel.genre)}`,
    carousel.topic ? `Sujet : ${carousel.topic}` : null,
    "",
    slides,
    "",
    "LÉGENDE",
    carousel.caption,
    "",
    "HASHTAGS",
    carousel.hashtags.join(" "),
  ]
    .filter((line) => line !== null)
    .join("\n");
}
