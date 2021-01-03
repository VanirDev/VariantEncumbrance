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
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log('VariantEncumbrance | Initializing VariantEncumbrance');

	// Assign custom classes and constants here

	// Register custom module settings
	registerSettings();
	DND5E.encumbrance.strMultiplier = game.settings.get("VariantEncumbrance", "heavyMultiplier");
	DND5E.encumbrance.currencyPerWeight = game.settings.get("VariantEncumbrance", "currencyWeight");
	CONFIG.debug.hooks = true;
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
	// Do anything after initialization but before
	// ready

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
		if (htmlElement[0].tagName == "FORM" && htmlElement[0].id == "") {
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

		if (encumbranceData.encumbranceTier == 1) {
			encumbranceElements[0].classList.add("medium");
		}
		if (encumbranceData.encumbranceTier == 2) {
			encumbranceElements[0].classList.add("heavy");
		}
		if (encumbranceData.encumbranceTier == 3) {
			encumbranceElements[0].classList.add("max");
		}

		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-down').parent().css("margin-bottom", "16px");
		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.lightMax}<div>`);
		htmlElement.find('.encumbrance-breakpoint.encumbrance-66.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${encumbranceData.mediumMax}<div>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel" style="right:0%">${encumbranceData.heavyMax}</span>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel">0</span>`);
	}
});

Hooks.on('updateOwnedItem', function (actorObject, updatedItem, updateChanges) {
	let actorEntity = game.actors.get(actorObject.data._id);

	let itemSet = convertItemSet(actorEntity);
	itemSet[updatedItem._id] = veItem(updatedItem);

	if (actorEntity.data.type == "character") {
		updateEncumbrance(actorObject, itemSet);
	}
});

Hooks.on('createOwnedItem', function (actorObject, updatedItem) {
	let actorEntity = game.actors.get(actorObject.data._id);

	let itemSet = convertItemSet(actorEntity);
	itemSet[updatedItem._id] = veItem(updatedItem);

	if (actorEntity.data.type == "character") {
		updateEncumbrance(actorObject, itemSet);
	}
});

Hooks.on('deleteOwnedItem', function (actorObject, updatedItem) {
	let actorEntity = game.actors.get(actorObject.data._id);

	let itemSet = convertItemSet(actorEntity);
	delete itemSet[updatedItem._id];

	if (actorEntity.data.type == "character") {
		updateEncumbrance(actorObject);
	}
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
	const weightlessCategoryIds = [];
	const inventoryPlusCategories = actorEntity.getFlag('inventory-plus', 'categorys');
	if (inventoryPlusCategories) {
		for (const categoryId in inventoryPlusCategories) {
			if (inventoryPlusCategories.hasOwnProperty(categoryId) && inventoryPlusCategories[categoryId]?.ignoreWeight) {
				weightlessCategoryIds.push(categoryId);
			}
		}
	}
	actorEntity.items.forEach(item => {
		const hasWeight = !!item.data.data.weight;
		const isNotInWeightlessCategory = weightlessCategoryIds.indexOf(item.getFlag('inventory-plus', 'category')) < 0;
		if (hasWeight && isNotInWeightlessCategory) {
			itemSet[item.data._id] = veItem(item.data);
		}
	});
	console.log(itemSet);
	return itemSet;
}

function updateEncumbrance(actorEntity, itemSet) {
	if (actorEntity.data.type != "character") {
		console.log("ERROR: NOT A CHARACTER");
		return null;
	}
	console.log(actorEntity);
	if (itemSet == null) {
		itemSet = convertItemSet(actorEntity);
	}
	let encumbranceData = calculateEncumbrance(actorEntity, itemSet);
	console.log(encumbranceData);

	let effectTiersPresent = 0;
	let effectTierChanged = false;
	actorEntity.effects.forEach(effectEntity => {
		if (effectEntity.data?.flags?.VariantEncumbrance) {
			effectTiersPresent++;
			if (effectEntity.data?.flags?.VariantEncumbrance?.tier != encumbranceData.encumbranceTier) {
				console.log("DELETING");
				effectEntity.delete();
				effectTiersPresent--;
				effectTierChanged = true;
			}
		}
	});

	console.log("#### VE DEBUG: " + effectTierChanged + " | " + effectTiersPresent);
	if (effectTierChanged || effectTiersPresent == 0) {
		if (encumbranceData.encumbranceTier != 0) {
			let changeMode = encumbranceData.encumbranceTier >= 3 ? 1 : 2;
			let changeValue = encumbranceData.encumbranceTier >= 3 ? 0 : encumbranceData.speedDecrease * -1;
			if (!game.settings.get("VariantEncumbrance", "useVariantEncumbrance")) {
				changeMode = 2;
				changeValue = 0;
			}
			let effectIconURL;
			let effectName;
			switch (encumbranceData.encumbranceTier) {
				case 1:
					effectName = "Lightly Encumbered";
					break;
				case 2:
					effectName = "Heavily Encumbered";
					break
				case 3:
					effectName = "Overburdened";
					break;
				default:
					break;
			}

			let effect = {
				label: effectName,
				icon: "icons/tools/smithing/anvil.webp",
				changes: [
					{
						key: "data.attributes.movement.walk",
						value: changeValue,
						mode: changeMode,
						priority: 1000
					},
					{
						key: "data.attributes.movement.swim",
						value: changeValue,
						mode: changeMode,
						priority: 1000
					},
					{
						key: "data.attributes.movement.fly",
						value: changeValue,
						mode: changeMode,
						priority: 1000
					},
					{
						key: "data.attributes.movement.climb",
						value: changeValue,
						mode: changeMode,
						priority: 1000
					},
					{
						key: "data.attributes.movement.burrow",
						value: changeValue,
						mode: changeMode,
						priority: 1000
					}
				],
				flags: {
					VariantEncumbrance: {
						tier: encumbranceData.encumbranceTier
					}
				},
				origin: `Actor.${actorEntity.data._id}`
			};

			actorEntity.createEmbeddedEntity("ActiveEffect", effect);
		}
	}
	actorEntity.applyActiveEffects();
	actorEntity.setFlag("VariantEncumbrance", "speed", actorEntity.data.data.attributes.movement.walk);
	actorEntity.setFlag("VariantEncumbrance", "tier", encumbranceData.encumbranceTier);
	actorEntity.setFlag("VariantEncumbrance", "weight", encumbranceData.totalWeight);
}

function calculateEncumbrance(actorEntity, itemSet) {
	if (actorEntity.data.type != "character") {
		console.log("ERROR: NOT A CHARACTER");
		return null;
	}

	if (itemSet == null) {
		itemSet = convertItemSet(actorEntity);
	}

	let speedDecrease = 0;
	var totalWeight = 0;
	var strengthScore = actorEntity.data.data.abilities.str.value;
	if (game.settings.get("VariantEncumbrance", "sizeMultipliers")) {
		var size = actorEntity.data.data.traits.size;
		if (size == "tiny") {
			strengthScore /= 2;
		} else if (size == "lg") {
			strengthScore *= 2;
		} else if (size == "huge") {
			strengthScore *= 4;
		} else if (size == "grg") {
			strengthScore *= 8;
		} else {
			strengthScore *= 1;
		}

		if (actorEntity.data?.flags?.dnd5e?.powerfulBuild) { //jshint ignore:line
			strengthScore *= 2;
		}
	}
	var lightMax = game.settings.get("VariantEncumbrance", "lightMultiplier") * strengthScore;
	var mediumMax = game.settings.get("VariantEncumbrance", "mediumMultiplier") * strengthScore;
	var heavyMax = game.settings.get("VariantEncumbrance", "heavyMultiplier") * strengthScore;

	Object.values(itemSet).forEach(item => {
		var appliedWeight = item.totalWeight;
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
		var totalCoins = 0;
		Object.values(actorEntity.data.data.currency).forEach(count => {
			totalCoins += count;
		});
		totalWeight += totalCoins / game.settings.get("VariantEncumbrance", "currencyWeight");
	}

	let encumbranceTier = 0;
	if (totalWeight >= lightMax && totalWeight < mediumMax) {
		speedDecrease = 10;
		encumbranceTier = 1;
	}
	if (totalWeight >= mediumMax && totalWeight < heavyMax) {
		speedDecrease = 20;
		encumbranceTier = 2;
	}
	if (totalWeight >= heavyMax) {
		encumbranceTier = 3;
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
