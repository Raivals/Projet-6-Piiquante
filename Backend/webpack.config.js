const nodeExternals = require("webpack-node-externals");

module.exports = {
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	mode: "production",
	entry: "./server.js",
	output: {
		filename: "bundle.js",
		clean: true,
	},
};
