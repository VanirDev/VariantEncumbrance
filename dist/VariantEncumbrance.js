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
import ActorSheet5e from "../../systems/dnd5e/module/actor/sheets/base.js";
import ActorSheet5eCharacter from "../../systems/dnd5e/module/actor/sheets/character.js";

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
	//CONFIG.debug.hooks = true;
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
		var encumbranceElements;
		var speedDecrease = 0;
		if (htmlElement[0].tagName == "FORM" && htmlElement[0].id == "") {
			encumbranceElements = htmlElement.find('.encumbrance')[0].children;
		} else {
			encumbranceElements = htmlElement.find('.encumbrance')[0].children;
		}
		var totalWeight = 0;
		var strengthScore = actorObject.data.abilities.str.value;
		if (game.settings.get("VariantEncumbrance", "sizeMultipliers")) {
			var size = actorObject.data.traits.size;
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
			if (actorObject.actor.flags.dnd5e.powerfulBuild) {
				strengthScore *= 2;
			}
		}
		var lightMax = game.settings.get("VariantEncumbrance", "lightMultiplier") * strengthScore;
		var mediumMax = game.settings.get("VariantEncumbrance", "mediumMultiplier") * strengthScore;
		var heavyMax = game.settings.get("VariantEncumbrance", "heavyMultiplier") * strengthScore;

		Object.keys(actorObject.inventory).forEach(categoryKey => {
			var category = actorObject.inventory[categoryKey];
			category.items.forEach(item => {
				var appliedWeight = item.totalWeight;
				if (item.data.equipped) {
					if (item.data.proficient) {
						appliedWeight *= game.settings.get("VariantEncumbrance", "profEquippedMultiplier");
					} else {
						appliedWeight *= game.settings.get("VariantEncumbrance", "equippedMultiplier");
					}
				}
				totalWeight += appliedWeight;
			});
		});


		if (game.settings.get("dnd5e", "currencyWeight")) {
			var totalCoins = 0;
			Object.values(actorObject.data.currency).forEach(count => {
				totalCoins += count;
			});
			totalWeight += totalCoins / game.settings.get("VariantEncumbrance", "currencyWeight");
		}

		encumbranceElements[2].style.left = (lightMax / heavyMax * 100) + "%";
		encumbranceElements[3].style.left = (lightMax / heavyMax * 100) + "%";
		encumbranceElements[4].style.left = (mediumMax / heavyMax * 100) + "%";
		encumbranceElements[5].style.left = (mediumMax / heavyMax * 100) + "%";
		encumbranceElements[0].style.cssText = "width: " + Math.min(Math.max((totalWeight / heavyMax * 100), 0), 99.8) + "%;";
		encumbranceElements[1].textContent = Math.round(totalWeight * 100) / 100 + " lbs.";

		encumbranceElements[0].classList.remove("medium");
		encumbranceElements[0].classList.remove("heavy");

		if (totalWeight >= lightMax && totalWeight < mediumMax) {
			encumbranceElements[0].classList.add("medium");
			speedDecrease = 10;
		}
		if (totalWeight >= mediumMax && totalWeight < heavyMax) {
			encumbranceElements[0].classList.add("heavy");
			speedDecrease = 20;
		}
		if (totalWeight >= heavyMax) {
			encumbranceElements[0].classList.add("max");
		}

		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-down').parent().css("margin-bottom", "16px");
		//$('.encumbrance-breakpoint.encumbrance-33.arrow-down').parent().css("margin-bottom", "16px");
		htmlElement.find('.encumbrance-breakpoint.encumbrance-33.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${lightMax}<div>`);
		//$('.encumbrance-breakpoint.encumbrance-33.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${lightMax}<div>`);
		htmlElement.find('.encumbrance-breakpoint.encumbrance-66.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${mediumMax}<div>`);
		//$('.encumbrance-breakpoint.encumbrance-66.arrow-down').append(`<div class="encumbrance-breakpoint-label VELabel">${mediumMax}<div>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel" style="right:0%">${heavyMax}</span>`);
		encumbranceElements[1].insertAdjacentHTML('afterend', `<span class="VELabel">0</span>`);

		if (game.settings.get("VariantEncumbrance", "useVariantEncumbrance")) {
			var newSpeed = actorObject.data.attributes.speed.value.split(" ")[0];
			if (isNaN(newSpeed)) {
				newSpeed = "?"
			} else {
				if (totalWeight >= heavyMax) {
					newSpeed = 0;
				} else {
					newSpeed -= speedDecrease;
				}
			}
			htmlElement.find('[name="data.attributes.speed.value"]').before(`<span class="VESpeed">${newSpeed} /</span>`);
			//$('[name="data.attributes.speed.value"]').before(`<span class="VESpeed">${newSpeed} /</span>`);
			htmlElement.find('[name="data.attributes.speed.value"]').addClass(`DnDSpeed`);
			//$('[name="data.attributes.speed.value"]').addClass(`DnDSpeed`);
			htmlElement.find('[name="data.attributes.speed.value"]').parent().css("width", "100%");
			//$('[name="data.attributes.speed.value"]').parent().css("width", "100%");
			htmlElement.find('[name="data.attributes.speed.value"]').parent().css("display", "flex");
			//$('[name="data.attributes.speed.value"]').parent().css("display", "flex");
		}
	}
})

// Add any additional hooks if necessary
