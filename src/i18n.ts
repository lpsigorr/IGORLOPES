import { DEFAULT_LANG, LANGS, type Lang } from "./config";

/** A piece of text in each language. English is required; French and Dutch fall back to English until translated. */
export type L = { en: string; fr?: string; nl?: string };

export function tx(text: L | string | undefined, lang: Lang): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text[lang] ?? text.en;
}

export function isLang(v: string | undefined): v is Lang {
  return !!v && (LANGS as readonly string[]).includes(v);
}

export function langPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

// Interface text. Translations for FR and NL come after the look is picked.
const ui = {
  "skip": { en: "Skip to content", fr: "Aller au contenu", nl: "Naar de inhoud" },
  "nav.work": { en: "Work", fr: "Projets", nl: "Projecten" },
  "nav.lab": { en: "Lab", fr: "Lab", nl: "Lab" },
  "nav.about": { en: "About", fr: "À propos", nl: "Over" },
  "nav.contact": { en: "Contact", fr: "Contact", nl: "Contact" },
  "nav.home": { en: "Igor Lopes, home", fr: "Igor Lopes, accueil", nl: "Igor Lopes, home" },
  "nav.lang": { en: "Language", fr: "Langue", nl: "Taal" },
  "nav.menu": { en: "Menu", fr: "Menu", nl: "Menu" },

  "meta.home": {
    en: "Igor Lopes Oliveira, creative technologist in Brussels. Design, code, video, motion and prototyping in the same hands.",
    fr: "Igor Lopes Oliveira, creative technologist à Bruxelles. Design, code, vidéo, motion et prototypage dans les mêmes mains.",
    nl: "Igor Lopes Oliveira, creative technologist in Brussel. Design, code, video, motion en prototyping in één paar handen.",
  },

  "hero.line": {
    en: "Design, code, video, motion and prototyping in the same hands.",
    fr: "Design, code, vidéo, motion et prototypage dans les mêmes mains.",
    nl: "Design, code, video, motion en prototyping in één paar handen.",
  },
  "hero.scroll": { en: "Scroll", fr: "Défiler", nl: "Scroll" },
  "hero.langs": {
    en: "Works in French, Dutch, English and Portuguese",
    fr: "Travaille en français, néerlandais, anglais et portugais",
    nl: "Werkt in het Frans, Nederlands, Engels en Portugees",
  },
  "hero.title": { en: "Creative Technologist", fr: "Creative Technologist", nl: "Creative Technologist" },
  "city": { en: "Brussels", fr: "Bruxelles", nl: "Brussel" },

  "words": { en: "Direction|Identity|Code|Film|Objects", fr: "Direction|Identité|Code|Film|Objets", nl: "Regie|Identiteit|Code|Film|Objecten" },
  "outro.title": { en: "A studio of one.", fr: "Un studio à une personne.", nl: "Een studio van één." },
  "outro.text": {
    en: "Direction, identity, code, film and objects. One person behind every credit on this site.",
    fr: "Direction, identité, code, film et objets. Une seule personne derrière chaque crédit de ce site.",
    nl: "Regie, identiteit, code, film en objecten. Eén persoon achter elke credit op deze site.",
  },

  "work.title": { en: "Selected work", fr: "Projets choisis", nl: "Geselecteerd werk" },
  "work.count": { en: "{n} projects", fr: "{n} projets", nl: "{n} projecten" },
  "work.open": { en: "Open", fr: "Ouvrir", nl: "Open" },
  "work.all": { en: "All work", fr: "Tous les projets", nl: "Alle projecten" },

  "lab.title": { en: "Lab", fr: "Lab", nl: "Lab" },
  "lab.lead": {
    en: "Experiments, small sites, motion and brands made for the fun of it.",
    fr: "Des expériences, des petits sites, du motion et des marques, faits pour le plaisir.",
    nl: "Experimenten, kleine websites, motion en merken, gemaakt voor de lol.",
  },
  "lab.visit": { en: "Visit", fr: "Voir", nl: "Bekijk" },
  "lab.watch": { en: "Watch", fr: "Regarder", nl: "Kijk" },

  "about.title": { en: "About", fr: "À propos", nl: "Over" },
  "about.short1": {
    en: "Igor Lopes Oliveira, creative technologist. Born and raised in Brussels.",
    fr: "Igor Lopes Oliveira, creative technologist. Né et élevé à Bruxelles.",
    nl: "Igor Lopes Oliveira, creative technologist. Geboren en getogen in Brussel.",
  },
  "about.short2": {
    en: "Design, code, video, motion and prototyping in the same hands, so nothing gets lost between the idea and the result.",
    fr: "Design, code, vidéo, motion et prototypage dans les mêmes mains : rien ne se perd entre l'idée et le résultat.",
    nl: "Design, code, video, motion en prototyping in één paar handen, zodat er niets verloren gaat tussen het idee en het resultaat.",
  },
  "about.more": { en: "More about Igor", fr: "En savoir plus sur Igor", nl: "Meer over Igor" },

  "cta.text": {
    en: "Working on something that needs design, code, film or a physical object? Send a brief.",
    fr: "Un projet qui demande du design, du code, du film ou un objet physique ? Envoyez un brief.",
    nl: "Werkt u aan iets dat design, code, film of een fysiek object nodig heeft? Stuur een briefing.",
  },
  "cta.button": { en: "Send a brief", fr: "Envoyer un brief", nl: "Stuur een briefing" },

  "case.brief": { en: "The brief", fr: "Le brief", nl: "De briefing" },
  "case.credits": { en: "Credits", fr: "Crédits", nl: "Credits" },
  "case.client": { en: "Client", fr: "Client", nl: "Klant" },
  "case.next": { en: "Next project", fr: "Projet suivant", nl: "Volgend project" },
  "case.visit": { en: "Visit the site", fr: "Voir le site", nl: "Bekijk de website" },
  "case.watch": { en: "Watch the film", fr: "Voir le film", nl: "Bekijk de film" },

  "contact.title": { en: "Send a brief", fr: "Envoyer un brief", nl: "Stuur een briefing" },
  "contact.lead": {
    en: "A few lines are enough. Igor answers personally, in French, Dutch, English or Portuguese.",
    fr: "Quelques lignes suffisent. Igor répond lui-même, en français, néerlandais, anglais ou portugais.",
    nl: "Een paar regels volstaan. Igor antwoordt zelf, in het Frans, Nederlands, Engels of Portugees.",
  },
  "f.name": { en: "Your name", fr: "Votre nom", nl: "Uw naam" },
  "f.email": { en: "Email", fr: "E-mail", nl: "E-mail" },
  "f.company": { en: "Studio or company (optional)", fr: "Studio ou entreprise (facultatif)", nl: "Studio of bedrijf (optioneel)" },
  "f.topic": { en: "What is it about?", fr: "De quoi s'agit-il ?", nl: "Waarover gaat het?" },
  "f.topic.design": { en: "Direction and identity", fr: "Direction et identité", nl: "Regie en identiteit" },
  "f.topic.web": { en: "Web and code", fr: "Web et code", nl: "Web en code" },
  "f.topic.film": { en: "Film and motion", fr: "Film et motion", nl: "Film en motion" },
  "f.topic.objects": { en: "Physical products and installations", fr: "Produits physiques et installations", nl: "Fysieke producten en installaties" },
  "f.topic.unsure": { en: "Not sure yet", fr: "Je ne sais pas encore", nl: "Weet ik nog niet" },
  "f.message": { en: "The brief", fr: "Le brief", nl: "De briefing" },
  "f.send": { en: "Send", fr: "Envoyer", nl: "Versturen" },
  "f.privacy": {
    en: "Your details are only used to answer you.",
    fr: "Vos informations servent uniquement à vous répondre.",
    nl: "Uw gegevens worden alleen gebruikt om u te antwoorden.",
  },
  "status.sending": { en: "Sending...", fr: "Envoi en cours...", nl: "Bezig met verzenden..." },
  "status.ok": { en: "Thank you. Igor will get back to you soon.", fr: "Merci. Igor vous répond très vite.", nl: "Bedankt. Igor antwoordt u zo snel mogelijk." },
  "status.error": {
    en: "The message did not go through. Please try again in a moment.",
    fr: "Le message n'est pas parti. Réessayez dans un instant.",
    nl: "Het bericht is niet verzonden. Probeer het zo meteen opnieuw.",
  },
  "status.notready": { en: "The form is not connected yet.", fr: "Le formulaire n'est pas encore connecté.", nl: "Het formulier is nog niet gekoppeld." },

  "footer.where": { en: "Igor Lopes Oliveira, Brussels", fr: "Igor Lopes Oliveira, Bruxelles", nl: "Igor Lopes Oliveira, Brussel" },
  "footer.top": { en: "Back to top", fr: "Haut de page", nl: "Naar boven" },
  "notfound.title": { en: "Nothing here.", fr: "Rien ici.", nl: "Hier is niets." },
  "notfound.back": { en: "Back home", fr: "Retour à l'accueil", nl: "Terug naar home" },

  "about.k.disciplines": { en: "Disciplines", fr: "Disciplines", nl: "Disciplines" },
  "about.v.disciplines": {
    en: "Creative direction, brand identity, web and code, video and motion, physical prototyping",
    fr: "Direction créative, identité de marque, web et code, vidéo et motion, prototypage physique",
    nl: "Creatieve regie, merkidentiteit, web en code, video en motion, fysieke prototyping",
  },
  "about.k.tools": { en: "Tools", fr: "Outils", nl: "Tools" },
  "about.k.languages": { en: "Languages", fr: "Langues", nl: "Talen" },
  "about.v.languages": {
    en: "Portuguese, French, Dutch, English.",
    fr: "Portugais, français, néerlandais, anglais.",
    nl: "Portugees, Frans, Nederlands, Engels.",
  },
  "about.k.experience": { en: "Experience", fr: "Expérience", nl: "Ervaring" },
  "about.v.experience": {
    en: "Digital all-rounder, IT and digitalization, FB Logistics group, 2026",
    fr: "Digital all-rounder, IT et digitalisation, groupe FB Logistics, 2026",
    nl: "Digital all-rounder, IT en digitalisering, FB Logistics-groep, 2026",
  },
  "about.k.education": { en: "Education", fr: "Formation", nl: "Opleiding" },
  "about.v.education": {
    en: "Multimedia and Creative Technology, Erasmushogeschool Brussel",
    fr: "Multimedia and Creative Technology, Erasmushogeschool Brussel",
    nl: "Multimedia and Creative Technology, Erasmushogeschool Brussel",
  },
  "about.k.based": { en: "Based in", fr: "Basé à", nl: "Gevestigd in" },
  "about.v.based": { en: "Brussels, Belgium", fr: "Bruxelles, Belgique", nl: "Brussel, België" },
} satisfies Record<string, L>;

export type UIKey = keyof typeof ui;

export function t(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  let s = tx(ui[key], lang);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace("{" + k + "}", String(v));
  return s;
}

export const LANG_NAMES: Record<Lang, string> = { en: "EN", fr: "FR", nl: "NL" };
export { DEFAULT_LANG };
