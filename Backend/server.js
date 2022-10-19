const dotenv = require("dotenv");
dotenv.config();

// Connexion à la database MongoDB 
require("./database");

// Créér et configurer l'appli express
const app = require("./app");

// Création server
const http = require("http");
const server = http.createServer(app);

try {
	server.listen(process.env.PORT || 3000);
} catch (error) {
	console.error(error);
	process.exit(1); // L'appli ne peut pas tourner sans que le serveur backend soit allumé
}

server.on("listening", () => {
	console.log("Welcome to Piiquante 🌶");
	console.log(`Listening on port ${server.address().port} ✔`);
});
server.on("error", error => {
	console.error(error);
	process.exit(1);
});
