const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const validator = require("validator");

const userSchema = mongoose.Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		required: true,
		maxLength: 50,
		validate: {
			validator: function (data) {
				return validator.isEmail(data);
			},
			message: "L'email n'est pas valide.",
		},
	},
	password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
