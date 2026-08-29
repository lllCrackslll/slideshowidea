import type { LegalSection } from "./types";

export const PRIVACY_UPDATED = "29 août 2026";

export const PRIVACY_INTRO =
  "Cette politique explique comment carrousels.studio (« nous ») traite les informations lorsque tu utilises notre application web. Nous privilégions le traitement local dans ton navigateur autant que possible.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. Données que nous traitons",
    paragraphs: [
      "Données de campagne : noms de campagnes, comptes TikTok configurés, légendes, paramètres de publication et métadonnées associées.",
      "Médias : images et vidéos que tu importes ou génères, stockées principalement dans ton navigateur (localStorage et IndexedDB).",
      "Données techniques : préférences d'affichage (thème clair/sombre), étape du parcours et journaux techniques minimaux en cas d'erreur.",
      "Données TikTok : si tu connectes un compte, nous pouvons recevoir un identifiant, un nom d'affichage, un avatar et un jeton d'accès OAuth nécessaire à la publication, conformément aux autorisations accordées.",
    ],
  },
  {
    title: "2. Où sont stockées les données",
    paragraphs: [
      "La majorité des données reste sur ton appareil, dans le stockage local du navigateur.",
      "Certaines requêtes d'import TikTok peuvent transiter par nos serveurs pour récupérer des métadonnées ou des images depuis une URL que tu fournis.",
      "Les jetons OAuth TikTok, lorsqu'ils sont utilisés, doivent être stockés côté serveur de manière sécurisée et ne servir qu'aux actions que tu demandes.",
    ],
  },
  {
    title: "3. Finalités",
    paragraphs: [
      "Fournir les fonctionnalités du Service (import, clean, export, publication, planification locale).",
      "Mémoriser tes préférences et l'état de tes campagnes sur ton appareil.",
      "Sécuriser le Service, corriger des bugs et respecter nos obligations légales.",
    ],
  },
  {
    title: "4. Base légale (UE/EEE)",
    paragraphs: [
      "Exécution du service que tu demandes, intérêt légitime à améliorer et sécuriser l'application, et respect d'obligations légales le cas échéant.",
      "Pour OAuth TikTok, le traitement repose sur ton consentement explicite lors de la connexion du compte.",
    ],
  },
  {
    title: "5. Partage avec des tiers",
    paragraphs: [
      "Nous ne vendons pas tes données personnelles.",
      "Des données peuvent être transmises à TikTok lorsque tu choisis de publier ou connecter un compte, ainsi qu'à des prestataires techniques strictement nécessaires à l'hébergement ou à la sécurité du Service.",
    ],
  },
  {
    title: "6. Durée de conservation",
    paragraphs: [
      "Les données locales restent sur ton appareil jusqu'à ce que tu les supprimes ou effaces les données du site dans ton navigateur.",
      "Les jetons OAuth et journaux serveur sont conservés le temps nécessaire au fonctionnement du Service et à la sécurité, puis supprimés ou anonymisés.",
    ],
  },
  {
    title: "7. Tes droits",
    paragraphs: [
      "Selon ta juridiction, tu peux demander l'accès, la rectification, l'effacement, la limitation ou t'opposer à certains traitements.",
      "Pour exercer tes droits : contact@carrousels.studio. Tu peux aussi supprimer les données locales via les paramètres de ton navigateur.",
    ],
  },
  {
    title: "8. Cookies et stockage local",
    paragraphs: [
      "Nous n'utilisons pas de cookies publicitaires. Le stockage local sert uniquement au fonctionnement du Service (préférences, campagnes, médias).",
    ],
  },
  {
    title: "9. Sécurité",
    paragraphs: [
      "Nous mettons en place des mesures raisonnables pour protéger les données transitant par nos serveurs. Aucune méthode de transmission ou de stockage n'est toutefois totalement infaillible.",
    ],
  },
  {
    title: "10. Modifications",
    paragraphs: [
      "Nous pouvons mettre à jour cette politique. La date en haut de page indique la dernière révision.",
    ],
  },
  {
    title: "11. Contact",
    paragraphs: ["contact@carrousels.studio"],
  },
];
