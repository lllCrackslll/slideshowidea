import type { LegalSection } from "./types";

export const TERMS_UPDATED = "29 août 2026";

export const TERMS_INTRO =
  "Les présentes conditions régissent l'utilisation de carrousels.studio (« le Service »), une application web destinée aux créateurs qui préparent et publient des carrousels et vidéos TikTok. En utilisant le Service, tu acceptes ces conditions.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. Objet du Service",
    paragraphs: [
      "carrousels.studio propose des outils d'import, de préparation, de nettoyage et de publication de contenus pour TikTok, ainsi que des utilitaires associés (repurpose vidéo, export ZIP, planification locale).",
      "Le Service est fourni « en l'état ». Nous ne garantissons pas l'accès permanent à TikTok, à son API, ni le succès de tes publications.",
    ],
  },
  {
    title: "2. Éligibilité et compte",
    paragraphs: [
      "Tu dois avoir l'âge légal requis dans ton pays et être autorisé à utiliser TikTok selon ses propres conditions.",
      "Tu es responsable de la confidentialité de ton appareil et des données stockées localement dans ton navigateur.",
    ],
  },
  {
    title: "3. Contenu et responsabilités",
    paragraphs: [
      "Tu restes seul responsable des contenus que tu importes, modifies, publies ou programmes via le Service.",
      "Tu garantis disposer des droits nécessaires sur les médias utilisés et respecter les Conditions d'utilisation de TikTok, les lois sur la propriété intellectuelle et la publicité.",
      "Il est interdit d'utiliser le Service pour du spam, de la contrefaçon, du contenu illicite ou une automatisation abusive contraire aux règles de TikTok.",
    ],
  },
  {
    title: "4. TikTok et services tiers",
    paragraphs: [
      "Certaines fonctionnalités peuvent s'appuyer sur TikTok ou d'autres services tiers. Leur disponibilité, leurs limites et leurs règles d'audit relèvent exclusivement de ces tiers.",
      "Si tu connectes un compte TikTok, tu autorises le Service à agir dans les limites des autorisations que tu accordes via OAuth.",
    ],
  },
  {
    title: "5. Propriété intellectuelle",
    paragraphs: [
      "Le Service, sa marque, son interface et son code restent notre propriété ou celle de nos concédants.",
      "Tu conserves tous les droits sur tes contenus. Tu nous accordes uniquement les droits techniques nécessaires pour faire fonctionner le Service sur ton appareil ou, le cas échéant, transmettre un contenu à TikTok à ta demande.",
    ],
  },
  {
    title: "6. Limitation de responsabilité",
    paragraphs: [
      "Dans les limites autorisées par la loi, nous déclinons toute responsabilité pour les pertes indirectes, la perte de revenus, de données, de comptes TikTok ou de visibilité liées à l'utilisation du Service.",
      "Tu utilises le Service à tes propres risques, notamment en ce qui concerne les sanctions ou restrictions pouvant être appliquées par TikTok.",
    ],
  },
  {
    title: "7. Suspension",
    paragraphs: [
      "Nous pouvons suspendre ou limiter l'accès au Service en cas d'usage frauduleux, illégal ou contraire à ces conditions, sans préavis lorsque la loi l'autorise.",
    ],
  },
  {
    title: "8. Modifications",
    paragraphs: [
      "Nous pouvons mettre à jour ces conditions. La date de dernière mise à jour sera indiquée en haut de cette page. La poursuite de l'utilisation vaut acceptation des nouvelles conditions.",
    ],
  },
  {
    title: "9. Contact",
    paragraphs: ["Pour toute question : contact@carrousels.studio"],
  },
];
