const fs = require("fs");
const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;
const IMG_DIR_PATH = "images/";
const TMP_IMG_DIR_PATH = "images/tmp/";

/* INPUT CHECKS */

/** 
 * Vérifier si le status "like" est valide ou non.
 * 
 * Si le status n'est pas valide, lancer une erreur.
 * @param {*} data La data à vérifier.
 */
const checkLikeStatus = data => {
	const GENERIC_ERROR_MSG = "Mauvais format de donnée.";

	// Vérifier si la valeur de la data est définie ou nulle 
	if (data === undefined || data === null) {
		console.error("L'état du like est requis.");
		throw Error(GENERIC_ERROR_MSG);
	}
	// Vérifier si le type de data est correcte 
	else if (typeof data !== "number") {
		console.error("L'état du like doit être un nombre.");
		throw Error(GENERIC_ERROR_MSG);
	}
	// Vérifier si la valeur de la data est correcte
	else if (!(data >= -1 && data <= 1)) {
		console.error("L'état du like doit être compris entre -1 et 1.");
		throw Error(GENERIC_ERROR_MSG);
	}
};

/* GERER LES FICHIERS D'IMAGE */

/**
 * Retirer l'image donnée du serveur.
 * @param {string} filename Le nom de l'image à retirer.
 */
const removeImage = filename => {
	fs.unlinkSync(IMG_DIR_PATH + filename);
};

/**
 * Retirer l'image donnée des fichiers temporaires du serveur.
 * @param {string} filename Le nom de l'image à retirer.
 */
const removeTemporaryImage = filename => {
	fs.unlinkSync(TMP_IMG_DIR_PATH + filename);
};

/**
 * Retirer l'image donnée des fichiers temporaires du serveur.
 * @param {string} filename Le nom de l'image à retirer.
 */
const saveImage = filename => {
	const oldPath = TMP_IMG_DIR_PATH + filename;
	const newPath = IMG_DIR_PATH + filename;

	fs.renameSync(oldPath, newPath);
};

/* REQUETES */

/** 
 * Récuperer toutes les sauces de la database
 * 
 * Si une erreur apparaît, envoyer une erreur 500 (server error) au client.
 * 
 * Si tout se passe bien, envoyer une erreur 200 (OK) au client avec la data désirée.
 * @param {*} req
 * @param {*} res
 */
exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(e => res.status(500).json({ message: e.message }));
};

/**
 * Créer une sauce et la stocker dans la database
 * 
 * Si une erreur est detectée (checkings, etc..), envoyer une erreur 400 (bad request) au client.
 * 
 * Si tout se passe bien, envoyer une erreur 201 (création) au client.
 * @param {*} req
 * @param {*} res
 * @returns Si une erreur apparaît, arrêter le processus en "attrapant" l'erreur ou en retournant la fonction.
 */
exports.createSauce = async (req, res) => {
	if (!req.file) return res.status(400).json({ message: "Image requise." });

	const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
	const filename = req.file.filename;

	// Remplace ou spécifie l'user id de la sauce en création avec l'user id du token décodé.
	sauceObject.userId = res.locals.userId;
	sauceObject.imageUrl = `${req.protocol}://${req.get(
		"host"
	)}/images/${filename}`;

	try {
		await Sauce.create({
			...sauceObject,
			likes: 0,
			dislikes: 0,
			usersLiked: [],
			usersDisliked: [],
		});

		saveImage(filename);

		res.status(201).json({ message: "Sauce enregistrée !" });
	} catch (e) {
		removeTemporaryImage(filename);

		res.status(400).json({ message: e.message });
	}
};

/**
 * Prendre une sauce de la base de donnée (database).
 * 
 * Le processus de prendre une sauce est déjà traité dans la fonction"router.param("id") dans la route de sauce suivante : (routes/sauce.js).
 * 
 * Envoyer un code 200 (OK) au client avec la donnée désirée.
 * @param {*} req
 * @param {*} res
 */
exports.getOneSauce = (req, res) => {
	res.status(200).json(res.locals.sauce);
};

/**
 * Mettre à jour une sauce stockée dans la base de donnée.
 * 
 * Si une erreur est détectée (checkings, etc..), envoyer un code 400 (bad request) au client.
 * 
 * Si tout se passe bien, envoyer un code 200 (OK) au client.
 * @param {*} req
 * @param {*} res
 * @return Si une erreur se produit ou est détectée, arrêter le processus en attrapant l'erreur ou en retournant la fonction.
 */
exports.updateSauce = async (req, res) => {
	// Bon à savoir : 2 façons de mettre à jour une sauce :
    // - Sans le fichier image => JSON ("application/json") reçu dans la requête & parsée par express.json() (req.body)
    // - Avec le fichier image => "multipart/from-data" reçu dans la requête et parsé par multer (req.file & req.body)

	const sauce = res.locals.sauce;

	 // AVEC LE FICHIER IMAGE
	if (req.headers["content-type"].includes("multipart/form-data")) {
		if (!req.file) return res.status(400).json({ message: "Image requise." });

		const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
		const filename = req.file.filename;
		const oldFilename = sauce.imageUrl.split("/images/")[1];

		sauceObject.imageUrl = `${req.protocol}://${req.get(
			"host"
		)}/images/${filename}`;
		// Peuvent être modifiés mais pas ici, supprimer ces éléments si c'est spécifié dans la requête.
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		try {
			await sauce.save();

			removeImage(oldFilename);
			saveImage(filename);

			res.status(200).json({ message: "Sauce modifiée !" });
		} catch (e) {
			removeTemporaryImage(filename);

			res.status(400).json({ message: e.message });
		}
	}
	// SANS LE FICHIER IMAGE
	else {
		const sauceObject = { ...req.body };
		// Peuvent être modifiés mais pas ici, supprimer ces éléments si c'est spécifié dans la requête.
		delete sauceObject.imageUrl;
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		sauce
			.save()
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(e => res.status(400).json({ message: e.message }));
	}
};

/**
 *  Supprimer une sauce stockée dans la base de donnée
 * 
 * Si une erreur est détectée (checkings, etc..), envoyer une erreur 400 (bad request) au client.
 * 
 * Si tout se passe bien, envoyer une erreur 200 (OK) au client.
 * @param {*} req
 * @param {*} res
 */
exports.deleteSauce = (req, res) => {
	const sauce = res.locals.sauce;
	const filename = sauce.imageUrl.split("/images/")[1];

	removeImage(filename);

	Sauce.deleteOne({ _id: sauce._id })
		.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
		.catch(e => res.status(400).json({ message: e.message }));
};

/**
 * Like une sauce stockée dans la base de donnée.
 * 
 * Si une erreur est détectée (checkings, etc..), envoyer une erreur 400 (bad request) au client.
 * 
 * Si tout se passe bien, envoyer une erreur 200 (OK) au client.
 * @param {*} req
 * @param {*} res
 * @returns Si une erreur apparaît, arrêter le processus en "attrapant" l'erreur ou en retournant la fonction.
 */
exports.likeSauce = (req, res) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;
	const likeStatus = req.body.like;

	try {
		checkLikeStatus(likeStatus);
	} catch (e) {
		return res.status(400).json({ message: e.message });
	}

	let message;

	switch (likeStatus) {
		case LIKE:
			if (sauce.hasLiked(userId)) {
				message = "Sauce déjà likée...";
				break;
			} else if (sauce.hasDisliked(userId)) {
				sauce.undislike(userId);
			}

			sauce.like(userId);
			message = "Sauce likée !";
			break;

		case DISLIKE:
			if (sauce.hasDisliked(userId)) {
				message = "Sauce déjà dislikée...";
				break;
			} else if (sauce.hasLiked(userId)) {
				sauce.unlike(userId);
			}

			sauce.dislike(userId);
			message = "Sauce dislikée !";
			break;

		case UNLIKE:
		case UNDISLIKE:
			if (sauce.hasLiked(userId)) {
				sauce.unlike(userId);
				message = "Sauce unlikée !";
			} else if (sauce.hasDisliked(userId)) {
				sauce.undislike(userId);
				message = "Sauce undislikée !";
			} else {
				message = "Sauce pas likée ni dislikée...";
			}
			break;

		default:
	}

	sauce
		.save()
		.then(() => res.status(200).json({ message }))
		.catch(e => res.status(400).json({ message: e.message }));
};
