export const registerSettings = function () {
	// Register any custom module settings here
	game.settings.register("customEncumbrance", "strengthMultiplier", {
		name: "Strength Multiplier",
		hint: "Choose the multiplier used to calculate maximum carrying weight from the strength ability score.",
		scope: "world",
		config: true,
		type: Number,
		default: 15
	});

	game.settings.registeR("customEncumbrance", "useVariantEncumbranceSpeed", {
		name: "Variant Encumbrance Speed Penalties",
		hint: "Enable automatic speed penalties from carry weight.",
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	})

	game.settings.register("customEncumbrance", "currencyWeight", {
		name: "Currency Per Weight Unit",
		hint: "Define the number of coins required to equal 1 unit of weight.",
		scope: "world",
		config: true,
		type: Number,
		default: 50
	});
}
