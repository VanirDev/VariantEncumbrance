import { DND5E } from "../../../systems/dnd5e/module/config.js";

export const registerSettings = function () {
	game.settings.register("VariantEncumbrance", "lightMultiplier", {
		name: "Unencumbered Strength Multiplier",
		hint: "Multiplier used to calculate maximum carrying weight before being encumbered from the strength ability score.",
		scope: "world",
		config: true,
		type: Number,
		default: 5
	});

	game.settings.register("VariantEncumbrance", "mediumMultiplier", {
		name: "Encumbered Strength Multiplier",
		hint: "Multiplier used to calculate maximum carrying weight before being heavily encumbered from the strength ability score.",
		scope: "world",
		config: true,
		type: Number,
		default: 10
	});

	game.settings.register("VariantEncumbrance", "heavyMultiplier", {
		name: "Heavily Enc. Strength Multiplier",
		hint: "Multiplier used to calculate maximum carrying weight from the strength ability score.",
		scope: "world",
		config: true,
		type: Number,
		default: 15,
		onChange: value => {
			DND5E.encumbrance.strMultiplier = value;
		}
	});

	game.settings.register("VariantEncumbrance", "useVariantEncumbrance", {
		name: "Variant Encumbrance Speed Penalties",
		hint: "Enable automatic speed penalties from carry weight.",
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

	game.settings.register("VariantEncumbrance", "unequippedMultiplier", {
		name: "Unequipped Item Weight Multiplier",
		hint: "Multiplier for items when not equipped.",
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register("VariantEncumbrance", "equippedMultiplier", {
		name: "Equipped Item Weight Multiplier",
		hint: "Multiplier for items when equipped, can be used to reduce effective weight for armour and weapons.",
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register("VariantEncumbrance", "profEquippedMultiplier", {
		name: "Proficient Equipped Item Weight Multiplier",
		hint: "Multiplier for proficient items when equipped, can be used to reduce effective weight for armour and weapons.",
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register("VariantEncumbrance", "currencyWeight", {
		name: "Currency Per Weight Unit",
		hint: "Define the number of coins required to equal 1 unit of weight.",
		scope: "world",
		config: true,
		type: Number,
		default: 50,
		onChange: value => {
			DND5E.encumbrance.currencyPerWeight = value;
		}
	});

	game.settings.register("VariantEncumbrance", "sizeMultipliers", {
		name: "Variant Encumbrance Size Modifiers",
		hint: "Enable multipliers from creature size.",
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

	game.settings.register("VariantEncumbrance", "units", {
		name: "Weight Units",
		hint: "Units displayed in the encumbrance bar.",
		scope: "world",
		config: true,
		type: String,
		default: "lbs."
	});

	game.settings.register("VariantEncumbrance", "lightWeightDecrease", {
		name: "Lightly Encumbered Speed Decrease",
		hint: "The number of speed units subtracted when lightly encumbered.",
		scope: "world",
		config: true,
		type: Number,
		default: 10
	});

	game.settings.register("VariantEncumbrance", "heavyWeightDecrease", {
		name: "Encumbered Speed Decrease",
		hint: "The number of speed units subtracted when heavily encumbered.",
		scope: "world",
		config: true,
		type: Number,
		default: 20
	});
};
