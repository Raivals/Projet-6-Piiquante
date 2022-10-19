const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
	userId: { type: String, required: true, immutable: true },
	name: {
		type: String,
		required: [true, "Le nom est requis."],
		maxLength: [50, "Le nom ne doit pas excéder 50 caractères."],
		match: [
			/^[a-zA-Z\d '\-]*$/,
			"Le nom est invalide. Caractères autorisés :\n- lettres minuscules\n- lettres majuscules\n- chiffres\n- autres ('- )",
		],
	},
	manufacturer: {
		type: String,
		required: true,
		maxLength: 50,
		match: [
			/^[a-zA-Z\d '\-()]*$/,
			"Le champ manufacturer est invalide. Caractères autorisés :\n- lettres minuscules\n- lettres majuscules\n- chiffres\n- autres ('- ())",
		],
	},
	description: {
		type: String,
		required: true,
		maxLength: 500,
	},
	mainPepper: {
		type: String,
		required: true,
		maxLength: 50,
		match: [
			/^[a-zA-Z\d '\-]*$/,
			"Le champ main pepper est invalide. Caractères autorisés :\n- lettres minuscules\n- lettres majuscules\n- chiffres\n- autres ('- )",
		],
	},
	imageUrl: { type: String, required: true },
	heat: { type: Number, required: true, min: 1, max: 10 },
	likes: { type: Number, required: true },
	dislikes: { type: Number, required: true },
	usersLiked: { type: [String], required: true },
	usersDisliked: { type: [String], required: true },
});

/**
 * Ajouter un like à la sauce et ajouter l'utilisateur qui a liké à la liste des utilisateurs qui ont déjà liké.
 * @param {string} userId L'id de l'utilisateur qui a liké la sauce.
 */
sauceSchema.methods.like = function (userId) {
	this.likes++;
	this.usersLiked.push(userId);
};

/**
 * Ajouter un dislike à la sauce et ajouter l'utilisateur qui a dislike à la liste des users qui ont déjà dislike.
 * @param {string} userId L'id de l'utilisateur qui a dislike la sauce.
 */
sauceSchema.methods.dislike = function (userId) {
	this.dislikes++;
	this.usersDisliked.push(userId);
};

/**
 * Retirer un like de la sauce et retirer l'utilisateur qui a unlike de la liste des utilisateurs qui ont like.
 * @param {string} userId L'id de l'utilisateur qui a unlike la sauce.
 */
sauceSchema.methods.unlike = function (userId) {
	this.likes--;
	this.usersLiked.splice(this.usersLiked.indexOf(userId), 1);
};

/**
 * Retirer un dislike de la sauce et retirer l'utilisateur qui a undislike de la liste des utilisateurs qui ont dislike.
 * @param {string} userId L'id de l'utilisateur qui a undislike.
 */
sauceSchema.methods.undislike = function (userId) {
	this.dislikes--;
	this.usersDisliked.splice(this.usersDisliked.indexOf(userId), 1);
};

/**
 * Vérifier si l'utilisateur a déjà like la sauce ou non.
 * @param {string} userId
 * @return {boolean} Booléen true si la sauce est déjà liké par l'utilisateur, faux si non.
 */
sauceSchema.methods.hasLiked = function (userId) {
	return this.usersLiked.find(id => id === userId);
};

/**
 * Vérifier si l'utilisateur a déjà dislike la sauce ou non.
 * @param {string} userId
 * @return {boolean} Booléen vrai si la sauce est déjà dislike par l'utilisateur, faux si non.
 */
sauceSchema.methods.hasDisliked = function (userId) {
	return this.usersDisliked.find(id => id === userId);
};

module.exports = mongoose.model("Sauce", sauceSchema);
