import { warn } from "../VariantEncumbrance.js";
import { getGame, VARIANT_ENCUMBRANCE_MODULE_NAME } from "./settings.js";
//@ts-ignore
import { DND5E } from "../../../systems/dnd5e/module/config.js";
import { calculateEncumbrance, ENCUMBRANCE_TIERS, updateEncumbrance } from "./VariantEncumbranceImpl.js";
export let readyHooks = async () => {
    Hooks.on('renderActorSheet', function (actorSheet, htmlElement, actorObject) {
        if (actorObject.isCharacter) {
            let actorEntity = getGame().actors?.get(actorObject.actor._id);
            let encumbranceData = calculateEncumbrance(actorEntity, null, null);
            let encumbranceElements;
            if (htmlElement[0].tagName === "FORM" && htmlElement[0].id === "") {
                encumbranceElements = htmlElement.find('.encumbrance')[0].children;
            }
            else {
                encumbranceElements = htmlElement.find('.encumbrance')[0].children;
            }
            encumbranceElements[2].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax * 100) + "%";
            encumbranceElements[3].style.left = (encumbranceData.lightMax / encumbranceData.heavyMax * 100) + "%";
            encumbranceElements[4].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax * 100) + "%";
            encumbranceElements[5].style.left = (encumbranceData.mediumMax / encumbranceData.heavyMax * 100) + "%";
            encumbranceElements[0].style.cssText = "width: " + Math.min(Math.max((encumbranceData.totalWeight / encumbranceData.heavyMax * 100), 0), 99.8) + "%;";
            encumbranceElements[1].textContent = Math.round(encumbranceData.totalWeight * 100) / 100 + " " + getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "units");
            ;
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
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, updatedItem, undefined, "add");
    });
    Hooks.on('createOwnedItem', function (actorEntity, createdItem, _, userId) {
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, undefined, undefined, "add");
    });
    Hooks.on('deleteOwnedItem', function (actorEntity, deletedItem, _, userId) {
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, undefined, undefined, "delete");
    });
    Hooks.on('updateActiveEffect', function (actorEntity, changedEffect, _, __, userId) {
        if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
            // Only act if we initiated the update ourselves, and the effect is a child of a character
            return;
        }
        if (!changedEffect?.flags.hasOwnProperty(VARIANT_ENCUMBRANCE_MODULE_NAME)) {
            updateEncumbrance(actorEntity, undefined, changedEffect, "add");
        }
    });
    Hooks.on('createActiveEffect', function (actorEntity, changedEffect, _, userId) {
        if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
            // Only act if we initiated the update ourselves, and the effect is a child of a character
            return;
        }
        if (!changedEffect?.flags.hasOwnProperty(VARIANT_ENCUMBRANCE_MODULE_NAME)) {
            updateEncumbrance(actorEntity, undefined, changedEffect, "add");
        }
    });
    Hooks.on('deleteActiveEffect', function (actorEntity, changedEffect, _, userId) {
        if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
            // Only act if we initiated the update ourselves, and the effect is a child of a character
            return;
        }
        if (!changedEffect?.flags.hasOwnProperty(VARIANT_ENCUMBRANCE_MODULE_NAME)) {
            updateEncumbrance(actorEntity, undefined, changedEffect, "delete");
        }
    });
    Hooks.on('preUpdateOwnedItem', function (actorEntity, updatedItem, updateChanges, _, userId) {
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, updatedItem, undefined, "add");
    });
    Hooks.on('preCreateOwnedItem', function (actorEntity, createdItem, _, userId) {
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, undefined, undefined, "add");
    });
    Hooks.on('preDeleteOwnedItem', function (actorEntity, deletedItem, _, userId) {
        if (getGame().userId !== userId) {
            // Only act if we initiated the update ourselves
            return;
        }
        updateEncumbrance(actorEntity, undefined, undefined, "delete");
    });
};
export const setupHooks = async () => {
    // setup all the hooks
};
export const initHooks = () => {
    warn("Init Hooks processing");
    DND5E.encumbrance.strMultiplier = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyMultiplier");
    DND5E.encumbrance.currencyPerWeight = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "currencyWeight");
    // CONFIG.debug.hooks = true; // For debugging only
};
