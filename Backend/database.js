// Mongoose pour se connecter à la BDD mongoDB
const mongoose = require("mongoose");

const dotenv = require('dotenv').config()
// Connexion mongoose 
mongoose
	.connect(process.env.MONGO_DB_KEY)
	.then(() => console.log("Connected to MongoDB ✔"))
	.catch(error => {
		console.error("Failed to connect to MongoDB ✖");
		console.error(error);
	});

// Gestion des erreurs après établissement de la connexion initiale
mongoose.connection.on("error", console.error);
