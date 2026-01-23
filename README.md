# Ace Attorney API Server

This project is a Node.js server using Express to manage an API related to the Ace Attorney universe. It allows you to retrieve characters, quotes, and cases, and to manage queues for a game based on these elements. This API is used as part of [AceAttorneydle](https://github.com/JJ-vle/AceAttorneydle).

## Installation and Startup

### Prerequisites

* [Node.js](https://nodejs.org/) installed on your machine

### Installing dependencies

Clone this repository and install the dependencies with the following command:

```sh
npm install
```
> The database-based version requires access to our database, so it is recommended to use the version from the `gamequeuesfile` branch instead.

### Running the server locally

```sh
node index.js
```

The server will run on port `3000` by default, unless another port is specified via the `PORT` environment variable.

## API Routes

### Get an item to guess

```http
GET /api/item-to-find/:mode/:filter?
```

* `mode`: `guess`, `silhouette`, `quote`, or `case`
* `filter` (optional): (`Main`, `Investigation`, `Great`) Corresponds to the different Ace Attorney game groups released.

### Get character information

```http
GET /api/character/:name
```

* `name`: Character name (case- and space-sensitive)

### Get all data

```http
GET /api/characters   # List of characters
GET /api/quotes       # List of quotes
GET /api/cases        # List of cases
GET /api/turnabouts   # List of groups and games for each case
```

## Main Features

* Filtering of valid characters and cases
* Queue management for the game
* Automatic queue rotation every 5 minutes
* Optimized deployment on Vercel

The API is already deployed and accessible at:
👉 [Ace Attorney API](https://ace-attorneydle-api.vercel.app/)

## Project Structure

```
/ Ace Attorney API
├── data/                     # JSON data (characters, cases, quotes, etc.)
├── index.js                  # Main server file
├── package.json              # Project dependencies and configuration
├── vercel.json               # Vercel deployment configuration
```

## Technologies Used

* Node.js
* Express
* CORS
* Body-parser
* Vercel (for deployment)

## Authors and Credits

Developed by [@JJ-vle](https://github.com/JJ-vle) and [@BeignetBoyy](https://github.com/BeignetBoyy).