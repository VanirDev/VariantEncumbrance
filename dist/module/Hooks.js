import { warn } from "../VariantEncumbrance.js";
import { getGame, VARIANT_ENCUMBRANCE_FLAG, VARIANT_ENCUMBRANCE_MODULE_NAME } from "./settings.js";
//@ts-ignore
import { DND5E } from "../../../systems/dnd5e/module/config.js";
import { ENCUMBRANCE_TIERS, VariantEncumbranceImpl } from "./VariantEncumbranceImpl.js";
export let readyHooks = async () => {
    Hooks.on('renderActorSheet', function (actorSheet, htmlElement, actorObject) {
        if (actorObject.isCharacter) {
            let actorEntity = getGame().actors?.get(actorObject.actor._id);
            let encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actorEntity, null, null);
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
    // Hooks.on('preCreateActiveEffect', (activeEffect, config, userId) => {
    // });
    Hooks.on('createActiveEffect', (activeEffect, config, userId) => {
        if (!activeEffect?.data?.flags?.isConvenient)
            return;
        const actorEntity = activeEffect.parent;
        if (actorEntity) {
            if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
                // Only act if we initiated the update ourselves, and the effect is a child of a character
                return;
            }
            if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
                VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, "add");
            }
        }
    });
    // Hooks.on('preDeleteActiveEffect', (activeEffect, config, userId) => {
    // });
    Hooks.on('deleteActiveEffect', (activeEffect, config, userId) => {
        if (!activeEffect?.data?.flags?.isConvenient)
            return;
        const actorEntity = activeEffect.parent;
        if (actorEntity) {
            if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
                // Only act if we initiated the update ourselves, and the effect is a child of a character
                return;
            }
            if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
                VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, "delete");
            }
        }
    });
    // Hooks.on('preUpdateActiveEffect', function (activeEffect, config, userId) {
    // });
    Hooks.on('updateActiveEffect', function (activeEffect, config, userId) {
        if (!activeEffect?.data?.flags?.isConvenient)
            return;
        const actorEntity = activeEffect.parent;
        if (actorEntity) {
            if (getGame().userId !== userId || actorEntity.constructor.name != "Actor5e") {
                // Only act if we initiated the update ourselves, and the effect is a child of a character
                return;
            }
            if (!activeEffect?.data?.flags[VARIANT_ENCUMBRANCE_FLAG]) {
                VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, activeEffect, "add");
            }
        }
    });
};
export const setupHooks = async () => {
    // setup all the hooks
    // DEPRECATED
    // //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_VARIANT_ENCUMBRANCE_MODULE_NAME, 'Items.prototype._onUpdateDocuments', ItemsPrototypeOnUpdateDocumentsHandler, 'MIXED');
    // //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_VARIANT_ENCUMBRANCE_MODULE_NAME, 'Items.prototype._onCreateDocuments', ItemsPrototypeOnCreateDocumentsHandler, 'MIXED');
    // //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_VARIANT_ENCUMBRANCE_MODULE_NAME, 'Items.prototype._onDeleteDocuments', ItemsPrototypeOnDeleteDocumentsHandler, 'MIXED');
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.getEmbeddedDocument", getEmbeddedDocument, "MIXED");
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.createEmbeddedDocuments", createEmbeddedDocuments, "MIXED");
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.deleteEmbeddedDocuments", deleteEmbeddedDocuments, "MIXED");
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.updateEmbeddedDocuments", updateEmbeddedDocuments, "MIXED");
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.prepareEmbeddedEntities", prepareEmbeddedEntities, "WRAPPER");
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.getEmbeddedCollection", getEmbeddedCollection, "MIXED")
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.prepareDerivedData", prepareDerivedData, "WRAPPER");
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.actor", getActor, "OVERRIDE") 
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.update", _update, "MIXED")
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.prototype.delete", _delete, "MIXED")
    //@ts-ignore
    // libWrapper.register(MODULE_NAME, "CONFIG.Item.documentClass.prototype.isEmbedded", isEmbedded, "OVERRIDE")
    //@ts-ignore
    // libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass._onCreateDocuments", _onCreateDocuments, "MIXED")
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.createDocuments", createDocuments, "MIXED");
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.deleteDocuments", deleteDocuments, "MIXED");
    //@ts-ignore
    libWrapper.register(VARIANT_ENCUMBRANCE_MODULE_NAME, "CONFIG.Item.documentClass.updateDocuments", updateDocuments, "MIXED");
};
export const initHooks = () => {
    warn("Init Hooks processing");
    DND5E.encumbrance.strMultiplier = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyMultiplier");
    DND5E.encumbrance.currencyPerWeight = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "currencyWeight");
    // CONFIG.debug.hooks = true; // For debugging only
};
export function getEmbeddedDocument(wrapped, embeddedName, id, { strict = false } = {}) {
    const actorEntity = this.actor;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
    }
    return wrapped(embeddedName, id, { strict });
}
export async function createEmbeddedDocuments(wrapped, embeddedName, data, context) {
    const actorEntity = this.actor;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, "add");
    }
    return wrapped(embeddedName, data, context);
}
export async function deleteEmbeddedDocuments(wrapped, embeddedName, ids = [], options = {}) {
    const actorEntity = this.actor;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, ids, undefined, "delete");
    }
    return wrapped(embeddedName, ids, options);
}
export async function updateEmbeddedDocuments(wrapped, embeddedName, data, options) {
    const actorEntity = this.actor;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, "add");
    }
    return wrapped(embeddedName, data, options);
}
export async function createDocuments(wrapped, data, context = { parent: {}, pack: {}, options: {} }) {
    const { parent, pack, options } = context;
    const actorEntity = parent;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, data, undefined, "add");
    }
    return wrapped(data, context);
}
export async function updateDocuments(wrapped, updates = [], context = { parent: {}, pack: {}, options: {} }) {
    const { parent, pack, options } = context;
    const actorEntity = parent;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, updates, undefined, "add");
    }
    return wrapped(updates, context);
}
export async function deleteDocuments(wrapped, ids = [], context = { parent: {}, pack: {}, options: {} }) {
    const { parent, pack, options } = context;
    const actorEntity = parent;
    if (actorEntity) {
        VariantEncumbranceImpl.updateEncumbrance(actorEntity, ids, undefined, "delete");
    }
    return wrapped(ids, context);
}
//// export function prepareEmbeddedEntities(wrapped) {
////   const actorEntity:Actor = this.actor;
////   updateEncumbrance(actorEntity, undefined, undefined, "add");
////   wrapped();
////   return;  
//// }
// export function getEmbeddedCollection(wrapped, type) {
//   const actorEntity:Actor = this.actor;
//   VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   return wrapped(type); 
// }
// export async function _onCreateDocuments(wrapped, items, context) {
//   for ( let item of items ) {
//     const actorEntity:Actor = item.actor;
//     VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   }
//   return wrapped(items, context);
// }
// export async function _update(wrapped, data) {
//   const actorEntity:Actor = this.actor;
//   VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "add");
//   return wrapped(data);
// }
// export async function _delete(wrapped, data) {
//   const actorEntity:Actor = this.actor;
//   VariantEncumbranceImpl.updateEncumbrance(actorEntity, undefined, undefined, "delete");
//   return wrapped(data);
// }
