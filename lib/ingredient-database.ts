// Base de données complète des ingrédients par catégorie
export const INGREDIENT_DATABASE = {
  "Fruits et Légumes": [
    // Fruits
    "pomme", "banane", "orange", "fraise", "raisin", "kiwi", "ananas", "mangue", "pêche", "poire", "prune", "cerise",
    "citron", "lime", "pamplemousse", "mandarine", "clémentine", "nectarine", "abricot", "figue", "datte", "raisin sec",
    "myrtille", "framboise", "mûre", "groseille", "cassis", "mirabelle", "quetsche", "pruneau", "figue sèche",
    "melon", "pastèque", "papaye", "goyave", "litchi", "longane", "ramboutan", "durian", "jackfruit", "mangoustan",
    "grenade", "kaki", "coing", "nèfle", "sorbier", "cornouille", "argousier", "amélanche", "prunelle",
    "pomme de terre", "patate douce", "igname", "manioc", "taro", "topinambour", "crosne", "oca",
    
    // Légumes
    "tomate", "carotte", "poivron", "courgette", "aubergine", "brocoli", "chou-fleur", "épinard", "salade", "laitue",
    "oignon", "ail", "échalote", "poireau", "céleri", "concombre", "radis", "betterave", "patate",
    "asperge", "artichaut", "endive", "chicorée", "mâche", "roquette", "cresson", "pissenlit", "pourpier",
    "chou", "chou rouge", "chou vert", "chou blanc", "chou de bruxelles", "chou kale", "chou romanesco",
    "navet", "rutabaga", "rave", "panais", "céleri-rave", "céleri-branche", "fenouil", "cardon",
    "courge", "potiron", "butternut", "patisson", "pâtisson", "coloquinte", "courge spaghetti",
    "haricot", "pois", "fève", "lentille", "pois chiche", "haricot vert", "haricot beurre",
    "maïs", "petit pois", "flageolet", "coco", "tarbais", "lingot", "mogette",
    
    // Herbes aromatiques
    "basilic", "persil", "ciboulette", "thym", "romarin", "sauge", "menthe", "origan", "marjolaine",
    "estragon", "cerfeuil", "aneth", "coriandre", "laurier", "sarriette", "hysope", "verveine",
    "mélisse", "bourrache", "souci", "capucine", "nasturtium", "pensée", "violette",
    
    // Champignons
    "champignon", "girolle", "cèpe", "bolets", "morille", "trompette", "pleurote", "shiitake",
    "portobello", "button", "cremini", "enoki", "maitake", "reishi", "chaga", "cordyceps",
    
    // Algues
    "nori", "wakame", "kombu", "dulse", "spiruline", "chlorella", "agar-agar", "carragheen"
  ],
  "Viandes et Poissons": [
    // Volailles
    "poulet", "dinde", "canard", "oie", "pigeon", "caille", "faisan", "perdreau", "pintade",
    "filet de poulet", "escalope de poulet", "aile de poulet", "cuisse de poulet", "blanc de poulet",
    "magret de canard", "foie gras", "confit de canard", "rillettes de canard",
    
    // Viandes rouges
    "bœuf", "veau", "agneau", "mouton", "porc", "jambon", "lard", "lardons", "bacon",
    "steak", "rôti", "escalope", "filet", "côte", "entrecôte", "bavette", "rumsteak",
    "onglet", "faux-filet", "aloyau", "tende de tranche", "hampe", "poire", "merlan",
    "queue", "langue", "cervelle", "foie", "rognons", "cœur", "tripes", "andouille",
    "saucisse", "saucisson", "chorizo", "salami", "mortadelle", "prosciutto", "parme",
    "jambon de bayonne", "jambon de parme", "jambon serrano", "jambon iberico",
    
    // Gibier
    "chevreuil", "sanglier", "lièvre", "lapin", "perdrix", "bécasse", "bécassine",
    "vanneau", "pluvier", "caille", "faisan", "coq de bruyère", "gélinotte",
    
    // Poissons
    "saumon", "thon", "truite", "cabillaud", "morue", "sardine", "maquereau", "hareng",
    "anchois", "crevette", "moule", "huître", "palourde", "coquille", "langouste",
    "homard", "crabe", "tourteau", "écrevisse", "langoustine", "scampi", "gambas",
    "bar", "dorade", "loup", "sole", "turbot", "barbue", "cardine", "plie", "limande",
    "merlan", "lieu", "colin", "églefin", "merlu", "lingue", "brochet", "sandre",
    "perche", "silure", "esturgeon", "saumonette", "rascasse", "rouget", "vivaneau",
    
    // Fruits de mer
    "crevette", "langoustine", "scampi", "gambas", "bouquet", "crevette grise",
    "moule", "huître", "palourde", "coquille", "amande", "praire", "clovisse",
    "vénus", "telline", "donace", "mactre", "couteau", "coque", "mactra",
    "langouste", "homard", "crabe", "tourteau", "écrevisse", "langoustine",
    "araignée de mer", "crabe vert", "crabe bleu", "crabe royal", "crabe des neiges",
    "calamar", "seiche", "poulpe", "encornet", "chipiron", "calmar", "squid",
    
    // Œufs et produits dérivés
    "œuf", "œufs", "jaune d'œuf", "blanc d'œuf", "œuf entier", "œuf frais",
    "œuf de caille", "œuf de canard", "œuf d'oie",
    
    // Produits transformés
    "filet", "darnes", "tranches", "cubes", "haché", "viande", "poisson", "fruits de mer",
    "nuggets", "cordon bleu", "escalope panée", "filet pané", "bâtonnets de poisson",
    "surimi", "tarama", "caviar", "œufs de lump", "œufs de saumon", "œufs de truite"
  ],
  "Produits Laitiers": [
    // Laits
    "lait", "lait entier", "lait demi-écrémé", "lait écrémé", "lait de vache",
    "lait de chèvre", "lait de brebis", "lait de bufflonne", "lait de jument",
    "lait d'ânesse", "lait de chamelle", "lait de yak", "lait de renne",
    "lait concentré", "lait en poudre", "lait évaporé", "lait stérilisé",
    "lait pasteurisé", "lait cru", "lait microfiltré", "lait homogénéisé",
    
    // Yaourts et produits fermentés
    "yaourt", "yaourts", "yogourt", "yogurt", "fromage blanc", "petit suisse",
    "faisselle", "kefir", "lait fermenté", "lait ribot", "lait caillé",
    "yaourt grec", "yaourt bulgare", "yaourt turc", "yaourt libanais",
    "yaourt aux fruits", "yaourt nature", "yaourt vanille", "yaourt citron",
    "yaourt miel", "yaourt coco", "yaourt soja", "yaourt amande",
    
    // Fromages
    "fromage", "camembert", "brie", "roquefort", "comté", "gruyère", "emmental",
    "parmesan", "mozzarella", "cheddar", "gouda", "edam", "munster", "maroilles",
    "livarot", "pont-l'évêque", "vacherin", "beaufort", "abondance", "tome",
    "chèvre", "brebis", "bufflonne", "feta", "ricotta", "cottage", "quark",
    "fromage frais", "fromage à tartiner", "fromage râpé", "fromage en tranches",
    "fromage en dés", "fromage en bloc", "fromage en meule", "fromage en croûte",
    "fromage de chèvre", "fromage de brebis", "fromage de bufflonne",
    "chèvre frais", "chèvre sec", "chèvre cendré", "chèvre à la cendre",
    "brebis frais", "brebis sec", "brebis affiné", "brebis cendré",
    "bufflonne frais", "bufflonne sec", "bufflonne affiné",
    
    // Beurres et crèmes
    "beurre", "beurre doux", "beurre salé", "beurre demi-sel", "beurre cru",
    "beurre pasteurisé", "beurre clarifié", "ghee", "beurre de baratte",
    "beurre d'isigny", "beurre de charentes", "beurre de normandie",
    "crème", "crème fraîche", "crème épaisse", "crème liquide", "crème fleurette",
    "crème aigre", "crème sure", "crème double", "crème légère", "crème allégée",
    "crème de soja", "crème de coco", "crème d'amande", "crème de riz",
    
    // Produits dérivés
    "lactosérum", "petit-lait", "babeurre", "lait ribot", "lait caillé",
    "fromage blanc", "fromage frais", "fromage à tartiner", "fromage râpé",
    "fromage en tranches", "fromage en dés", "fromage en bloc", "fromage en meule",
    "fromage en croûte", "fromage de chèvre", "fromage de brebis", "fromage de bufflonne"
  ],
  "Céréales et Pains": [
    // Pains
    "pain", "baguette", "croissant", "brioche", "chouquette", "pain au chocolat",
    "pain aux raisins", "pain de mie", "pain complet", "pain intégral", "pain aux céréales",
    "pain de campagne", "pain de seigle", "pain de blé", "pain d'épeautre", "pain de sarrasin",
    "pain de maïs", "pain de riz", "pain de quinoa", "pain de millet", "pain d'avoine",
    "pain de châtaigne", "pain de noix", "pain aux olives", "pain aux herbes",
    "focaccia", "ciabatta", "pita", "naan", "tortilla", "chapati", "roti",
    "matzo", "challah", "brioche", "kouign-amann", "gâteau breton", "far breton",
    
    // Farines
    "farine", "farine de blé", "farine de seigle", "farine d'épeautre", "farine de sarrasin",
    "farine de maïs", "farine de riz", "farine de quinoa", "farine de millet",
    "farine d'avoine", "farine de châtaigne", "farine de noix", "farine de pois chiche",
    "farine de lentilles", "farine de fèves", "farine de soja", "farine d'amande",
    "farine de coco", "farine de manioc", "farine de tapioca", "farine de arrow-root",
    "farine de kuzu", "farine de kudzu", "farine de konjac", "farine de guar",
    "farine de xanthane", "farine de psyllium", "farine de lin", "farine de chia",
    
    // Céréales
    "blé", "seigle", "épeautre", "quinoa", "riz", "pâtes", "couscous", "boulgour",
    "polenta", "avoine", "orge", "millet", "sarrasin", "maïs", "semoule",
    "chapelure", "panure", "biscotte", "céréales", "muesli", "granola", "flocons",
    "son", "germe", "levure", "levain", "starter", "poolish", "biga", "pâte mère",
    
    // Riz et pâtes
    "riz blanc", "riz complet", "riz sauvage", "riz basmati", "riz jasmine",
    "riz arborio", "riz carnaroli", "riz vialone nano", "riz de camargue",
    "riz de thailand", "riz de japon", "riz de chine", "riz de corée",
    "pâtes", "spaghetti", "penne", "rigatoni", "fusilli", "farfalle", "orecchiette",
    "tagliatelle", "linguine", "fettuccine", "lasagne", "ravioli", "tortellini",
    "gnocchi", "couscous", "boulgour", "polenta", "semoule", "chapelure",
    
    // Graines et noix
    "graines", "graines de chia", "graines de lin", "graines de tournesol",
    "graines de courge", "graines de sésame", "graines de pavot", "graines de moutarde",
    "graines de fenouil", "graines de cumin", "graines de coriandre", "graines d'anis",
    "graines de carvi", "graines de cardamome", "graines de nigelle", "graines de kalonji",
    "noix", "amandes", "noisettes", "pistaches", "cacahuètes", "noix de cajou",
    "noix de macadamia", "noix de pécan", "noix de bresil", "noix de coco",
    "pignons", "pignons de pin", "noix de pin", "noix de cèdre", "noix de siberie"
  ],
  "Épices et Condiments": [
    // Épices de base
    "sel", "poivre", "sucre", "miel", "sirop", "vinaigre", "huile", "moutarde",
    "ketchup", "mayonnaise", "curry", "cumin", "paprika", "safran", "cannelle",
    "muscade", "girofle", "cardamome", "anis", "basilic", "thym", "romarin",
    "origan", "marjolaine", "sauge", "estragon", "cerfeuil", "persil", "ciboulette",
    "ail", "oignon", "échalote", "gingembre", "curcuma", "piment", "chili", "harissa",
    
    // Épices exotiques
    "sauce soja", "nuoc mam", "worcestershire", "tabasco", "sriracha", "wasabi",
    "miso", "dashi", "mirin", "sake", "umeboshi", "yuzu", "kombu", "wakame",
    "nori", "furikake", "gomasio", "shichimi", "ichimi", "sansho", "sichuan",
    "star anise", "badiane", "fenouil étoilé", "anis étoilé", "badiane de chine",
    
    // Épices indiennes
    "curry", "garam masala", "tandoori", "tikka", "vindaloo", "korma", "biryani",
    "masala", "chaat masala", "panch phoron", "ras el hanout", "za'atar", "dukkah",
    "baharat", "advieh", "berbere", "mitmita", "shichimi", "ichimi", "sansho",
    
    // Épices mexicaines
    "chili", "chipotle", "ancho", "guajillo", "pasilla", "cascabel", "arbol",
    "jalapeño", "serrano", "habanero", "scotch bonnet", "ghost pepper", "carolina reaper",
    "adobo", "achiote", "annatto", "achiote", "bijol", "achiote", "bijol",
    
    // Épices chinoises
    "cinq épices", "cinq parfums", "wuxiangfen", "wuxiangfen", "wuxiangfen",
    "sichuan", "sichuan pepper", "sansho", "sansho", "sansho", "sansho",
    "star anise", "badiane", "fenouil étoilé", "anis étoilé", "badiane de chine",
    
    // Épices japonaises
    "wasabi", "yuzu", "kombu", "wakame", "nori", "furikake", "gomasio",
    "shichimi", "ichimi", "sansho", "sichuan", "star anise", "badiane",
    "fenouil étoilé", "anis étoilé", "badiane de chine",
    
    // Épices du Moyen-Orient
    "za'atar", "dukkah", "baharat", "advieh", "berbere", "mitmita", "ras el hanout",
    "harissa", "dukkah", "za'atar", "baharat", "advieh", "berbere", "mitmita",
    
    // Épices européennes
    "herbes de provence", "bouquet garni", "fines herbes", "persillade",
    "gremolata", "pesto", "chimichurri", "romesco", "aioli", "rouille",
    "sauce verte", "sauce gribiche", "sauce rémoulade", "sauce tartare",
    
    // Condiments
    "moutarde", "ketchup", "mayonnaise", "sauce soja", "nuoc mam", "worcestershire",
    "tabasco", "sriracha", "wasabi", "miso", "dashi", "mirin", "sake", "umeboshi",
    "yuzu", "kombu", "wakame", "nori", "furikake", "gomasio", "shichimi", "ichimi",
    "sansho", "sichuan", "star anise", "badiane", "fenouil étoilé", "anis étoilé"
  ],
  "Boissons": [
    // Eaux
    "eau", "eau minérale", "eau de source", "eau du robinet", "eau filtrée",
    "eau gazeuse", "eau pétillante", "eau plate", "eau de coco", "eau de riz",
    "eau d'orge", "eau de châtaigne", "eau de noix", "eau d'amande",
    
    // Jus et nectars
    "jus", "jus d'orange", "jus de pomme", "jus de raisin", "jus de tomate",
    "jus de carotte", "jus de betterave", "jus de céleri", "jus de concombre",
    "jus de gingembre", "jus de citron", "jus de lime", "jus de pamplemousse",
    "jus de mandarine", "jus de clémentine", "jus de nectarine", "jus de pêche",
    "jus d'abricot", "jus de prune", "jus de cerise", "jus de fraise",
    "jus de framboise", "jus de myrtille", "jus de mûre", "jus de groseille",
    "jus de cassis", "jus de mûre", "jus de framboise", "jus de myrtille",
    "nectar", "concentré", "sirop", "sirop de grenadine", "sirop de menthe",
    "sirop de citron", "sirop de fraise", "sirop de framboise", "sirop de myrtille",
    
    // Sodas et limonades
    "soda", "limonade", "cola", "sprite", "fanta", "orangina", "schweppes",
    "pepsi", "coca-cola", "coca", "pepsi-cola", "dr pepper", "mountain dew",
    "7-up", "sprite", "fanta", "orangina", "schweppes", "perrier", "badoit",
    "vittel", "evian", "volvic", "contrex", "hépar", "quezac", "salvetat",
    
    // Vins et alcools
    "vin", "vin rouge", "vin blanc", "vin rosé", "vin mousseux", "champagne",
    "prosecco", "cava", "crémant", "vin doux", "vin moelleux", "vin liquoreux",
    "vin de dessert", "vin de glace", "vin de paille", "vin jaune", "vin de voile",
    "bière", "cidre", "poiré", "hydromel", "liqueur", "rhum", "vodka", "whisky",
    "gin", "tequila", "cognac", "armagnac", "calvados", "marc", "eau-de-vie",
    
    // Boissons chaudes
    "thé", "café", "tisane", "infusion", "décoction", "macération", "percolation",
    "thé vert", "thé noir", "thé oolong", "thé blanc", "thé jaune", "thé pu-erh",
    "thé rooibos", "thé maté", "thé de jade", "thé de jasmin", "thé de rose",
    "thé de bergamote", "thé earl grey", "thé english breakfast", "thé irish breakfast",
    "café arabica", "café robusta", "café liberica", "café excelsa", "café bourbon",
    "café typica", "café caturra", "café catuai", "café mundo novo", "café pacamara",
    
    // Boissons végétales
    "lait d'amande", "lait de soja", "lait d'avoine", "lait de riz", "lait de coco",
    "lait de noisette", "lait de châtaigne", "lait de quinoa", "lait de millet",
    "lait de sarrasin", "lait de pois", "lait de lentilles", "lait de fèves",
    "lait de pois chiche", "lait de lupin", "lait de chanvre", "lait de lin",
    "lait de chia", "lait de graines de tournesol", "lait de graines de courge",
    "lait de graines de sésame", "lait de graines de pavot", "lait de graines de moutarde",
    
    // Boissons énergisantes
    "smoothie", "milkshake", "cocktail", "mocktail", "sirop", "concentré", "nectar",
    "boisson énergisante", "red bull", "monster", "rockstar", "burn", "nocco",
    "boisson isotonique", "gatorade", "powerade", "lucozade", "vitamin water"
  ],
  "Sucreries": [
    // Chocolats
    "chocolat", "chocolat noir", "chocolat au lait", "chocolat blanc", "chocolat blond",
    "chocolat de couverture", "chocolat pâtissier", "chocolat de dégustation",
    "chocolat grand cru", "chocolat d'origine", "chocolat single origin",
    "chocolat de plantation", "chocolat de terroir", "chocolat de réserve",
    "chocolat de vintage", "chocolat de millésime", "chocolat de cuvée",
    "chocolat de sélection", "chocolat de prestige", "chocolat de luxe",
    
    // Bonbons et confiseries
    "bonbon", "caramel", "nougat", "praline", "truffle", "ganache", "pâte à tartiner",
    "dragée", "praline", "gianduja", "pistache", "noisette", "amande", "noix",
    "pécan", "macadamia", "cajou", "bresil", "coco", "pignon", "pin", "cèdre",
    "siberie", "châtaigne", "marron", "marron glacé", "marron d'inde",
    
    // Confitures et gelées
    "confiture", "gelée", "marmelade", "compote", "confit", "fruits confits",
    "pâte de fruits", "pâte d'amande", "pâte de noisette", "pâte de pistache",
    "pâte de marron", "pâte de châtaigne", "pâte de prune", "pâte de coing",
    "pâte de figue", "pâte de datte", "pâte de raisin", "pâte de pomme",
    "pâte de poire", "pâte de pêche", "pâte d'abricot", "pâte de prune",
    
    // Pâtisseries
    "biscuit", "gâteau", "tarte", "éclair", "mille-feuille", "opéra", "tiramisu",
    "crème brûlée", "glace", "sorbet", "crème glacée", "parfait", "soufflé",
    "mousse", "crème", "pudding", "flan", "crème caramel", "crème renversée",
    "crème pâtissière", "crème diplomate", "crème chiboust", "crème mousseline",
    "crème frangipane", "crème d'amande", "crème de noisette", "crème de pistache",
    "crème de marron", "crème de châtaigne", "crème de prune", "crème de coing",
    
    // Desserts glacés
    "glace", "sorbet", "crème glacée", "parfait", "soufflé", "mousse", "crème",
    "pudding", "flan", "crème caramel", "crème renversée", "crème pâtissière",
    "crème diplomate", "crème chiboust", "crème mousseline", "crème frangipane",
    "crème d'amande", "crème de noisette", "crème de pistache", "crème de marron",
    "crème de châtaigne", "crème de prune", "crème de coing", "crème de figue",
    "crème de datte", "crème de raisin", "crème de pomme", "crème de poire",
    "crème de pêche", "crème d'abricot", "crème de prune", "crème de cerise",
    "crème de fraise", "crème de framboise", "crème de myrtille", "crème de mûre",
    "crème de groseille", "crème de cassis", "crème de mûre", "crème de framboise",
    "crème de myrtille", "crème de groseille", "crème de cassis", "crème de mûre"
  ]
};

// Fonction pour catégoriser automatiquement un ingrédient
export const categorizeIngredient = (ingredientName: string, existingCategories: string[]): string => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Ordre de priorité des catégories (du plus spécifique au plus général)
  const categoryPriority = [
    "Sucreries",           // Plus spécifique
    "Épices et Condiments",
    "Produits Laitiers", 
    "Viandes et Poissons",
    "Fruits et Légumes",
    "Céréales et Pains",
    "Boissons",            // Plus général
    "Divers"
  ];
  
  // Vérifier si l'ingrédient correspond à une catégorie existante dans l'ordre de priorité
  for (const category of categoryPriority) {
    if (existingCategories.includes(category)) {
      const keywords = INGREDIENT_DATABASE[category];
      if (keywords) {
        for (const keyword of keywords) {
          if (normalizedName.includes(keyword)) {
            return category;
          }
        }
      }
    }
  }

  // Si aucune correspondance, retourner "Divers"
  return "Divers";
}; 