// Dépendances ajoutées
const express = require("express");
// Sanatize pour la sécurité
const mongoSanitize = require("express-mongo-sanitize");
// importation Helmet
const helmet = require("helmet");
// limitation conncexion adresse IP bloquage d'ip.
const rateLimit = require("express-rate-limit");
// Créé une application express
const app = express();

// Eviter les erreurs CORS
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

	// La réponse à la demande faite en amont doit avoir un statut HTTP ok (il nous permet d'utiliser "router.use(middleware)" sans erreurs CORS)
	if (req.method === "OPTIONS") return res.sendStatus(200);

	next();
});

// Eviter "/images" URLs considérés comme routes/requests
app.use("/images", express.static("images"));

// Parse les requêtes avec JSON & créer un "body" object (req.body)
app.use(express.json());

// Sanitize les requêtes "data" pour éviter une inflitration dans l'opérateur MongoDB 
app.use(mongoSanitize());

// Limiter le nombre de requête API
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limiter chaques IP à 100 requêtes par 'fenêtre' (ici, par 15 minutes)
	standardHeaders: true, // Retourner la rate limit info dans `RateLimit-*` headers
	legacyHeaders: false, // Désactiver `X-RateLimit-*` headers
});

// Appliquer la limitation de débit middleware-API appel uniquement
app.use("/api", apiLimiter);

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

// Exporter la constante pour y acceder depuis les autres fichiers
module.exports = app;

