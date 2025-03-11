# Ace Attorney API Server

Ce projet est un serveur Node.js utilisant Express pour gérer une API liée à l'univers d'Ace Attorney. Il permet de récupérer des personnages, des citations et des affaires, et de gérer des files d'attente pour un jeu basé sur ces éléments. Cette API est utilisée dans le cadre de [AceAttorneydle](https://github.com/JJ-vle/AceAttorneydle).

## Installation et Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) installé sur votre machine

### Installation des dépendances
Clonez ce dépôt et installez les dépendances avec la commande :
```sh
npm install
```

### Lancement du serveur en local
```sh
node index.js
```
Le serveur tournera par défaut sur le port `3000`, sauf si un autre port est spécifié via la variable d'environnement `PORT`.

## Routes de l'API

### Récupérer un élément à deviner
```http
GET /api/item-to-find/:mode/:filter?
```
- `mode` : `guess`, `silhouette`, `quote` ou `case`
- `filter` (optionnel) : (`Main`, `Investigation`, `Great`) Correspond aux différents groupes de jeux Ace Attorney sortis.

### Récupérer les informations d'un personnage
```http
GET /api/character/:name
```
- `name` : Nom du personnage (sensible à la casse et aux espaces)

### Récupérer toutes les données
```http
GET /api/characters   # Liste des personnages
GET /api/quotes       # Liste des citations
GET /api/cases        # Liste des affaires
GET /api/turnabouts   # Liste des groupes et des jeux de chaque affaire
```

## Fonctionnalités principales
- Filtrage des personnages et affaires valides
- Gestion de files d'attente pour le jeu
- Rotation automatique des files toutes les 5 minutes
- Déploiement optimisé sur Vercel

L'API est déjà déployée et accessible à l'adresse suivante :
👉 [Ace Attorney API](https://ace-attorneydle-api.vercel.app/)

## Structure du projet
```
/ Ace Attorney API
├── data/                     # Données JSON (personnages, affaires, citations, etc.)
├── index.js                  # Serveur principal
├── package.json              # Dépendances et configuration du projet
├── vercel.json               # Configuration pour le déploiement Vercel
```

## Technologies utilisées
- Node.js
- Express
- CORS
- Body-parser
- Vercel (pour le déploiement)

## Auteurs et Crédits
Développé par [@JJ-vle](https://github.com/JJ-vle) et [@BeignetBoyy](https://github.com/BeignetBoyy).