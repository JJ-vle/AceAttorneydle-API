const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

// Configuration pour utiliser CORS
app.use(cors());
app.use(bodyParser.json());

///////////////////// VALID ITEMS

// Fonction pour filtrer les personnages
function isValidCharacter(character, gameMod) {

    if (!character.image || character.exception == "unusable" || character.image === "N/A" || character.image === "Unknown" || character.image === "Unknow") {
        if (character.bypass) {
            return true;
        }
        return false;
    }
    if (gameMod == "silhouette" && character.exception == "unusable-silhouette"){
        return false;
    }

    const attributes = [
        character.name,
        character.status,
        character.gender,
        character.birthday,
        character.eyes,
        character.hair,
        character.debut
    ];

    // Filtrer les valeurs valides (excluant "N/A", "Unknown", "Unknow", null)
    const validAttributes = attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow");

    // Garder seulement les personnages ayant au moins 4 attributs valides
    return validAttributes.length >= 4;
}
// Fonction pour filtrer les cas
function isValidCase(turnabout) {
    if (!turnabout.name || !turnabout.evidence) {
        return false;
    }
    if (turnabout.bypass) {
        return true;
    }

    const attributes = [turnabout.name, turnabout.image, turnabout.evidence, turnabout.victim, turnabout.cause];
    return attributes.filter(attr => attr && attr !== "N/A" && attr !== "Unknown" && attr !== "Unknow").length >= 3;
}
// Fonction pour filtrer les personnages valides selon la logique donnée
function validateListCharacters(data, gameMode) {
    return data.filter(character => isValidCharacter(character, gameMode));
}
// Fonction pour filtrer les cas valides selon la logique donnée
function validateListCases(data) {
    return data.filter(turnabout => isValidCase(turnabout));
}

///////////////////// LOAD DATA

// Charger les fichiers JSON
let turnaboutGames = require('./data/turnabouts.json');
let characterData = require('./data/aceattorneychars.json');
characterData = characterData.filter(character => isValidCharacter(character, "guess"));
let quoteData = require('./data/quotes.json');
let casesData = require('./data/cases.json');
casesData = casesData.filter(character => isValidCase(character));

///////////////////// QUEUE STRUCTURE

// Structure pour stocker les files d'attente
let gameQueues = {
    guess: { Main: [], Investigation: [], Great: [] },
    silhouette: { Main: [], Investigation: [], Great: [] },
    quote: { Main: [], Investigation: [], Great: [] },
    case: { Main: [], Investigation: [], Great: [] }
};
// Structure pour stocker l'ordre de priorité
let gamePriority = {
    guess: ["Main", "Great", "Investigation"],
    silhouette: ["Investigation", "Main", "Great"],
    quote: ["Great", "Main", "Investigation"],
    case: ["Main", "Investigation", "Great"]
};

///////////////////// 

const QUEUE_FILE = './data/tmp/gameQueues.json';

// Sauvegarder dans un fichier
function saveQueuesToFile() {
    const dir = './data/tmp';

    // Vérifie si le dossier existe, sinon le crée
    if (!fs.existsSync(dir)) {
        console.log("📁 Dossier 'tmp' non trouvé. Création...");
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(gameQueues));
        console.log("✅ Sauvegarde des files d'attente réussie.");
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde des files d'attente :", error);
    }
}

// Charger depuis le fichier (ou réinitialiser si non trouvé)
function loadQueuesFromFile() {
    if (fs.existsSync(QUEUE_FILE)) {
        gameQueues = JSON.parse(fs.readFileSync(QUEUE_FILE));
    } else {
        initializeQueues();
        saveQueuesToFile();
    }
}

// Charger les files d'attente au démarrage
loadQueuesFromFile();

///////////////////// 

function shufflePriorities() {
    Object.keys(gamePriority).forEach(mode => {
        shuffleArray(gamePriority[mode]);
    });
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function filterByGroup(data, group, cases) {
    if(cases){
        return data.filter(item => getGroupByTurnabout(item.name) === group);
    }
    return data.filter(item => getGroupByTurnabout(item.debut) === group);
}
function filterQuoteByGroup(data, group) {
    return data.filter(item => getGroupByTurnabout(item.source) === group);
}
function getGroupByTurnabout(turnabout) {
    for (let group in turnaboutGames) {
        for (let game in turnaboutGames[group]) {
            if (turnaboutGames[group][game].includes(turnabout)) {
                return group;
            }
        }
    }
    return null;
}

function initializeQueues() {
    ['Main', 'Investigation', 'Great'].forEach(group => {
        gameQueues.guess[group] = validateListCharacters(filterByGroup(characterData, group), "guess");
        shuffleArray(gameQueues.guess[group]);
        
        gameQueues.silhouette[group] = validateListCharacters(filterByGroup(characterData, group), "silhouette");
        shuffleArray(gameQueues.silhouette[group]);
        
        gameQueues.quote[group] = filterQuoteByGroup(quoteData, group);
        shuffleArray(gameQueues.quote[group]);
        
        gameQueues.case[group] = validateListCases(filterByGroup(casesData, group, true));
        shuffleArray(gameQueues.case[group]);
    });
    console.log("✅ Files d'attente initialisées et mélangées.");
    shufflePriorities();
    //console.log(gamePriority.guess);
}
//initializeQueues();

// Modifier rotateQueues pour sauvegarder les données
function rotateQueues() {
    shufflePriorities();
    Object.keys(gameQueues).forEach(mode => {
        Object.keys(gameQueues[mode]).forEach(group => {
            if (gameQueues[mode][group].length > 0) {
                gameQueues[mode][group].shift();
            }
            if (gameQueues[mode][group].length === 0) {
                gameQueues[mode][group] = filterByGroup(
                    mode === 'quote' ? quoteData : mode === 'case' ? casesData : characterData,
                    group
                );
                shuffleArray(gameQueues[mode][group]);
            }
        });
    });
    saveQueuesToFile();
    console.log("🔄 Rotation des files d'attente effectuée.");
}

// Supprime le premier élément toutes les 5 minutes
//setInterval(rotateQueues, 5 * 60 * 1000);

//////////////////////////// API

// get item to find with mode and filter
app.get('/api/item-to-find/:mode/:filter?', (req, res) => {
    const { mode, filter } = req.params;

    if (!gameQueues[mode] || !gamePriority[mode]) {
        return res.status(400).json({ error: "Mode invalide" });
    }

    let selectedItem = null;

    // Liste des groupes à vérifier
    let filtersToCheck = filter ? filter.split(',') : gamePriority[mode];

    // Trier les groupes selon leur priorité dans gamePriority[mode]
    filtersToCheck.sort((a, b) => gamePriority[mode].indexOf(a) - gamePriority[mode].indexOf(b));

    // Vérifier chaque groupe dans l'ordre de priorité
    for (let group of filtersToCheck) {
        if (gameQueues[mode][group] && gameQueues[mode][group].length > 0) {
            selectedItem = gameQueues[mode][group][0];
            break;
        }
    }

    if (!selectedItem) {
        return res.status(500).json({ error: "Aucun élément disponible" });
    }

    res.json(selectedItem);
});

// get informations about a character with his name
app.get('/api/character/:name', (req, res) => {
    const { name } = req.params;
    console.log(`🔍 Recherche du personnage : ${name}`);

    // Recherche du personnage dans characterData
    const character = characterData.find(char => char.name.toLowerCase() === name.toLowerCase());

    if (!character) {
        console.error("❌ Personnage non trouvé :", name);
        return res.status(404).json({ error: "Personnage non trouvé" });
    }

    res.json(character);
});

//////////////////////////// API GET FULL JSON

// Point de terminaison pour récupérer tous les personnages
app.get('/api/characters', (req, res) => {
    res.json(characterData);
});
// Point de terminaison pour récupérer les citations
app.get('/api/quotes', (req, res) => {
    res.json(quoteData);
});
// Point de terminaison pour récupérer les affaires
app.get('/api/cases', (req, res) => {
    res.json(casesData);
});
// Point de terminaison pour obtenir des informations de jeu (exemple de filtrage par groupe)
app.get('/api/turnabouts', (req, res) => {
    res.json(turnaboutGames);
});

//////////////////////////// LAUNCH SERV

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Server ON');
});

//////////////////////////// MIDNIGHT ROTATION

const cron = require('node-cron');

// Exécuter la rotation des files d'attente tous les jours à minuit
cron.schedule('0 0 * * *', () => {
    console.log("🌙 Minuit ! Rotation des personnages...");
    rotateQueues();
});

////////////////////////////