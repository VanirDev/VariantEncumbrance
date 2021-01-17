/**
 * This is your JavaScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */

// Import JavaScript modules
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { DND5E } from "../../systems/dnd5e/module/config.js";

/* ------------------------------------ */
/* Constants         					*/
/* ------------------------------------ */
const ENCUMBRANCE_TIERS = {
	NONE: 0,
	LIGHT: 1,
	HEAVY: 2,
	MAX: 3,
};


/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log('VariantEncumbrance | Initializing VariantEncumbrance');

	// Assign custom classes and constants here

	// Register custom module settings
	registerSettings();
	DND5E.encumbrance.strMultiplier = game.settings.get("VariantEncumbrance", "heavyMultiplier");
	DND5E.encumbrance.currencyPerWeight = game.settings.get("VariantEncumbrance", "currencyWeight");
	CONFIG.debug.hooks = true; // For debugging only
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
	// Do anything after initialization but before ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
	// Do anything once the module is ready
});

Hooks.on('renderActorSheet', function (actorSheet, htmlElement, actorObject) {
	if (actorObject.isCharacter) {
		let actorEntity = game.actors.get(actorObject.actor._id);
		let encumbranceData = calculateEncumbrance(actorEntity);

		let encumbranceElements;
		if (htmlElement[0].tagName === "FORM" && htmlElement[0].id === "") {
			encumbranceElements = htmlElement.find('.encumbrance')[0].children;
		} else {
			encumbranceElements = htmlElement.find('.encumbrance')[0].children;
		}

		encumbranceElements[2].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax * 100) + "%";
		encumbranceElements[3].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax * 100) + "%";
		encumbranceElements[4].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax * 100) + "%";
		encumbranceElements[5].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax * 100) + "%";
		encumbranceElements[0].style.cssText = "width: " + Math.min(Math.max((encumbranceData.totalWeight / encumbranceData.heavyMax * 100), 0), 99.8) + "%;";
		encumbranceElements[1].textContent = Math.round(encumbranceData.totalWeight * 100) / 100 + " lbs.";

		encumbranceElements[0].classList.remove("medium");
		encumbranceElements[0].classList.remove("heavy");

		if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.LIGHT) {
			encumbranceElements[0].classList.add("medium");
		}
		if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.HEAVY) {
			encumbranceElements[0].classList.add("heavy");
		}
		if (encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.MAX) {
			encumbranceElements[0].classList.add("max");
		}

		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-up').parent().css("margin-bottom", "4px");
		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-up').append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.lightMax}<div>`);
		htmlElement.find('.encumbrance-breakpoint.encumbrance-66.arrow-up').append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.mediumMax}<div>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel" style="right:0%">${encumbranceData.heavyMax}</span>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel">0</span>`);
	}
});

Hooks.on('updateOwnedItem', function (actorEntity, updatedItem, updateChanges, _, userId) {
	if (game.userId !== userId) {
		// Only act if we initiated the update ourselves
		return;
	}

	updateEncumbrance(actorEntity, updatedItem);
});

Hooks.on('createOwnedItem', function (actorEntity, createdItem, _, userId) {
	if (game.userId !== userId) {
		// Only act if we initiated the update ourselves
		return;
	}

	updateEncumbrance(actorEntity);
});

Hooks.on('deleteOwnedItem', function (actorEntity, deletedItem, _, userId) {
	if (game.userId !== userId) {
		// Only act if we initiated the update ourselves
		return;
	}

	updateEncumbrance(actorEntity);
})

function veItem(item) {
	return {
		_id: item._id,
		weight: item.data.weight,
		count: item.data.quantity,
		totalWeight: item.data.weight * item.data.quantity,
		proficient: item.data.proficient,
		equipped: item.data.equipped
	}
}

function convertItemSet(actorEntity) {
	let itemSet = {};
	actorEntity.items.forEach(item => {
		if (item.data.data.weight != undefined) {
			itemSet[item.data._id] = veItem(item.data);
		}
	});

	return itemSet;
}

async function updateEncumbrance(actorEntity, updatedItem) {
	if (game.actors.get(actorEntity.data._id).data.type !== "character") {
		return;
	}
	const itemSet = convertItemSet(actorEntity);
	if (updatedItem) {
		// On update operations, the actorEntity's items have not been updated.
		// Override the entry for this item using the updatedItem data.
		itemSet[updatedItem._id] = veItem(updatedItem);
	}
	let encumbranceData = calculateEncumbrance(actorEntity, itemSet);

	let effectEntityPresent = null;

	for (const effectEntity of actorEntity.effects) {
		if (typeof effectEntity.getFlag('VariantEncumbrance', 'tier') === 'number') {
			if (!effectEntityPresent) {
				effectEntityPresent = effectEntity;
			} else {
				// Cannot have more than one effect tier present at any one time
				console.log("VariantEncumbrance | deleting duplicate effect", effectEntity);
				await effectEntity.delete();
			}
		}
	}

	let [changeMode, changeValue] = encumbranceData.encumbranceTier >= ENCUMBRANCE_TIERS.MAX ?
		[ACTIVE_EFFECT_MODES.MULTIPLY, 0] :
		[ACTIVE_EFFECT_MODES.ADD, encumbranceData.speedDecrease * -1];

	if (!game.settings.get("VariantEncumbrance", "useVariantEncumbrance")) {
		changeMode = ACTIVE_EFFECT_MODES.ADD;
		changeValue = 0;
	}
	let effectName;
	switch (encumbranceData.encumbranceTier) {
		case ENCUMBRANCE_TIERS.NONE:
			effectName = "Unencumbered";
			break;
		case ENCUMBRANCE_TIERS.LIGHT:
			effectName = "Lightly Encumbered";
			break;
		case ENCUMBRANCE_TIERS.HEAVY:
			effectName = "Heavily Encumbered";
			break
		case ENCUMBRANCE_TIERS.MAX:
			effectName = "Overburdened";
			break;
		default:
			return;
	}

	const changes = ['walk', 'swim', 'fly', 'climb', 'burrow'].map((movementType) => {
		const changeKey = "data.attributes.movement." + movementType;
		return {
			key: changeKey,
			value: changeValue,
			mode: changeMode,
			priority: 1000
		};
	});

	let effectChange = {
		disabled: encumbranceData.encumbranceTier === ENCUMBRANCE_TIERS.NONE,
		label: effectName,
		icon: "icons/tools/smithing/anvil.webp",
		changes: changes,
		flags: {
			VariantEncumbrance: {
				tier: encumbranceData.encumbranceTier
			}
		},
		origin: `Actor.${actorEntity.data._id}`
	};

	if (effectChange) {
		if (effectEntityPresent) {
			await effectEntityPresent.update(effectChange);
		} else {
			await actorEntity.createEmbeddedEntity("ActiveEffect", effectChange);
		}
	}

	await actorEntity.applyActiveEffects();

	const { speed, tier, weight } = (actorEntity.data.flags.VariantEncumbrance || {});
	if (speed !== actorEntity.data.data.attributes.movement.walk) {
		actorEntity.setFlag("VariantEncumbrance", "speed", actorEntity.data.data.attributes.movement.walk);
	}
	if (tier !== encumbranceData.encumbranceTier) {
		actorEntity.setFlag("VariantEncumbrance", "tier", encumbranceData.encumbranceTier);
	}
	if (weight !== encumbranceData.totalWeight) {
		actorEntity.setFlag("VariantEncumbrance", "weight", encumbranceData.totalWeight);
	}
}

function calculateEncumbrance(actorEntity, itemSet) {
	if (actorEntity.data.type !== "character") {
		console.log("ERROR: NOT A CHARACTER");
		return null;
	}

	if (itemSet === null || itemSet === undefined) {
		itemSet = convertItemSet(actorEntity);
	}

	let speedDecrease = 0;
	let totalWeight = 0;
	let strengthScore = actorEntity.data.data.abilities.str.value;
	if (game.settings.get("VariantEncumbrance", "sizeMultipliers")) {
		const size = actorEntity.data.data.traits.size;
		if (size === "tiny") {
			strengthScore /= 2;
		} else if (size === "lg") {
			strengthScore *= 2;
		} else if (size === "huge") {
			strengthScore *= 4;
		} else if (size === "grg") {
			strengthScore *= 8;
		} else {
			strengthScore *= 1;
		}

		if (actorEntity.data?.flags?.dnd5e?.powerfulBuild) { //jshint ignore:line
			strengthScore *= 2;
		}
	}
	const lightMax = game.settings.get("VariantEncumbrance", "lightMultiplier") * strengthScore;
	const mediumMax = game.settings.get("VariantEncumbrance", "mediumMultiplier") * strengthScore;
	const heavyMax = game.settings.get("VariantEncumbrance", "heavyMultiplier") * strengthScore;

	console.log(itemSet)
	Object.values(itemSet).forEach(item => {
		let appliedWeight = item.totalWeight;
		if (item.equipped) {
			if (item.proficient) {
				appliedWeight *= game.settings.get("VariantEncumbrance", "profEquippedMultiplier");
			} else {
				appliedWeight *= game.settings.get("VariantEncumbrance", "equippedMultiplier");
			}
		} else {
			appliedWeight *= game.settings.get("VariantEncumbrance", "unequippedMultiplier");
		}
		totalWeight += appliedWeight;
	});

	if (game.settings.get("dnd5e", "currencyWeight")) {
		let totalCoins = 0;
		Object.values(actorEntity.data.data.currency).forEach(count => {
			totalCoins += count;
		});
		totalWeight += totalCoins / game.settings.get("VariantEncumbrance", "currencyWeight");
	}

	let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
	if (totalWeight >= lightMax && totalWeight < mediumMax) {
		speedDecrease = 10;
		encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
	}
	if (totalWeight >= mediumMax && totalWeight < heavyMax) {
		speedDecrease = 20;
		encumbranceTier = ENCUMBRANCE_TIERS.HEAVY;
	}
	if (totalWeight >= heavyMax) {
		encumbranceTier = ENCUMBRANCE_TIERS.MAX;
	}

	return {
		totalWeight: totalWeight,
		lightMax: lightMax,
		mediumMax: mediumMax,
		heavyMax: heavyMax,
		encumbranceTier: encumbranceTier,
		speedDecrease: speedDecrease
	}
}
