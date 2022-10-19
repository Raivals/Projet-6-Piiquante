// Configurer les routes d'authentification 
// importation plugin Bcrypt
const bcrypt = require("bcrypt");
// importation plugin jsonwebtoken
const jwt = require("jsonwebtoken");
const validator = require("validator");
// Modèle User
const User = require("../models/User");

/* VERIFICATION INPUT */

/**  
* Vérifier si l'input mot de passe est valide ou non
* Si pas valide, jouer une erreur
* @param {*} data La data à vérifier.
*/
const checkPassword = data => {
	// vérifier si la valeur date n'est pas vide, non définie ou nulle
	if (data === "" || data === undefined || data === null)
		throw Error("Mot de passe requis.");
	// vérifier si la type de data est correcte
	else if (typeof data !== "string")
		throw Error("Le mot de passe doit être une chaîne de caractères.");
	// vérifier si la valeur de la data est correcte
	else if (!(data.length <= 50))
		throw Error("Le mot de passe ne doit pas excéder 50 caractères.");
	// vérifier la "force" du mot de passe
	else if (!validator.isStrongPassword(data))
		throw Error(
			"Le mot de passe n'est pas valide. Liste des requis :\n- 8 caractères minimum\n- 1 lettre minuscule\n- 1 lettre majuscule\n- 1 chiffre\n- 1 symbole"
		);
};

// Requêtes

/**
 *  Enregistrer un nouvel utilisateur et le stocké dans la database.
 * 
 * Si une erreur est détectée (checkings, etc ..), envoyer un code 400 (mauvaise requête) au client.
 * 
 * Si tout se passe bien, envoyer un code 201 (créé) au client.
 * @param {*} req
 * @param {*} res
 * @returns Si une erreur est détectée, arrêter le proocessus en attrapant l'erreur (catch)ou en retournant la fonction.
 */
exports.signup = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		checkPassword(password);
		 // On hash le mot de passe pour la sécurité
		const hashedPassword = await bcrypt.hash(password, 10);

		// L'email input est validé ici
		await User.create({
			email,
			password: hashedPassword,
		});

		res.status(201).json({ message: "Utilisateur créé !" });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

/**
 * Connecter un utilisateur
 * 
 * Si unbe erreur estr detéctée (checkings etc..), envoyé un code 400 (mauvaise requête) ou un code 500 (erreur serveur interne) au client.
 * 
 * Si tout se passe bien, envoyer un code 200 (OK) au client avec un token d'acces.
 * @param {*} req
 * @param {*} res
 * @returns Si une erreur est détectée, on stop le processus en attrapant l'erreur (.catch) ou en retournant la fonction.
 */
exports.login = async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const WRONG_LOGIN_ERROR_MSG = "L'email ou le mot de passe est incorrect.";

	// Vérification des inputs email & mot de passe
	try {
		// L'email et le Mot de passe sont requis
		if (email === "" || email === undefined || email === null)
			throw Error("Email requis.");

		if (password === "" || password === undefined || password === null)
			throw Error("Mot de passe requis.");
	} catch (e) {
		return res.status(400).json({ message: e.message });
	}

	// Vérifier si l'email existe
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ message: WRONG_LOGIN_ERROR_MSG });

	// Vérifier si le mot de passe est bon
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) return res.status(401).json({ message: WRONG_LOGIN_ERROR_MSG });

	// Génération d'un Token & envoie d'une réponse
	const userId = user._id;
	try {
		const token = jwt.sign({ userId }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: "24h",
		});

		res.status(200).json({ userId, token });
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: e.message });
	}
};
