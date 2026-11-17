// Every project on the site lives here. To add one: copy an entry, change the text, drop the images in public/media/<slug>/.
// Only facts Igor gave. Each text is { en, fr, nl }; a missing language falls back to English.
import type { L } from "../i18n";

export type Img = { src: string; alt: L }; // sizes come from src/data/media.json
export type Screen = Img & { frame: "browser" | "phone"; url?: string };
export type Video = { src: string; poster: string; w: number; h: number; label: L };

export type Block =
  | { type: "lead"; line: L; text?: L }
  | { type: "images"; layout: "two" | "three" | "four" | "wide" | "tall-pair" | "flats" | "screens"; items: Img[]; caption?: L; paper?: boolean }
  | { type: "screens"; layout: "one" | "two" | "three" | "pair"; items: Screen[]; caption?: L }
  | { type: "films"; items: Video[]; caption?: L }
  | { type: "colors"; items: { name: L; hex: string }[] }
  | { type: "specimen"; text: string; font: "star"; color?: string }
  | { type: "quote"; text: string }
  | { type: "label"; text: L }
  | { type: "points"; items: { title: L; text: L }[] }
  | { type: "stats"; items: { num: L | string; label: L }[]; note?: L };

export type Project = {
  slug: string;
  name: string;
  kind: "case" | "lab";
  where: L; // one line: what it is
  roles: L; // short list for the index
  cover?: Img; // image for lists and previews (none = a typographic tile)
  heroWhole?: boolean; // the opening picture is never cropped to fill the screen (boards with text on them)
  coverBg?: string; // the cover's own background colour: it is shown whole on it, in the lab grid and at the top of its page
  preview?: { video?: string; image?: string; stat?: { num: string; label: L } };
  // Case study page
  hero?: { video?: string; poster?: string; image?: Img; nameFont?: "star" };
  tag?: L;
  place?: L;
  credits?: { role: L; name?: string }[]; // name defaults to Igor
  client?: L;
  links?: { label: L; href: string }[];
  blocks?: Block[];
  end?: L;
  footnote?: L;
  // Lab entries
  link?: { label: "visit" | "watch"; href: string };
};

const IGOR = "Igor Lopes Oliveira";
export const CREDIT_NAME = IGOR;

const i = (src: string, alt: L): Img => ({ src, alt });
const web = (src: string, alt: L, url: string): Screen => ({ src, alt, frame: "browser", url });
const phone = (src: string, alt: L): Screen => ({ src, alt, frame: "phone" });

const BRUSSELS: L = { en: "Brussels", fr: "Bruxelles", nl: "Brussel" };

export const projects: Project[] = [
  {
    slug: "star",
    name: "STAR",
    kind: "case",
    where: { en: "Streetwear collection, Tokyo. With and for YF Agency.", fr: "Collection streetwear, Tokyo. Avec et pour YF Agency.", nl: "Streetwearcollectie, Tokio. Met en voor YF Agency." },
    roles: { en: "Direction, identity, typeface, film", fr: "Direction, identité, typographie, film", nl: "Regie, identiteit, lettertype, film" },
    cover: i("star/loop-poster.webp", { en: "Still from the STAR brand film", fr: "Image du film de marque STAR", nl: "Beeld uit de STAR-merkfilm" }),
    preview: { video: "star/loop.mp4", image: "star/loop-poster.webp" },
    hero: { video: "star/loop.mp4", poster: "star/loop-poster.webp", nameFont: "star" },
    tag: { en: "Creative direction, identity and film", fr: "Direction créative, identité et film", nl: "Creatieve regie, identiteit en film" },
    place: { en: "Tokyo", fr: "Tokyo", nl: "Tokio" },
    client: { en: "With and for YF Agency", fr: "Avec et pour YF Agency", nl: "Met en voor YF Agency" },
    credits: [
      { role: { en: "Creative direction", fr: "Direction créative", nl: "Creatieve regie" } },
      { role: { en: "Identity and logos", fr: "Identité et logos", nl: "Identiteit en logo's" } },
      { role: { en: "Typeface", fr: "Police de caractères", nl: "Lettertype" } },
      { role: { en: "Collection design", fr: "Design de la collection", nl: "Ontwerp van de collectie" } },
      { role: { en: "2D and 3D mockups", fr: "Mockups 2D et 3D", nl: "2D- en 3D-mockups" } },
      { role: { en: "Brand film", fr: "Film de marque", nl: "Merkfilm" } },
      { role: { en: "Photography, Tokyo", fr: "Photographie, Tokyo", nl: "Fotografie, Tokio" } },
      { role: { en: "Campaign visuals, AI-directed", fr: "Visuels de campagne, dirigés avec l'IA", nl: "Campagnebeelden, geregisseerd met AI" } },
    ],
    blocks: [
      { type: "lead",
        line: { en: "A streetwear collection born in a sketchbook, in Tokyo.", fr: "Une collection streetwear née dans un carnet, à Tokyo.", nl: "Een streetwearcollectie die begon in een schetsboek, in Tokio." },
        text: { en: "A doctrine, a hand-drawn typeface, a collection and a film, for those who move forward their own way.", fr: "Une doctrine, une police faite main, une collection et un film, pour celles et ceux qui avancent à leur façon.", nl: "Een doctrine, een handgetekend lettertype, een collectie en een film, voor wie op zijn eigen manier vooruitgaat." } },
      { type: "quote", text: "STAR isn't just clothing, it's direction. A symbol for those building in silence and shining on purpose." },
      { type: "specimen", text: "A STAR IS BORN IN TOKYO", font: "star", color: "#DE1F26" },
      { type: "colors", items: [
        { name: { en: "Black", fr: "Noir", nl: "Zwart" }, hex: "#1A1B1B" },
        { name: { en: "Red", fr: "Rouge", nl: "Rood" }, hex: "#DE1F26" },
        { name: { en: "White", fr: "Blanc", nl: "Wit" }, hex: "#F1F2F2" },
      ] },
      { type: "images", layout: "three", paper: true, items: [
        i("star/alphabet.webp", { en: "The STAR alphabet, A to Z and 0 to 9", fr: "L'alphabet STAR, de A à Z et de 0 à 9", nl: "Het STAR-alfabet, van A tot Z en van 0 tot 9" }),
        i("star/assets.webp", { en: "STAR logos and symbols", fr: "Logos et symboles de STAR", nl: "Logo's en symbolen van STAR" }),
        i("star/poster.webp", { en: "STAR poster: the star with teeth in an explosion of red and black stars", fr: "Affiche STAR : l'étoile avec des dents au centre d'une explosion d'étoiles rouges et noires", nl: "STAR-affiche: de ster met tanden in het midden van een explosie van rode en zwarte sterren" }),
      ], caption: { en: "The identity: a hand-drawn alphabet turned into a typeface, symbols and three colours.", fr: "L'identité : un alphabet dessiné à la main devenu police, des symboles et trois couleurs.", nl: "De identiteit: een handgetekend alfabet dat een lettertype werd, symbolen en drie kleuren." } },
      { type: "images", layout: "flats", items: [
        i("star/flat-jersey-black-red-front.webp", { en: "Black and red shirt, front", fr: "Maillot noir et rouge, devant", nl: "Zwart-rood shirt, voorkant" }),
        i("star/flat-jersey-black-red-back.webp", { en: "Black and red shirt, back", fr: "Maillot noir et rouge, dos", nl: "Zwart-rood shirt, achterkant" }),
        i("star/flat-jersey-red-white-front.webp", { en: "Red and white shirt", fr: "Maillot rouge et blanc", nl: "Rood-wit shirt" }),
        i("star/flat-layered-tee-back.webp", { en: "Layered tee, back", fr: "T-shirt superposé, dos", nl: "Gelaagd T-shirt, achterkant" }),
        i("star/flat-layered-tee-front.webp", { en: "Layered tee, front", fr: "T-shirt superposé, devant", nl: "Gelaagd T-shirt, voorkant" }),
        i("star/flat-tee-a-star-is-born.webp", { en: "A Star Is Born In Tokyo tee", fr: "T-shirt A Star Is Born In Tokyo", nl: "T-shirt A Star Is Born In Tokyo" }),
        i("star/flat-tee-tokyo-tower.webp", { en: "Tokyo Tower tee", fr: "T-shirt Tokyo Tower", nl: "T-shirt Tokyo Tower" }),
        i("star/flat-tee-hand.webp", { en: "Hand and star tee", fr: "T-shirt main et étoile", nl: "T-shirt hand en ster" }),
        i("star/flat-tee-star-drip.webp", { en: "STAR tee", fr: "T-shirt STAR", nl: "T-shirt STAR" }),
        i("star/flat-tee-poster-black.webp", { en: "Poster tee", fr: "T-shirt affiche", nl: "T-shirt affiche" }),
        i("star/flat-hoodie-jeans-a-star-is-born.webp", { en: "Hoodie and jeans", fr: "Hoodie et jean", nl: "Hoodie en jeans" }),
        i("star/flat-beanie-red-star.webp", { en: "Star beanie", fr: "Bonnet étoile", nl: "Muts met ster" }),
        i("star/flat-tote.webp", { en: "Tote bag", fr: "Tote bag", nl: "Tote bag" }),
        i("star/flat-belt-buckle-red-star.webp", { en: "STAR belt", fr: "Ceinture STAR", nl: "STAR-riem" }),
      ], caption: { en: "The collection: jerseys, tees, hoodie, jeans, beanie, belt and tote bag.", fr: "La collection : maillots, t-shirts, hoodie, jean, bonnet, ceinture et tote bag.", nl: "De collectie: shirts, T-shirts, hoodie, jeans, muts, riem en tote bag." } },
      { type: "images", layout: "four", items: [
        i("star/tokyo-night.webp", { en: "Tokyo at night, seen from Tokyo Tower", fr: "Tokyo la nuit, vu depuis la tour de Tokyo", nl: "Tokio 's nachts, gezien vanaf de Tokyo Tower" }),
        i("star/tokyo-tower.webp", { en: "Tokyo Tower lit up at night", fr: "La tour de Tokyo illuminée la nuit", nl: "De verlichte Tokyo Tower 's nachts" }),
        i("star/tokyo-shinjuku.webp", { en: "Shinjuku buildings seen from above", fr: "Immeubles de Shinjuku vus d'en haut", nl: "Gebouwen in Shinjuku van bovenaf" }),
        i("star/tokyo-vending.webp", { en: "In front of vending machines at night", fr: "Devant des distributeurs automatiques, la nuit", nl: "Voor drankautomaten, 's nachts" }),
      ], caption: { en: "Tokyo, on foot. Photos by Igor, 2025.", fr: "Tokyo, à pied. Photos d'Igor, 2025.", nl: "Tokio, te voet. Foto's van Igor, 2025." } },
      { type: "films", items: [
        { src: "star/film.mp4", poster: "star/film-poster.webp", w: 1280, h: 720, label: { en: "Brand film, 16:9", fr: "Film de marque, 16:9", nl: "Merkfilm, 16:9" } },
        { src: "star/social.mp4", poster: "star/social-poster.webp", w: 720, h: 1280, label: { en: "Social cut, 9:16", fr: "Version réseaux, 9:16", nl: "Versie voor sociale media, 9:16" } },
      ], caption: { en: "The brand film, and its cut for social media.", fr: "Le film de marque, et sa version pour les réseaux.", nl: "De merkfilm, en de versie voor sociale media." } },
      { type: "label", text: { en: "Campaign visualised with AI, from the original designs.", fr: "Campagne visualisée avec l'IA, à partir des designs originaux.", nl: "Campagne gevisualiseerd met AI, op basis van de originele ontwerpen." } },
      { type: "images", layout: "wide", items: [ i("star/city-shibuya.webp", { en: "STAR screen at the Shibuya crossing at night", fr: "Écran STAR au carrefour de Shibuya, la nuit", nl: "STAR-scherm aan het kruispunt van Shibuya, 's nachts" }) ] },
      { type: "images", layout: "tall-pair", items: [
        i("star/city-beach.webp", { en: "A girl in the hand and star tee, a guy seen from the back in the STAR hoodie and jeans, by the sea", fr: "Une fille en t-shirt main et étoile, un garçon de dos en hoodie et jean STAR, devant la mer", nl: "Een meisje in het T-shirt met hand en ster, een jongen op de rug in STAR-hoodie en -jeans, voor de zee" }),
        i("star/city-studio.webp", { en: "A guy in a black puffer jacket, red tee and STAR star beanie", fr: "Un garçon en doudoune noire, t-shirt rouge et bonnet étoile STAR", nl: "Een jongen in een zwarte donsjas, rood T-shirt en STAR-muts met ster" }),
      ] },
      { type: "images", layout: "two", items: [
        i("star/city-cage.webp", { en: "Four guys in a mesh cage, in STAR tees and beanie", fr: "Quatre garçons dans une cage grillagée, en t-shirts et bonnet STAR", nl: "Vier jongens in een kooi van gaas, in STAR-T-shirts en -muts" }),
        i("star/city-belt.webp", { en: "STAR belt on jeans, close up", fr: "Ceinture STAR sur un jean, en gros plan", nl: "STAR-riem op een jeans, van dichtbij" }),
      ] },
      { type: "images", layout: "wide", items: [ i("star/city-crossing.webp", { en: "The Shibuya crossing from above, with STAR on the big screen", fr: "Le carrefour de Shibuya vu d'en haut, avec STAR sur le grand écran", nl: "Het kruispunt van Shibuya van bovenaf, met STAR op het grote scherm" }) ] },
    ],
    end: { en: "From a sketchbook to a full collection.", fr: "D'un carnet à une collection complète.", nl: "Van een schetsboek naar een volledige collectie." },
    footnote: { en: "Published with the agreement of YF Agency. Base photos for the campaign: Unsplash, including Timo Volz and Louie Nicolo Nimor.", fr: "Publié avec l'accord de YF Agency. Photos de base de la campagne : Unsplash, dont Timo Volz et Louie Nicolo Nimor.", nl: "Gepubliceerd met akkoord van YF Agency. Basisfoto's van de campagne: Unsplash, onder meer Timo Volz en Louie Nicolo Nimor." },
  },
  {
    slug: "sparx",
    name: "SPARX",
    kind: "case",
    where: { en: "Smart punching bag. Own project.", fr: "Sac de frappe intelligent. Projet personnel.", nl: "Slimme bokszak. Eigen project." },
    roles: { en: "Product, electronics, app, identity", fr: "Produit, électronique, application, identité", nl: "Product, elektronica, app, identiteit" },
    cover: i("sparx/gym.webp", { en: "The SPARX bag in the corner of a boxing ring", fr: "Le sac SPARX dans le coin d'un ring de boxe", nl: "De SPARX-zak in de hoek van een boksring" }),
    preview: { image: "sparx/gym.webp" },
    hero: { image: i("sparx/gym.webp", { en: "The SPARX bag in the corner of a boxing ring, the name SPARX painted on the wall", fr: "Le sac SPARX dans le coin d'un ring de boxe, le nom SPARX peint sur le mur", nl: "De SPARX-zak in de hoek van een boksring, de naam SPARX op de muur" }) },
    tag: { en: "Product, app and identity", fr: "Produit, application et identité", nl: "Product, app en identiteit" },
    place: BRUSSELS,
    client: { en: "Own project", fr: "Projet personnel", nl: "Eigen project" },
    credits: [
      { role: { en: "Product concept", fr: "Concept produit", nl: "Productconcept" } },
      { role: { en: "Electronics: pressure sensors and ESP32", fr: "Électronique : capteurs de pression et ESP32", nl: "Elektronica: druksensoren en ESP32" } },
      { role: { en: "App: Node.js and React, runs locally", fr: "Application : Node.js et React, en local", nl: "App: Node.js en React, lokaal" } },
      { role: { en: "Interface", fr: "Interface", nl: "Interface" } },
      { role: { en: "Identity", fr: "Identité", nl: "Identiteit" } },
      { role: { en: "Magazine", fr: "Magazine", nl: "Magazine" } },
    ],
    links: [ { label: { en: "Watch the demo", fr: "Voir la démo", nl: "Bekijk de demo" }, href: "https://www.youtube.com/watch?v=4uoWzG7pNQU" } ],
    blocks: [
      { type: "lead",
        line: { en: "The training partner hidden in a punching bag.", fr: "Le partenaire d'entraînement caché dans un sac de frappe.", nl: "De trainingspartner verstopt in een bokszak." },
        text: { en: "Born during lockdown, when Igor trained alone with no way to know if his punches landed. A sensor sleeve, an app and a brand, built as a real product.", fr: "Né pendant le confinement, quand Igor s'entraînait seul sans savoir si ses coups touchaient. Une housse à capteurs, une application et une marque, pensées comme un vrai produit.", nl: "Ontstaan tijdens de lockdown, toen Igor alleen trainde zonder te weten of zijn slagen raak waren. Een hoes met sensoren, een app en een merk, bedacht als een echt product." } },
      { type: "images", layout: "wide", items: [ i("sparx/product.webp", { en: "The black SPARX sleeve with red zones, its strap and its box", fr: "La housse SPARX noire à zones rouges, avec sa sangle et son boîtier", nl: "De zwarte SPARX-hoes met rode zones, met riem en kastje" }) ] },
      { type: "points", items: [
        { title: { en: "See where you hit", fr: "Voir où l'on frappe", nl: "Zien waar je slaat" }, text: { en: "Every punch is logged on the zone it lands on.", fr: "Chaque coup est enregistré sur la zone touchée.", nl: "Elke slag wordt geregistreerd op de zone die je raakt." } },
        { title: { en: "Live count", fr: "Le compte en direct", nl: "Live tellen" }, text: { en: "Punches and pace show up while you train.", fr: "Coups et rythme s'affichent pendant l'effort.", nl: "Slagen en tempo verschijnen terwijl je traint." } },
        { title: { en: "Rounds that run themselves", fr: "Des rounds qui se gèrent seuls", nl: "Rondes die zichzelf regelen" }, text: { en: "Timer and sound cues, your eyes stay on the bag.", fr: "Minuteur et signaux sonores, les yeux restent sur le sac.", nl: "Timer en geluidssignalen, je ogen blijven op de zak." } },
        { title: { en: "No subscription", fr: "Sans abonnement", nl: "Zonder abonnement" }, text: { en: "Everything runs locally, on the phone.", fr: "Tout fonctionne en local, sur le téléphone.", nl: "Alles werkt lokaal, op de telefoon." } },
      ] },
      { type: "images", layout: "screens", items: [
        i("sparx/app-welcome.webp", { en: "App: welcome screen", fr: "Application : écran d'accueil", nl: "App: welkomstscherm" }),
        i("sparx/app-menu.webp", { en: "App: menu with free fight, mini-games and tutorial", fr: "Application : menu avec combat libre, mini-jeux et tutoriel", nl: "App: menu met vrij gevecht, minigames en tutorial" }),
        i("sparx/app-reflex.webp", { en: "App: reflex game asking for an uppercut", fr: "Application : jeu de réflexes qui demande un uppercut", nl: "App: reflexspel dat om een uppercut vraagt" }),
        i("sparx/app-scores.webp", { en: "App: fight scores", fr: "Application : scores du combat", nl: "App: scores van het gevecht" }),
      ], caption: { en: "The app: black and white, big words, readable mid-round.", fr: "L'application : noir et blanc, de gros mots, lisible en plein round.", nl: "De app: zwart-wit, grote woorden, leesbaar midden in een ronde." } },
      { type: "images", layout: "wide", items: [ i("sparx/mark-wordmark.webp", { en: "The SPARX logo", fr: "Le logo SPARX", nl: "Het SPARX-logo" }) ] },
      { type: "colors", items: [
        { name: { en: "Red", fr: "Rouge", nl: "Rood" }, hex: "#ED1C23" },
        { name: { en: "Black", fr: "Noir", nl: "Zwart" }, hex: "#1A1A1A" },
        { name: { en: "Cream", fr: "Crème", nl: "Crème" }, hex: "#FAFAF0" },
      ] },
      { type: "images", layout: "three", items: [
        i("sparx/mag-cover.webp", { en: "Cover of the SPARX magazine", fr: "Couverture du magazine SPARX", nl: "Cover van het SPARX-magazine" }),
        i("sparx/mag-features.webp", { en: "Magazine page: the audience and the features", fr: "Page du magazine : le public et les fonctions", nl: "Pagina uit het magazine: het publiek en de functies" }),
        i("sparx/mag-boxing.webp", { en: "Magazine page: We love boxing", fr: "Page du magazine : We love boxing", nl: "Pagina uit het magazine: We love boxing" }),
      ], caption: { en: "The brand: a name that hits, a boxer, three colours and a 40-page magazine.", fr: "La marque : un nom qui claque, un boxeur, trois couleurs et un magazine de 40 pages.", nl: "Het merk: een naam die knalt, een bokser, drie kleuren en een magazine van 40 pagina's." } },
    ],
    end: { en: "A working prototype, tested in the ring.", fr: "Un prototype qui fonctionne, testé sur le ring.", nl: "Een werkend prototype, getest in de ring." },
  },
  {
    slug: "number-one",
    name: "Number One",
    kind: "case",
    where: { en: "Express delivery brand of the FB Logistics group.", fr: "Marque de livraison express du groupe FB Logistics.", nl: "Expresleveringsmerk van de FB Logistics-groep." },
    roles: { en: "Website, quote calculator, fleet photography", fr: "Site web, calculateur de devis, photos de la flotte", nl: "Website, offertecalculator, foto's van de vloot" },
    cover: i("numberone/site-home.webp", { en: "Number One website, home page", fr: "Site Number One, page d'accueil", nl: "Website van Number One, homepage" }),
    preview: { image: "numberone/site-home.webp" },
    hero: { image: i("numberone/numberone-1.webp", { en: "FB Logistics trucks at the loading docks", fr: "Camions FB Logistics aux quais de chargement", nl: "Vrachtwagens van FB Logistics aan de laadkaaien" }) },
    tag: { en: "Website, tools and photography", fr: "Site web, outils et photographie", nl: "Website, tools en fotografie" },
    place: { en: "Machelen", fr: "Machelen", nl: "Machelen" },
    client: { en: "In-house at the FB Logistics group, 2026", fr: "En interne au sein du groupe FB Logistics, 2026", nl: "Intern bij de FB Logistics-groep, 2026" },
    credits: [
      { role: { en: "Website, FR, NL and EN", fr: "Site web, FR, NL et EN", nl: "Website, FR, NL en EN" } },
      { role: { en: "Quote calculator", fr: "Calculateur de devis", nl: "Offertecalculator" } },
      { role: { en: "Group page for both brands", fr: "Page du groupe pour les deux marques", nl: "Groepspagina voor beide merken" } },
      { role: { en: "Fleet photography", fr: "Photos de la flotte", nl: "Foto's van de vloot" } },
      { role: { en: "Email automation prototype", fr: "Prototype d'automatisation des e-mails", nl: "Prototype voor e-mailautomatisering" } },
      { role: { en: "Driver app prototype", fr: "Prototype d'application pour les chauffeurs", nl: "Prototype van een chauffeursapp" } },
    ],
    links: [ { label: { en: "Visit the site", fr: "Voir le site", nl: "Bekijk de website" }, href: "https://lpsigorr.github.io/numberone_final/desktop.html" } ],
    blocks: [
      { type: "lead",
        line: { en: "From 1 gram to 30 tons.", fr: "De 1 gramme à 30 tonnes.", nl: "Van 1 gram tot 30 ton." },
        text: { en: "Number One is the express delivery brand of the FB Logistics group. As the first member of its new IT and digitalization department, Igor gave the brand a proper digital presence and practical tools for the team and for customers.", fr: "Number One est la marque de livraison express du groupe FB Logistics. Premier membre du nouveau département IT et digitalisation, Igor a donné à la marque une vraie présence en ligne et des outils pratiques pour l'équipe et pour les clients.", nl: "Number One is het expresleveringsmerk van de FB Logistics-groep. Als eerste lid van de nieuwe afdeling IT en digitalisering gaf Igor het merk een echte online aanwezigheid en praktische tools voor het team en voor klanten." } },
      { type: "screens", layout: "pair", items: [
        phone("numberone/mobile-home.webp", { en: "Number One website on a phone", fr: "Le site Number One sur téléphone", nl: "De website van Number One op een telefoon" }),
        web("numberone/site-home.webp", { en: "Number One website, home page", fr: "Site Number One, page d'accueil", nl: "Website van Number One, homepage" }, "lpsigorr.github.io/numberone_final"),
      ], caption: { en: "One site for phone and desktop, in French, Dutch and English.", fr: "Un site pour téléphone et ordinateur, en français, néerlandais et anglais.", nl: "Eén website voor telefoon en computer, in het Frans, Nederlands en Engels." } },
      { type: "screens", layout: "two", items: [
        web("numberone/site-services.webp", { en: "Services section", fr: "Section services", nl: "Sectie diensten" }, "lpsigorr.github.io/numberone_final/#services"),
        web("numberone/site-process.webp", { en: "The process in three steps: reception, preparation, delivery", fr: "Le processus en trois étapes : réception, préparation, livraison", nl: "Het proces in drie stappen: ontvangst, voorbereiding, levering" }, "lpsigorr.github.io/numberone_final/#process"),
      ] },
      { type: "screens", layout: "one", items: [
        web("numberone/site-fleet.webp", { en: "The fleet: pick a vehicle and see what it carries", fr: "La flotte : choisissez un véhicule et voyez ce qu'il transporte", nl: "De vloot: kies een voertuig en zie wat het vervoert" }, "lpsigorr.github.io/numberone_final/#fleet"),
      ] },
      { type: "label", text: { en: "The quote calculator", fr: "Le calculateur de devis", nl: "De offertecalculator" } },
      { type: "screens", layout: "three", items: [
        web("numberone/calc-1.webp", { en: "Calculator step 1: pricing mode", fr: "Calculateur, étape 1 : mode de tarification", nl: "Calculator, stap 1: tariefmodus" }, "lpsigorr.github.io/numberone_final/calc"),
        web("numberone/calc-2.webp", { en: "Calculator step 2: shipment details", fr: "Calculateur, étape 2 : détails de l'envoi", nl: "Calculator, stap 2: details van de zending" }, "lpsigorr.github.io/numberone_final/calc"),
        web("numberone/calc-3.webp", { en: "Calculator step 3: recommended vehicle", fr: "Calculateur, étape 3 : véhicule recommandé", nl: "Calculator, stap 3: aanbevolen voertuig" }, "lpsigorr.github.io/numberone_final/calc"),
        web("numberone/calc-4.webp", { en: "Calculator step 4: operational supplements", fr: "Calculateur, étape 4 : suppléments opérationnels", nl: "Calculator, stap 4: operationele toeslagen" }, "lpsigorr.github.io/numberone_final/calc"),
        web("numberone/calc-5.webp", { en: "Calculator step 5: fuel and VAT", fr: "Calculateur, étape 5 : carburant et TVA", nl: "Calculator, stap 5: brandstof en btw" }, "lpsigorr.github.io/numberone_final/calc"),
        web("numberone/calc-summary.webp", { en: "Calculator: the quote summary", fr: "Calculateur : le récapitulatif du devis", nl: "Calculator: het overzicht van de offerte" }, "lpsigorr.github.io/numberone_final/calc"),
      ], caption: { en: "Five steps from the cargo to a price: the right vehicle is suggested, extras and fuel are added, and the quote can be printed or downloaded.", fr: "Cinq étapes de la marchandise au prix : le bon véhicule est proposé, les suppléments et le carburant s'ajoutent, et le devis s'imprime ou se télécharge.", nl: "Vijf stappen van de lading tot een prijs: het juiste voertuig wordt voorgesteld, toeslagen en brandstof komen erbij, en de offerte kan worden afgedrukt of gedownload." } },
      { type: "images", layout: "two", items: [
        i("numberone/numberone-2.webp", { en: "Number One delivery van", fr: "Camionnette de livraison Number One", nl: "Bestelwagen van Number One" }),
        i("numberone/numberone-3.webp", { en: "Number One truck", fr: "Camion Number One", nl: "Vrachtwagen van Number One" }),
      ], caption: { en: "The fleet and the loading docks, photographed by Igor.", fr: "La flotte et les quais de chargement, photographiés par Igor.", nl: "De vloot en de laadkaaien, gefotografeerd door Igor." } },
    ],
    end: { en: "A new digital presence, photos of the real fleet, a quote calculator and two prototypes to build on.", fr: "Une nouvelle présence en ligne, des photos de la vraie flotte, un calculateur de devis et deux prototypes sur lesquels construire.", nl: "Een nieuwe online aanwezigheid, foto's van de echte vloot, een offertecalculator en twee prototypes om op verder te bouwen." },
  },
  {
    slug: "prolux",
    name: "Prolux & Co",
    kind: "case",
    where: { en: "Roofer in Zaventem.", fr: "Couvreur à Zaventem.", nl: "Dakwerker in Zaventem." },
    roles: { en: "Website FR and NL, Google Ads, visit tracking", fr: "Site FR et NL, Google Ads, suivi des visites", nl: "Website FR en NL, Google Ads, bezoekersmeting" },
    cover: i("prolux/site-home-fr.webp", { en: "Prolux website, home page", fr: "Site Prolux, page d'accueil", nl: "Website van Prolux, homepage" }),
    preview: { image: "prolux/site-home-fr.webp" },
    tag: { en: "Website, Google Ads and tracking", fr: "Site web, Google Ads et suivi", nl: "Website, Google Ads en meting" },
    place: { en: "Zaventem", fr: "Zaventem", nl: "Zaventem" },
    client: { en: "Prolux & Co SRL", fr: "Prolux & Co SRL", nl: "Prolux & Co SRL" },
    credits: [
      { role: { en: "Website, FR and NL", fr: "Site web, FR et NL", nl: "Website, FR en NL" } },
      { role: { en: "Google Ads", fr: "Google Ads", nl: "Google Ads" } },
      { role: { en: "Visit tracking", fr: "Suivi des visites", nl: "Bezoekersmeting" } },
    ],
    links: [ { label: { en: "Visit the site", fr: "Voir le site", nl: "Bekijk de website" }, href: "https://proluxtoiture.be/" } ],
    blocks: [
      { type: "lead",
        line: { en: "A roofing problem? Sorted.", fr: "Un problème de toiture ? On s'en occupe.", nl: "Een probleem met uw dak? Wij regelen het." },
        text: { en: "A French and Dutch website, Google Ads and visit tracking for a new roofing company. Services named as problems, the phone one tap away.", fr: "Un site en français et en néerlandais, Google Ads et suivi des visites pour une nouvelle société de toiture. Les services nommés comme des problèmes, le téléphone à un clic.", nl: "Een website in het Frans en Nederlands, Google Ads en bezoekersmeting voor een nieuw dakbedrijf. Diensten benoemd als problemen, de telefoon met één tik bereikbaar." } },
      { type: "screens", layout: "one", items: [
        web("prolux/site-home-fr.webp", { en: "Prolux website, home page in French", fr: "Site Prolux, page d'accueil en français", nl: "Website van Prolux, homepage in het Frans" }, "proluxtoiture.be"),
      ] },
      { type: "screens", layout: "pair", items: [
        phone("prolux/mobile-services.webp", { en: "Services picker on a phone", fr: "Le choix des services sur téléphone", nl: "De dienstenkeuze op een telefoon" }),
        web("prolux/site-services.webp", { en: "Services named as problems: click your case, the solution shows up", fr: "Les services nommés comme des problèmes : on clique sur son cas, la solution s'affiche", nl: "Diensten benoemd als problemen: klik op uw geval en de oplossing verschijnt" }, "proluxtoiture.be/#services"),
      ], caption: { en: "Pick your problem, get the answer and the phone number right away.", fr: "On choisit son problème, on obtient la solution et le numéro tout de suite.", nl: "Kies uw probleem en krijg meteen de oplossing en het nummer." } },
      { type: "screens", layout: "two", items: [
        web("prolux/site-home-nl.webp", { en: "Prolux website, home page in Dutch", fr: "Site Prolux, page d'accueil en néerlandais", nl: "Website van Prolux, homepage in het Nederlands" }, "proluxtoiture.be/nl"),
        web("prolux/site-contact.webp", { en: "Contact and quote request", fr: "Contact et demande de devis", nl: "Contact en offerteaanvraag" }, "proluxtoiture.be/#contact"),
      ] },
      { type: "screens", layout: "two", items: [
        web("prolux/site-work.webp", { en: "Work gallery: gutters and zinc", fr: "Galerie des travaux : gouttières et zinguerie", nl: "Galerij van het werk: goten en zinkwerk" }, "proluxtoiture.be/#travaux"),
        web("prolux/site-work-2.webp", { en: "Work gallery: cleaning and moss removal", fr: "Galerie des travaux : nettoyage et démoussage", nl: "Galerij van het werk: reiniging en ontmossing" }, "proluxtoiture.be/nl/#travaux"),
      ] },
      { type: "stats", items: [
        { num: "65", label: { en: "clicks from Google Ads in 7 days", fr: "clics depuis Google Ads en 7 jours", nl: "klikken via Google Ads in 7 dagen" } },
        { num: "×3", label: { en: "compared with the week before", fr: "par rapport à la semaine précédente", nl: "tegenover de week ervoor" } },
        { num: { en: "1,186", fr: "1 186", nl: "1.186" }, label: { en: "times shown on Google", fr: "affichages dans Google", nl: "vertoningen in Google" } },
      ], note: { en: "30 October to 5 November 2026.", fr: "Du 30 octobre au 5 novembre 2026.", nl: "Van 30 oktober tot 5 november 2026." } },
    ],
    end: { en: "Three times more clicks than the week before.", fr: "Trois fois plus de clics que la semaine précédente.", nl: "Drie keer meer klikken dan de week ervoor." },
  },
  {
    slug: "ehb-arcade",
    name: "EHB Arcade",
    kind: "case",
    where: { en: "A working arcade machine with its own game.", fr: "Une vraie borne d'arcade, avec son propre jeu.", nl: "Een werkende arcadekast met een eigen spel." },
    roles: { en: "Cabinet, electronics, game", fr: "Meuble, électronique, jeu", nl: "Kast, elektronica, spel" },
    cover: i("arcade/cabinet-side.webp", { en: "The arcade cabinet", fr: "La borne d'arcade", nl: "De arcadekast" }),
    preview: { image: "arcade/cabinet-side.webp" },
    hero: { image: i("arcade/cabinet.webp", { en: "The EHB Arcade cabinet", fr: "La borne EHB Arcade", nl: "De EHB Arcade-kast" }) },
    tag: { en: "Cabinet, electronics and game", fr: "Meuble, électronique et jeu", nl: "Kast, elektronica en spel" },
    place: BRUSSELS,
    credits: [
      { role: { en: "Cabinet design and build", fr: "Conception et fabrication du meuble", nl: "Ontwerp en bouw van de kast" } },
      { role: { en: "Electronics: joystick and buttons", fr: "Électronique : joystick et boutons", nl: "Elektronica: joystick en knoppen" } },
      { role: { en: "Game, made in Godot", fr: "Jeu, réalisé avec Godot", nl: "Spel, gemaakt in Godot" } },
    ],
    blocks: [
      { type: "lead",
        line: { en: "One machine: wood, wires and a game.", fr: "Une machine : du bois, des câbles et un jeu.", nl: "Eén machine: hout, kabels en een spel." },
        text: { en: "A full arcade machine that brings craft, electronics and software together, with a game made for it. The joystick and buttons answer the game the way a classic cabinet should.", fr: "Une borne d'arcade complète qui réunit fabrication, électronique et logiciel, avec un jeu créé pour elle. Le joystick et les boutons répondent au jeu comme sur une vraie borne.", nl: "Een volledige arcadekast die vakmanschap, elektronica en software samenbrengt, met een spel dat ervoor gemaakt is. De joystick en knoppen reageren zoals bij een klassieke kast." } },
      { type: "images", layout: "three", items: [
        i("arcade/lettering.webp", { en: "The stencilled lettering on the cabinet", fr: "Le lettrage au pochoir sur la borne", nl: "De gesjabloneerde belettering op de kast" }),
        i("arcade/front.webp", { en: "The cabinet, front", fr: "La borne, de face", nl: "De kast, vooraanzicht" }),
        i("arcade/cabinet-side.webp", { en: "The cabinet, side", fr: "La borne, de côté", nl: "De kast, zijaanzicht" }),
      ] },
    ],
    end: { en: "A working machine, ready to play.", fr: "Une machine qui fonctionne, prête à jouer.", nl: "Een werkende machine, klaar om te spelen." },
  },
  {
    slug: "world-without-bees",
    name: "World Without Bees",
    kind: "case",
    where: { en: "Interactive installation about pollinators.", fr: "Installation interactive sur les pollinisateurs.", nl: "Interactieve installatie over bestuivers." },
    roles: { en: "Installation, interaction, motion", fr: "Installation, interaction, motion", nl: "Installatie, interactie, motion" },
    cover: i("bees/scene-4.webp", { en: "A green landscape on screen", fr: "Un paysage vert à l'écran", nl: "Een groen landschap op het scherm" }),
    preview: { image: "bees/scene-4.webp" },
    hero: { image: i("bees/scene-4.webp", { en: "A green landscape on screen", fr: "Un paysage vert à l'écran", nl: "Een groen landschap op het scherm" }) },
    tag: { en: "Installation and interaction", fr: "Installation et interaction", nl: "Installatie en interactie" },
    place: BRUSSELS,
    credits: [
      { role: { en: "Concept", fr: "Concept", nl: "Concept" } },
      { role: { en: "Installation", fr: "Installation", nl: "Installatie" } },
      { role: { en: "Interaction", fr: "Interaction", nl: "Interactie" } },
      { role: { en: "Landscape and motion", fr: "Paysage et motion", nl: "Landschap en motion" } },
    ],
    links: [ { label: { en: "Watch it work", fr: "La voir fonctionner", nl: "Bekijk hoe het werkt" }, href: "https://www.youtube.com/shorts/DXmuA5xHnmI" } ],
    blocks: [
      { type: "lead",
        line: { en: "Take the bees away, and the world goes grey.", fr: "Retirez les abeilles, et le monde devient gris.", nl: "Haal de bijen weg, en de wereld wordt grijs." },
        text: { en: "Bees pollinate around 70 of the 100 crop species that feed 90% of the world. Remove the bees from a cardboard hive and the landscape on screen empties and turns grey. Put them back and it comes alive again.", fr: "Les abeilles pollinisent environ 70 des 100 espèces cultivées qui nourrissent 90 % de la planète. Retirez les abeilles d'une ruche en carton et le paysage à l'écran se vide et devient gris. Remettez-les et il reprend vie.", nl: "Bijen bestuiven ongeveer 70 van de 100 gewassen die 90% van de wereld voeden. Haal de bijen uit een kartonnen bijenkorf en het landschap op het scherm loopt leeg en wordt grijs. Zet ze terug en het komt weer tot leven." } },
      { type: "images", layout: "four", items: [
        i("bees/scene-0.webp", { en: "The landscape on screen", fr: "Le paysage à l'écran", nl: "Het landschap op het scherm" }),
        i("bees/scene-1.webp", { en: "The landscape on screen", fr: "Le paysage à l'écran", nl: "Het landschap op het scherm" }),
        i("bees/scene-2.webp", { en: "The landscape on screen", fr: "Le paysage à l'écran", nl: "Het landschap op het scherm" }),
        i("bees/scene-3.webp", { en: "The landscape on screen", fr: "Le paysage à l'écran", nl: "Het landschap op het scherm" }),
      ], caption: { en: "The landscape on screen, changing with the bees.", fr: "Le paysage à l'écran, qui change avec les abeilles.", nl: "Het landschap op het scherm, dat verandert met de bijen." } },
    ],
    end: { en: "A simple gesture with a heavy message.", fr: "Un geste simple pour un message lourd.", nl: "Een eenvoudig gebaar met een zware boodschap." },
  },

  // Lab
  { slug: "mordida", name: "Mordida Records", kind: "lab", heroWhole: true,
    where: { en: "A small-batch hot sauce and chili crisp brand, dressed like a record shop.", fr: "Une marque de sauce piquante et de chili crisp en petites séries, habillée comme un disquaire.", nl: "Een merk van hete saus en chili crisp in kleine oplages, gekleed als een platenzaak." },
    roles: { en: "Identity, packaging", fr: "Identité, emballage", nl: "Identiteit, verpakking" }, cover: i("lab/mordida.webp", { en: "The mordida wordmark, Flavor. On repeat., and the cobalt record emblem", fr: "Le logotype mordida, Flavor. On repeat., et l'emblème disque cobalt", nl: "Het mordida-woordmerk, Flavor. On repeat., en het kobaltblauwe platenembleem" }), coverBg: "#302016",
    hero: { image: i("lab/mordida.webp", { en: "The mordida wordmark, Flavor. On repeat., and the cobalt record emblem", fr: "Le logotype mordida, Flavor. On repeat., et l'emblème disque cobalt", nl: "Het mordida-woordmerk, Flavor. On repeat., en het kobaltblauwe platenembleem" }) },
    tag: { en: "Brand concept and identity system", fr: "Concept de marque et système d'identité", nl: "Merkconcept en identiteitssysteem" },
    credits: [
      { role: { en: "Concept and name", fr: "Concept et nom", nl: "Concept en naam" } },
      { role: { en: "Wordmark and record emblem", fr: "Logotype et emblème disque", nl: "Woordmerk en platenembleem" } },
      { role: { en: "Palette and typography", fr: "Palette et typographie", nl: "Palet en typografie" } },
      { role: { en: "Labels and tear seals", fr: "Étiquettes et scellés", nl: "Etiketten en scheurzegels" } },
      { role: { en: "Mailer and e-commerce hero", fr: "Boîte d'envoi et visuel e-commerce", nl: "Verzenddoos en e-commerce-hero" } },
    ],
    blocks: [
      { type: "lead",
        line: { en: "A record shop for hot sauce.", fr: "Un disquaire pour la sauce piquante.", nl: "Een platenzaak voor hete saus." },
        text: { en: "Mordida, Spanish for bite, is a small-batch brand of fermented hot sauce and roasted chili crisp. It turns away from macho novelty sauces and sterile wellness jars alike, and borrows the ritual, the liner-note detail and the collectible energy of a vintage record shop instead. Every flavour is a release, and every jar is made to stay out on the table and get passed around.", fr: "Mordida, « morsure » en espagnol, est une marque de sauce piquante fermentée et de chili crisp grillé, en petites séries. Elle tourne le dos autant aux sauces gadget au ton macho qu'aux bocaux bien-être aseptisés, et emprunte plutôt le rituel, le détail des notes de pochette et l'esprit de collection d'un disquaire vintage. Chaque saveur est une sortie, et chaque pot est fait pour rester sur la table et passer de main en main.", nl: "Mordida, Spaans voor beet, is een merk van gefermenteerde hete saus en geroosterde chili crisp in kleine oplages. Het keert zich af van macho gimmicksauzen en van steriele wellnesspotjes, en leent in de plaats het ritueel, de hoesnotities en de verzamelwoede van een vintage platenzaak. Elke smaak is een release, en elk potje is gemaakt om op tafel te blijven staan en rond te gaan." } },
      { type: "images", layout: "wide", items: [ i("lab/mordida-palette.webp", { en: "The five colours, Cacao, Turmeric, Sleeve, Cobalt and Vermilion, and the type: Fraunces Black Italic, DM Mono and Inter", fr: "Les cinq couleurs, Cacao, Turmeric, Sleeve, Cobalt et Vermilion, et la typographie : Fraunces Black Italic, DM Mono et Inter", nl: "De vijf kleuren, Cacao, Turmeric, Sleeve, Cobalt en Vermilion, en de letters: Fraunces Black Italic, DM Mono en Inter" }) ],
        caption: { en: "Record-shop warmth with a cobalt interruption. Fraunces Black Italic for the wordmark, DM Mono for the liner notes.", fr: "La chaleur d'un disquaire, interrompue par du cobalt. Fraunces Black Italic pour le logotype, DM Mono pour les notes de pochette.", nl: "De warmte van een platenzaak, onderbroken door kobaltblauw. Fraunces Black Italic voor het woordmerk, DM Mono voor de hoesnotities." } },
      { type: "images", layout: "wide", items: [ i("lab/mordida-pack.webp", { en: "Side A, Smoked Pineapple Habanero, and Side B, Black Garlic Chili Crisp, with their wrap labels and tear seals", fr: "Face A, Smoked Pineapple Habanero, et face B, Black Garlic Chili Crisp, avec leurs étiquettes et scellés", nl: "Kant A, Smoked Pineapple Habanero, en kant B, Black Garlic Chili Crisp, met hun etiketten en scheurzegels" }) ],
        caption: { en: "The first pressing: two flavours, two sides. Each label has a track list, a pairing and a five-dot heat meter, closed by a cobalt tear seal.", fr: "Le premier pressage : deux saveurs, deux faces. Chaque étiquette porte une liste des titres, un accord et une jauge de piquant à cinq points, fermée par un scellé cobalt.", nl: "De eerste persing: twee smaken, twee kanten. Elk etiket heeft een tracklist, een combinatie en een hittemeter met vijf bolletjes, afgesloten met een kobaltblauwe scheurzegel." } },
      { type: "images", layout: "two", items: [
        i("lab/mordida-bottles.webp", { en: "The hot sauce bottle and the chili crisp jar on a wooden table", fr: "La bouteille de sauce piquante et le pot de chili crisp sur une table en bois", nl: "De fles hete saus en het potje chili crisp op een houten tafel" }),
        i("lab/mordida-box.webp", { en: "The Double Release mailer, open, with both jars inside", fr: "La boîte Double Release ouverte, avec les deux pots", nl: "De Double Release-verzenddoos, open, met beide potjes" }),
      ] },
      { type: "images", layout: "wide", items: [ i("lab/mordida-mailer.webp", { en: "The two-tone mailer, The deep cuts., and the e-commerce hero, Put a little soul on it.", fr: "La boîte d'envoi bicolore, The deep cuts., et le visuel e-commerce, Put a little soul on it.", nl: "De tweekleurige verzenddoos, The deep cuts., en de e-commerce-hero, Put a little soul on it." }) ],
        caption: { en: "The Double Release mailer and the shop: Fermented heat. Roasted crunch.", fr: "La boîte Double Release et la boutique : Fermented heat. Roasted crunch.", nl: "De Double Release-verzenddoos en de webshop: Fermented heat. Roasted crunch." } },
    ],
    end: { en: "Flavour. On repeat.", fr: "La saveur, en boucle.", nl: "Smaak. Op repeat." } },
  { slug: "silo", name: "Silo", kind: "lab", heroWhole: true,
    where: { en: "A distraction-free desktop workspace for deep solo work: identity and product concept.", fr: "Un espace de travail sans distraction pour le travail en solo : identité et concept produit.", nl: "Een werkplek zonder afleiding voor diep solowerk: identiteit en productconcept." },
    roles: { en: "Identity, product", fr: "Identité, produit", nl: "Identiteit, product" }, cover: i("lab/silo-cover.webp", { en: "The Silo symbol and the line A quieter place to work", fr: "Le symbole Silo et la phrase A quieter place to work", nl: "Het Silo-symbool en de zin A quieter place to work" }),
    hero: { image: i("lab/silo.webp", { en: "The Silo symbol, the line A quieter place to work, and the four colours", fr: "Le symbole Silo, la phrase A quieter place to work et les quatre couleurs", nl: "Het Silo-symbool, de zin A quieter place to work en de vier kleuren" }) },
    tag: { en: "Brand identity and product concept", fr: "Identité de marque et concept produit", nl: "Merkidentiteit en productconcept" },
    credits: [
      { role: { en: "Concept", fr: "Concept", nl: "Concept" } },
      { role: { en: "Symbol system and app icon", fr: "Système de symboles et icône d'app", nl: "Symboolsysteem en app-icoon" } },
      { role: { en: "Palette and typography", fr: "Palette et typographie", nl: "Palet en typografie" } },
      { role: { en: "Desktop interface", fr: "Interface desktop", nl: "Desktopinterface" } },
      { role: { en: "Stationery", fr: "Papeterie", nl: "Drukwerk" } },
    ],
    blocks: [
      { type: "lead",
        line: { en: "A quiet room with good light.", fr: "Une pièce calme, avec une bonne lumière.", nl: "Een stille kamer met goed licht." },
        text: { en: "A desktop workspace for writers, researchers and founders who spend hours in dense PDFs, articles and notes, and turn them into clear writing. Most tools are either sterile spreadsheets or noisy AI workspaces full of notifications. Silo strips the clutter away, so it feels closer to a wooden desk with heavy paper and a sharp pencil.", fr: "Un espace de travail pour les auteurs, chercheurs et fondateurs qui passent des heures dans des PDF denses, des articles et des notes, et en tirent un texte clair. La plupart des outils sont soit des tableurs stériles, soit des espaces IA bruyants, pleins de notifications. Silo retire tout le superflu, pour se rapprocher d'un bureau en bois, d'un papier épais et d'un crayon bien taillé.", nl: "Een werkplek voor schrijvers, onderzoekers en oprichters die urenlang in dichte pdf's, artikels en notities zitten en er heldere tekst van maken. De meeste tools zijn ofwel steriele spreadsheets, ofwel drukke AI-werkplekken vol meldingen. Silo haalt alle ruis weg, zodat het aanvoelt als een houten bureau met dik papier en een scherp potlood." } },
      { type: "images", layout: "wide", items: [ i("lab/silo-desk.webp", { en: "The Silo workspace on a laptop", fr: "L'espace de travail Silo sur un ordinateur portable", nl: "De Silo-werkplek op een laptop" }) ],
        caption: { en: "Warm paper tones and soft charcoal instead of harsh black and white, with Focus Blue for the one thing that matters.", fr: "Des tons de papier chaud et un charbon doux au lieu d'un noir et blanc agressif, avec le Focus Blue pour la seule chose qui compte.", nl: "Warme papiertinten en zacht antraciet in plaats van hard zwart-wit, met Focus Blue voor het enige dat telt." } },
      { type: "images", layout: "two", items: [
        i("lab/silo-product.webp", { en: "The Silo interface: notes on the left, one note open on the right, a focus session at the bottom", fr: "L'interface Silo : les notes à gauche, une note ouverte à droite, une session de concentration en bas", nl: "De Silo-interface: notities links, één open notitie rechts, een focussessie onderaan" }),
        i("lab/silo-symbol.webp", { en: "The Silo app icon and the clear space around the symbol", fr: "L'icône d'app Silo et l'espace libre autour du symbole", nl: "Het Silo-app-icoon en de vrije ruimte rond het symbool" }),
      ], caption: { en: "An aperture motif: a quiet room opening onto clear space.", fr: "Un motif d'ouverture : une pièce calme qui s'ouvre sur un espace dégagé.", nl: "Een diafragmamotief: een stille kamer die opengaat naar vrije ruimte." } },
      { type: "images", layout: "two", items: [
        i("lab/silo-type.webp", { en: "Typography: Work in peace, set in Inter", fr: "Typographie : Work in peace, en Inter", nl: "Typografie: Work in peace, in Inter" }),
        i("lab/silo-pattern.webp", { en: "The symbol repeated as a pattern, and the line Find your quiet", fr: "Le symbole répété en motif, et la phrase Find your quiet", nl: "Het symbool herhaald als patroon, en de zin Find your quiet" }),
      ], caption: { en: "Inter on a Swiss-inspired grid, with short, calm messages.", fr: "Inter sur une grille d'inspiration suisse, avec des messages courts et calmes.", nl: "Inter op een Zwitsers geïnspireerd raster, met korte, rustige boodschappen." } },
      { type: "images", layout: "wide", items: [ i("lab/silo-world.webp", { en: "Silo cards and a badge on a charcoal background", fr: "Des cartes Silo et un badge sur fond charbon", nl: "Silo-kaarten en een badge op een antraciet achtergrond" }) ] },
    ],
    end: { en: "Less noise. More focus.", fr: "Moins de bruit. Plus de concentration.", nl: "Minder ruis. Meer focus." } },
  { slug: "infinite-corridor", name: "The Infinite Corridor", kind: "lab",
    where: { en: "An endless corridor of doors, each opening onto a small surreal world.", fr: "Un couloir sans fin, dont chaque porte ouvre sur un petit monde surréaliste.", nl: "Een eindeloze gang vol deuren, die elk openen op een kleine surrealistische wereld." },
    roles: { en: "Web", fr: "Web", nl: "Web" }, cover: i("lab/corridor.webp", { en: "The Infinite Corridor", fr: "The Infinite Corridor", nl: "The Infinite Corridor" }), link: { label: "visit", href: "https://lpsigorr.github.io/corridor/" } },
  { slug: "forgotten-ideas", name: "The Internet Museum of Forgotten Ideas", kind: "lab",
    where: { en: "A museum of inventions humanity almost built, each with its own small experiment.", fr: "Un musée des inventions que l'humanité a failli construire, chacune avec sa petite expérience.", nl: "Een museum van uitvindingen die de mensheid bijna bouwde, elk met een eigen klein experiment." },
    roles: { en: "Web", fr: "Web", nl: "Web" }, cover: i("lab/forgotten-ideas.webp", { en: "The Internet Museum of Forgotten Ideas", fr: "The Internet Museum of Forgotten Ideas", nl: "The Internet Museum of Forgotten Ideas" }), link: { label: "visit", href: "https://lpsigorr.github.io/forgottenideas/" } },
  { slug: "accumulation-room", name: "The Accumulation Room", kind: "lab",
    where: { en: "A gallery that fills as you scroll, until you are asked to clear it.", fr: "Une galerie qui se remplit à mesure qu'on défile, jusqu'à ce qu'on vous propose de la vider.", nl: "Een galerij die zich vult terwijl je scrolt, tot je gevraagd wordt om ze leeg te maken." },
    roles: { en: "Web", fr: "Web", nl: "Web" }, cover: i("lab/accumulation-room.webp", { en: "The Accumulation Room", fr: "The Accumulation Room", nl: "The Accumulation Room" }), link: { label: "visit", href: "https://lpsigorr.github.io/artgallery/" } },
  { slug: "mbdtf", name: "MBDTF, how it was born", kind: "lab",
    where: { en: "A paper cutout collage animation on how an album was born.", fr: "Une animation en collage de papier découpé sur la naissance d'un album.", nl: "Een collageanimatie van uitgeknipt papier over hoe een album ontstond." },
    roles: { en: "Motion", fr: "Motion", nl: "Motion" }, cover: i("lab/mbdtf.webp", { en: "Collage animation frame", fr: "Image de l'animation en collage", nl: "Beeld uit de collageanimatie" }), link: { label: "watch", href: "https://youtu.be/hAqJbdYw_u8" } },
  { slug: "eregum", name: "Eregum", kind: "lab",
    where: { en: "A fictional chewing gum brand: name, logo, packaging and posters.", fr: "Une marque fictive de chewing-gum : nom, logo, emballage et affiches.", nl: "Een fictief kauwgommerk: naam, logo, verpakking en affiches." },
    roles: { en: "Identity, packaging", fr: "Identité, emballage", nl: "Identiteit, verpakking" }, cover: i("lab/eregum.webp", { en: "The Eregum logo", fr: "Le logo Eregum", nl: "Het Eregum-logo" }), coverBg: "#000000",
    // a lab entry with blocks gets its own page (same template as a case study) and is clickable in the lab
    hero: { image: i("lab/eregum.webp", { en: "The Eregum logo", fr: "Le logo Eregum", nl: "Het Eregum-logo" }) },
    tag: { en: "Brand identity and packaging", fr: "Identité de marque et emballage", nl: "Merkidentiteit en verpakking" },
    credits: [
      { role: { en: "Concept and name", fr: "Concept et nom", nl: "Concept en naam" } },
      { role: { en: "Logo", fr: "Logo", nl: "Logo" } },
      { role: { en: "Packaging", fr: "Emballage", nl: "Verpakking" } },
      { role: { en: "Posters and Instagram visuals", fr: "Affiches et visuels Instagram", nl: "Affiches en Instagram-beelden" } },
    ],
    blocks: [
      { type: "lead",
        line: { en: "A chewing gum brand, invented from scratch.", fr: "Une marque de chewing-gum, inventée de A à Z.", nl: "Een kauwgommerk, van nul bedacht." },
        text: { en: "A fictional brand built from nothing: name, concept, logo, packaging and promotional material. Of several directions, the most provocative one won: EREGUM, a gum designed to improve sexual performance, directly inspired by Viagra. That one idea gave every design decision a clear direction.", fr: "Une marque fictive partie de rien : nom, concept, logo, emballage et supports promotionnels. Parmi plusieurs pistes, la plus provocante l'a emporté : EREGUM, un chewing-gum conçu pour améliorer les performances sexuelles, directement inspiré du Viagra. Cette seule idée a donné une direction claire à chaque choix de design.", nl: "Een fictief merk, opgebouwd vanuit het niets: naam, concept, logo, verpakking en promotiemateriaal. Van de verschillende richtingen won de meest provocerende: EREGUM, een kauwgom die seksuele prestaties moet verbeteren, rechtstreeks geïnspireerd op Viagra. Dat ene idee gaf elke ontwerpkeuze een duidelijke richting." } },
      { type: "images", layout: "two", items: [
        i("lab/eregum-box.webp", { en: "The Eregum box with one sachet", fr: "La boîte Eregum avec un sachet", nl: "De Eregum-doos met één zakje" }),
        i("lab/eregum-pack.webp", { en: "The packaging laid flat", fr: "L'emballage à plat", nl: "De verpakking, uitgevouwen" }),
      ], caption: { en: "The packaging takes its cue from condom boxes. The gum comes in small sachets of ten pieces.", fr: "L'emballage s'inspire des boîtes de préservatifs. Les chewing-gums sont glissés dans de petits sachets de dix pièces.", nl: "De verpakking is geïnspireerd op condoomdoosjes. De kauwgom zit in kleine zakjes van tien stuks." } },
    ],
    end: { en: "A fictional product, a complete brand.", fr: "Un produit fictif, une marque complète.", nl: "Een fictief product, een compleet merk." } },
  { slug: "soldias", name: "SOLDIAS", kind: "lab",
    where: { en: "A brand and its site, built on endurance and loyalty.", fr: "Une marque et son site, bâtis sur l'endurance et la loyauté.", nl: "Een merk en zijn website, gebouwd op uithouding en loyaliteit." },
    roles: { en: "Identity, web", fr: "Identité, web", nl: "Identiteit, web" }, cover: i("lab/soldias.webp", { en: "The SOLDIAS website", fr: "Le site SOLDIAS", nl: "De SOLDIAS-website" }), link: { label: "visit", href: "https://lpsigorr.github.io/soldias/#/" } },
  { slug: "roast-and-ritual", name: "Roast and Ritual", kind: "lab",
    where: { en: "A website for a coffee shop concept.", fr: "Un site pour un concept de coffee shop.", nl: "Een website voor een koffiebarconcept." },
    roles: { en: "Web design", fr: "Webdesign", nl: "Webdesign" }, cover: i("lab/roast-and-ritual.webp", { en: "The Roast and Ritual website", fr: "Le site Roast and Ritual", nl: "De Roast and Ritual-website" }), link: { label: "visit", href: "https://lpsigorr.github.io/coffee/" } },
];

export const cases = projects.filter((p) => p.kind === "case");
export const lab = projects.filter((p) => p.kind === "lab");
/** Every project that has its own page: the case studies, and lab entries that have blocks. */
export const pages = projects.filter((p) => p.kind === "case" || p.blocks);

export function nextCase(slug: string): Project {
  const idx = cases.findIndex((p) => p.slug === slug);
  return cases[(idx + 1) % cases.length];
}
