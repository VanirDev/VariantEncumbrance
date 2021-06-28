import { DND5E } from "../../../systems/dnd5e/module/config.js";

export const VARIANT_ENCUMBRANCE_MODULE_NAME = VARIANT_ENCUMBRANCE_MODULE_NAME;

export const registerSettings = function () {
	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "enabled", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.enabled.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.enabled.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "lightMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.lightMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.lightMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 5
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "mediumMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.mediumMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.mediumMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 10
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.heavyMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.heavyMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 15,
		onChange: value => {
			DND5E.encumbrance.strMultiplier = value;
		}
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "useVariantEncumbrance", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.useVariantEncumbrance.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.useVariantEncumbrance.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "unequippedMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.unequippedMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.unequippedMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "equippedMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.equippedMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.equippedMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "profEquippedMultiplier", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.profEquippedMultiplier.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.profEquippedMultiplier.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: "1"
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "currencyWeight", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.currencyWeight.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.currencyWeight.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 50,
		onChange: value => {
			DND5E.encumbrance.currencyPerWeight = value;
		}
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "sizeMultipliers", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.sizeMultipliers.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.sizeMultipliers.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: true
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "units", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.units.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.units.hint"),
		scope: "world",
		config: true,
		type: String,
		default: "lbs."
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "lightWeightDecrease", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.lightWeightDecrease.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.lightWeightDecrease.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 10
	});

	game.settings.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyWeightDecrease", {
		name : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.heavyWeightDecrease.name"),
		hint : game.i18n.localize(VARIANT_ENCUMBRANCE_MODULE_NAME+".setting.heavyWeightDecrease.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 20
	});
};
