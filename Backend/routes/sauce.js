const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authorize");
const uploadImage = require("../middlewares/uploadImage");

const Sauce = require("../models/Sauce");
const sauceCtrl = require("../controllers/sauce");

// Le token doit être autorisé sur chaques route de sauces.
router.use(auth.token);

router
	.route("/")
	.get(sauceCtrl.getAllSauces)
	.post(uploadImage, sauceCtrl.createSauce);

router
	.route("/:id")
	.get(sauceCtrl.getOneSauce)
	.put(auth.sauce, uploadImage, sauceCtrl.updateSauce)
	.delete(auth.sauce, sauceCtrl.deleteSauce);

router.post("/:id/like", sauceCtrl.likeSauce);

// Essayer de récupérer la sauce sur chaques route requise en tant que middleware avant la partie controllers.
router.param("id", async (req, res, next, sauceId) => {
	try {
		const sauce = await Sauce.findById(sauceId);

		if (!sauce)
			return res.status(404).json({ message: "Sauce introuvable..." });

		res.locals.sauce = sauce;

		next();
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
});

module.exports = router;
