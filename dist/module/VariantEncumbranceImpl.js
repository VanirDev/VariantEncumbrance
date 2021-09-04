/**
 * Author: Vanir#0001 (Discord) | github.com/VanirDev
 * Software License: Creative Commons Attributions International License
 */
// Import JavaScript modules
import { VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME, VARIANT_ENCUMBRANCE_MODULE_NAME, getGame, VARIANT_ENCUMBRANCE_FLAG, } from "./settings.js";
import { log } from "../VariantEncumbrance.js";
import { EncumbranceFlags, EncumbranceMode, } from "./VariantEncumbranceModels.js";
import Effect from "./Effect.js";
import { ENCUMBRANCE_STATE, invMidiQol, invPlusActive } from "./Hooks.js";
/* ------------------------------------ */
/* Constants         					*/
/* ------------------------------------ */
export const ENCUMBRANCE_TIERS = {
    NONE: 0,
    LIGHT: 1,
    HEAVY: 2,
    MAX: 3,
};
export const VariantEncumbranceImpl = {
    veItem: function (item) {
        return {
            _id: item?.id ? item?.id : item?.data?._id ? item?.data?._id : item?._id,
            weight: item.data?.weight ? item.data?.weight : item.data?.data?.weight,
            quantity: item.data?.quantity ? item.data?.quantity : item.data?.data?.quantity,
            totalWeight: (item.data?.weight ? item.data?.weight : item.data?.data?.weight) *
                (item.data?.quantity ? item.data?.quantity : item.data?.data?.quantity),
            proficient: item.data?.proficient ? item.data?.proficient : item.data?.data?.proficient,
            equipped: item.data?.equipped ? item.data?.equipped : item.data?.data?.equipped,
            type: item.type ? item.type : item.data?.type ? item.data?.type : item.data?.data?.type,
            invPlusCateogryId: item.data?.flags
                ? item.data?.flags['inventory-plus']
                    ? item.data?.flags['inventory-plus']?.category
                    : undefined
                : undefined,
        };
    },
    veItemString: function (item) {
        return {
            _id: item?.id ? item?.id : item?.data?._id ? item?.data?._id : item?._id,
            weight: item['data.weight'],
            quantity: item['data.quantity'],
            totalWeight: item['data.weight'] * item['data.quantity'],
            proficient: item['data.proficient'],
            equipped: item['data.equipped'],
            type: item['type'] ? item['type'] : item['data.type'],
            invPlusCateogryId: item['data.flags.inventory-plus'],
        };
    },
    veItemString2: function (item) {
        return {
            _id: item?.id ? item?.id : item?.data?._id ? item?.data?._id : item?._id,
            weight: item['data.data.weight'],
            quantity: item['data.data.quantity'],
            totalWeight: item['data.data.weight'] * item['data.data.quantity'],
            proficient: item['data.data.proficient'],
            equipped: item['data.data.equipped'],
            type: item['data.type'] ? item['data.type'] : item['data.data.type'],
            invPlusCateogryId: item['data.data.flags.inventory-plus'],
        };
    },
    updateEncumbrance: async function (actorEntity, updatedItems, updatedEffect, mode) {
        // if (updatedItems && (<any[]>updatedItems)?.length > 1) {
        //   throw new Error('Variant encumbrance not work with multiple item');
        // }
        if (updatedItems && updatedItems.length > 0) {
            for (let i = 0; i < updatedItems.length; i++) {
                const updatedItem = updatedItems ? updatedItems[i] : undefined;
                await VariantEncumbranceImpl.updateEncumbranceInternal(actorEntity, updatedItem, updatedEffect, mode);
            }
        }
        else {
            await VariantEncumbranceImpl.updateEncumbranceInternal(actorEntity, undefined, updatedEffect, mode);
        }
    },
    updateEncumbranceInternal: async function (actorEntity, updatedItem, updatedEffect, mode) {
        //getGame().actors?.get(<string>actorEntity.data._id)?.data.type !== "character" ||
        // Remove old flags
        if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.weight`)) {
            await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, 'weight');
        }
        if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.VariantEncumbrance`)) {
            await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, 'VariantEncumbrance');
        }
        /*
        if (!getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enabled')) {
          if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`)) {
           
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.TIER}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.TIER);
            }
            // if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.WEIGHT}`)) {
            //   await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WEIGHT);
            // }
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.BURROW}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.BURROW);
            }
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.CLIMB}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.CLIMB);
            }
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.FLY}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.FLY);
            }
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.SWIM}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.SWIM);
            }
            if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.WALK}`)) {
              await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WALK);
            }
            // if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.DATA}`)) {
            //   await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA);
            // }
          }
          return;
        }
        */
        let veitem = null;
        if (updatedItem) {
            let itemID;
            if (typeof updatedItem === 'string' || updatedItem instanceof String) {
                itemID = updatedItem;
            }
            else {
                itemID = updatedItem?.id ? updatedItem?.id : updatedItem._id;
            }
            let itemCurrent = itemID ? actorEntity.items.get(itemID) : undefined;
            if (!itemCurrent && (updatedItem.id || updatedItem._id)) {
                itemCurrent = updatedItem;
            }
            if (itemCurrent?.type == 'feat' || itemCurrent?.type == 'spell') {
                return;
            }
            if (itemCurrent) {
                if (typeof updatedItem === 'string' || updatedItem instanceof String) {
                    // Do nothing
                }
                else {
                    // On update operations, the actorEntity's items have not been updated.
                    // Override the entry for this item using the updatedItem data.
                    mergeObject(itemCurrent.data, updatedItem);
                }
                updatedItem = itemCurrent;
            }
            if (updatedItem) {
                if (Object.keys(updatedItem).indexOf('data.weight') !== -1) {
                    if (mode == EncumbranceMode.ADD || mode == EncumbranceMode.UPDATE) {
                        veitem = VariantEncumbranceImpl.veItemString(updatedItem);
                    }
                    else if (mode == EncumbranceMode.DELETE) {
                        veitem = VariantEncumbranceImpl.veItemString(updatedItem);
                    }
                }
                else if (Object.keys(updatedItem).indexOf('data.data.weight') !== -1) {
                    if (mode == EncumbranceMode.ADD || mode == EncumbranceMode.UPDATE) {
                        veitem = VariantEncumbranceImpl.veItemString2(updatedItem);
                    }
                    else if (mode == EncumbranceMode.DELETE) {
                        veitem = VariantEncumbranceImpl.veItemString2(updatedItem);
                    }
                }
                else {
                    if (updatedItem?.data) {
                        if (mode == EncumbranceMode.ADD || mode == EncumbranceMode.UPDATE) {
                            veitem = VariantEncumbranceImpl.veItem(updatedItem);
                        }
                        else if (mode == EncumbranceMode.DELETE) {
                            veitem = VariantEncumbranceImpl.veItem(updatedItem);
                        }
                    }
                }
            }
        }
        // if (!hasProperty(actorEntity.data, 'flags.' + VARIANT_ENCUMBRANCE_FLAG)) {
        //   await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, VARIANT_ENCUMBRANCE_FLAG, {});
        // }
        const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actorEntity, veitem, mode); //, itemSet, effectSet
        // SEEM NOT NECESSARY
        // const tier = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.TIER}`)
        //   ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.TIER)
        //   : {};
        // const weight = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.WEIGHT}`)
        //   ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WEIGHT)
        //   : {};
        const burrow = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.BURROW}`)
            ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.BURROW)
            : {};
        const climb = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.CLIMB}`)
            ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.CLIMB)
            : {};
        const fly = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.FLY}`)
            ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.FLY)
            : {};
        const swim = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.SWIM}`)
            ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.SWIM)
            : {};
        const walk = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.WALK}`)
            ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WALK)
            : {};
        // const data = hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.DATA}`)
        //   ? actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA)
        //   : encumbranceData;
        // if (tier !== encumbranceData.encumbranceTier) {
        //   await actorEntity.setFlag(
        //     VARIANT_ENCUMBRANCE_FLAG,
        //     EncumbranceFlags.TIER,
        //     encumbranceData.encumbranceTier
        //   );
        // }
        // if (weight !== encumbranceData.totalWeight) {
        //   await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WEIGHT, encumbranceData.totalWeight);
        // }
        //@ts-ignore
        if (burrow !== actorEntity.data.data.attributes.movement.burrow) {
            await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.BURROW, 
            //@ts-ignore
            actorEntity.data.data.attributes.movement.burrow);
        }
        //@ts-ignore
        if (climb !== actorEntity.data.data.attributes.movement.climb) {
            await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.CLIMB, 
            //@ts-ignore
            actorEntity.data.data.attributes.movement.climb);
        }
        //@ts-ignore
        if (fly !== actorEntity.data.data.attributes.movement.fly) {
            await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.FLY, 
            //@ts-ignore
            actorEntity.data.data.attributes.movement.fly);
        }
        //@ts-ignore
        if (swim !== actorEntity.data.data.attributes.movement.swim) {
            await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.SWIM, 
            //@ts-ignore
            actorEntity.data.data.attributes.movement.swim);
        }
        //@ts-ignore
        if (walk !== actorEntity.data.data.attributes.movement.walk) {
            await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.WALK, 
            //@ts-ignore
            actorEntity.data.data.attributes.movement.walk);
        }
        await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA, encumbranceData);
        let effectEntityPresent;
        for (const effectEntity of actorEntity.effects) {
            const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
            // Remove all encumbrance effect renamed from the player
            if (encumbranceData.encumbranceTier &&
                effectEntity.data.flags['variant-encumbrance-dnd5e'] &&
                effectNameToSet != ENCUMBRANCE_STATE.UNENCUMBERED &&
                effectNameToSet != ENCUMBRANCE_STATE.ENCUMBERED &&
                effectNameToSet != ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED &&
                effectNameToSet != ENCUMBRANCE_STATE.OVERBURDENED) {
                // if (await VariantEncumbranceImpl.hasEffectAppliedFromId(effectEntity, actorEntity)) {
                await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
                // }
                continue;
            }
            // Old setting
            if (effectEntity.data.flags['VariantEncumbrance']) {
                // if (await VariantEncumbranceImpl.hasEffectAppliedFromId(effectEntity, actorEntity)) {
                await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
                // }
                continue;
            }
            if (!effectNameToSet) {
                continue;
            }
            if (typeof encumbranceData.encumbranceTier === 'number') {
                if (!effectEntityPresent && effectEntity?.data?.label) {
                    effectEntityPresent = effectEntity;
                }
                else {
                    // Cannot have more than one effect tier present at any one time
                    // if (await VariantEncumbranceImpl.hasEffectApplied(effectNameToSet, actorEntity)) {
                    await VariantEncumbranceImpl.removeEffect(effectNameToSet, actorEntity);
                    // }
                }
            }
            else if (encumbranceData.encumbranceTier) {
                if (!effectEntityPresent && effectEntity?.data?.label && effectEntity.data.flags['variant-encumbrance-dnd5e']) {
                    effectEntityPresent = effectEntity;
                }
                else {
                    // Cannot have more than one effect tier present at any one time
                    // if (await VariantEncumbranceImpl.hasEffectApplied(effectNameToSet, actorEntity)) {
                    await VariantEncumbranceImpl.removeEffect(effectNameToSet, actorEntity);
                    // }
                }
            }
            else {
                // We shouldn't go here never!!!
                if (effectEntity?.data?.label) {
                    if (effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
                        effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
                        effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
                        effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED) {
                        if (!effectEntityPresent) {
                            effectEntityPresent = effectEntity;
                        }
                        else {
                            // if (await VariantEncumbranceImpl.hasEffectApplied(effectNameToSet, actorEntity)) {
                            await VariantEncumbranceImpl.removeEffect(effectNameToSet, actorEntity);
                            // }
                        }
                    }
                }
            }
        }
        let effectName;
        switch (encumbranceData.encumbranceTier) {
            case ENCUMBRANCE_TIERS.NONE:
                effectName = ENCUMBRANCE_STATE.UNENCUMBERED;
                break;
            case ENCUMBRANCE_TIERS.LIGHT:
                effectName = ENCUMBRANCE_STATE.ENCUMBERED;
                break;
            case ENCUMBRANCE_TIERS.HEAVY:
                effectName = ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED;
                break;
            case ENCUMBRANCE_TIERS.MAX:
                effectName = ENCUMBRANCE_STATE.OVERBURDENED;
                break;
            default:
                return;
        }
        if (!getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useVariantEncumbrance')) {
            effectName = ENCUMBRANCE_STATE.UNENCUMBERED;
        }
        if (effectName != ENCUMBRANCE_STATE.UNENCUMBERED &&
            !(await VariantEncumbranceImpl.hasEffectApplied(effectName, actorEntity))) {
            // DO NOTHING
        }
        // Skip if name is the same and the active effect is already present.
        else if (effectName === effectEntityPresent?.data.label) {
            return;
        }
        const origin = `Actor.${actorEntity.data._id}`;
        await VariantEncumbranceImpl.addEffect(effectName, actorEntity, origin, encumbranceData);
        // return encumbranceData;
    },
    /**
     * Compute the level and percentage of encumbrance for an Actor.
     * THIS FUNCTION IS INTEGRATED WITH THE CORE FUNCTIONALITY
     *
     * Optionally include the weight of carried currency across all denominations by applying the standard rule
     * from the PHB pg. 143
     * @param {Object} actorData      The data object for the Actor being rendered
     * @returns {{max: number, value: number, pct: number}}  An object describing the character's encumbrance level
     * @private
     */
    calculateEncumbrance: function (actorEntity, veitem, mode) {
        //, itemSet, effectSet
        // if (actorEntity.data.type !== "character") {
        // 	log("ERROR: NOT A CHARACTER");
        // 	return null;
        // }
        // if (itemSet === null || itemSet === undefined) {
        // 	itemSet = VariantEncumbranceImpl.convertItemSet(actorEntity);
        // }
        // if (effectSet === null || effectSet === undefined) {
        // 	effectSet = VariantEncumbranceImpl.convertEffectSet(actorEntity);
        // }
        let speedDecrease = 0;
        // let totalWeight = 0;
        // Determine the encumbrance size class
        // let mod = {
        // 	tiny: 0.5,
        // 	sm: 1,
        // 	med: 1,
        // 	lg: 2,
        // 	huge: 4,
        // 	grg: 8
        // }[actorEntity.data.data.traits.size] || 1;
        let mod = 1; //actorEntity.data.data.abilities.str.value;
        if (getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'sizeMultipliers')) {
            //@ts-ignore
            const size = actorEntity.data.data.traits.size;
            if (size === 'tiny') {
                mod *= 0.5;
            }
            else if (size === 'sm') {
                mod *= 1;
            }
            else if (size === 'med') {
                mod *= 1;
            }
            else if (size === 'lg') {
                mod *= 2;
            }
            else if (size === 'huge') {
                mod *= 4;
            }
            else if (size === 'grg') {
                mod *= 8;
            }
            else {
                mod *= 1;
            }
            // Powerful build support
            //@ts-ignore
            if (actorEntity.data?.flags?.dnd5e?.powerfulBuild) {
                //jshint ignore:line
                // mod *= 2;
                mod = Math.min(mod * 2, 8);
            }
        }
        //@ts-ignore
        const strengthScore = actorEntity.data.data.abilities.str.value * mod;
        const lightMax = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplier') * strengthScore;
        const mediumMax = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplier') * strengthScore;
        const heavyMax = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier') * strengthScore;
        // Object.values(itemSet).forEach((item:any) => {
        // 	let appliedWeight = item.totalWeight;
        // 	if (item.equipped) {
        // 		if (item.proficient) {
        // 			appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "profEquippedMultiplier");
        // 		} else {
        // 			appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "equippedMultiplier");
        // 		}
        // 	} else {
        // 		if (!item._id.startsWith("i+")) {
        // 			appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "unequippedMultiplier");
        // 		}
        // 	}
        // 	totalWeight += appliedWeight;
        // });
        // const invPlusActive = getGame().modules.get(VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME)?.active;
        let isFoundItemCurrent = false;
        // START TOTAL WEIGHT
        // Get the total weight from items
        const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
        let totalWeight = actorEntity.data.items.reduce((weight, item) => {
            if (!physicalItems.includes(item.type)) {
                return weight;
            }
            //@ts-ignore
            let q = item.data.data.quantity || 0;
            if (veitem && veitem?.quantity && item.id === veitem._id) {
                isFoundItemCurrent = true;
                q = veitem?.quantity;
            }
            //@ts-ignore
            let w = item.data.data.weight || 0;
            if (veitem && veitem?.weight && item.id === veitem._id) {
                isFoundItemCurrent = true;
                if (mode == EncumbranceMode.DELETE) {
                    w = 0;
                }
                else {
                    w = veitem?.weight;
                }
            }
            if (invPlusActive) {
                const inventoryPlusCategories = (actorEntity.getFlag(VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME, 'categorys'));
                if (inventoryPlusCategories) {
                    // "weapon", "equipment", "consumable", "tool", "backpack", "loot"
                    for (const categoryId in inventoryPlusCategories) {
                        if (
                        //@ts-ignore
                        item.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId ||
                            //@ts-ignore
                            item.data?.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId) {
                            // ignore weight
                            const section = inventoryPlusCategories[categoryId];
                            if (section?.ignoreWeight) {
                                w = 0;
                            }
                            // Inerith weight
                            if (Number(section?.ownWeight) > 0) {
                                w = Number(section?.ownWeight);
                            }
                            // EXIT FOR
                            break;
                        }
                    }
                }
            }
            // return weight + (q * w);
            let appliedWeight = q * w;
            //@ts-ignore
            let isEquipped = item.data.data.equipped;
            if (veitem && item.id === veitem._id) {
                isEquipped = veitem.equipped;
                isFoundItemCurrent = true;
            }
            if (isEquipped) {
                //@ts-ignore
                let isProficient = item.data.data.proficient;
                if (veitem && item.id === veitem._id) {
                    isProficient = veitem.proficient;
                    isFoundItemCurrent = true;
                }
                if (isProficient) {
                    appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'profEquippedMultiplier');
                }
                else {
                    appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'equippedMultiplier');
                }
            }
            else {
                appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unequippedMultiplier');
            }
            return weight + appliedWeight;
        }, 0);
        // END TOTAL WEIGHT
        // START STRANGE CONTROL
        let strangeWeight = 0;
        if (!isFoundItemCurrent && veitem?.weight) {
            if (!physicalItems.includes(veitem?.type)) {
                strangeWeight = 0;
            }
            else {
                let q = 0;
                if (veitem && veitem?.quantity) {
                    q = veitem?.quantity;
                }
                let w = 0;
                if (veitem && veitem?.weight) {
                    if (mode == EncumbranceMode.DELETE) {
                        w = 0;
                    }
                    else {
                        w = veitem?.weight;
                    }
                }
                if (invPlusActive) {
                    const inventoryPlusCategories = (actorEntity.getFlag(VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME, 'categorys'));
                    if (inventoryPlusCategories) {
                        // "weapon", "equipment", "consumable", "tool", "backpack", "loot"
                        for (const categoryId in inventoryPlusCategories) {
                            if (veitem.invPlusCateogryId === categoryId) {
                                // ignore weight
                                const section = inventoryPlusCategories[categoryId];
                                if (section?.ignoreWeight) {
                                    w = 0;
                                }
                                // Inerith weight
                                if (Number(section?.ownWeight) > 0) {
                                    w = Number(section?.ownWeight);
                                }
                                // EXIT FOR
                                break;
                            }
                        }
                    }
                }
                let appliedWeight = q * w;
                let isEquipped = false;
                if (veitem) {
                    isEquipped = veitem.equipped;
                }
                if (isEquipped) {
                    let isProficient = false;
                    if (veitem) {
                        isProficient = veitem.proficient;
                    }
                    if (isProficient) {
                        appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'profEquippedMultiplier');
                    }
                    else {
                        appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'equippedMultiplier');
                    }
                }
                else {
                    appliedWeight *= getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unequippedMultiplier');
                }
                strangeWeight = appliedWeight;
            }
        }
        // END STRANGE CONTROL
        totalWeight = totalWeight + strangeWeight;
        // if (getGame().settings.get("dnd5e", "currencyWeight")) {
        // 	let totalCoins = 0;
        // 	Object.values(actorEntity.data.data.currency).forEach(count => {
        // 		totalCoins += <number>count;
        // 	});
        // 	totalWeight += totalCoins / <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "currencyWeight");
        // }
        // [Optional] add Currency Weight (for non-transformed actors)
        //@ts-ignore
        if (getGame().settings.get('dnd5e', 'currencyWeight') && actorEntity.data.data.currency) {
            //@ts-ignore
            const currency = actorEntity.data.data.currency;
            const numCoins = Object.values(currency).reduce((val, denom) => (val += Math.max(denom, 0)), 0);
            //@ts-ignore
            let currencyPerWeight = getGame().settings.get('dnd5e', 'metricWeightUnits')
                ? //@ts-ignore
                    CONFIG.DND5E.encumbrance.currencyPerWeight.metric
                : //@ts-ignore
                    CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;
            // BUG FOUNDRY ????? currencyPerweight is undefined
            if (!currencyPerWeight) {
                //@ts-ignore
                currencyPerWeight = CONFIG.DND5E.encumbrance.currencyPerWeight
                    ? //@ts-ignore
                        CONFIG.DND5E.encumbrance.currencyPerWeight
                    : 50;
            }
            if (getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight')) {
                currencyPerWeight = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight');
            }
            totalWeight += numCoins / currencyPerWeight;
        }
        // Compute Encumbrance percentage
        totalWeight = totalWeight.toNearest(0.1);
        //@ts-ignore
        let strengthMultiplier = getGame().settings.get('dnd5e', 'metricWeightUnits')
            ? //@ts-ignore
                CONFIG.DND5E.encumbrance.strMultiplier.metric
            : //@ts-ignore
                CONFIG.DND5E.encumbrance.strMultiplier.imperial;
        // BUG FOUNDRY ????? strengthMultiplier is undefined
        if (!strengthMultiplier) {
            //@ts-ignore
            strengthMultiplier = CONFIG.DND5E.encumbrance.strMultiplier ? CONFIG.DND5E.encumbrance.strMultiplier : 15;
        }
        // const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
        //@ts-ignore
        const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
        const pct = Math.clamped((totalWeight * 100) / max, 0, 100);
        // let weightMultipliers = [];
        // let weightAdds = [];
        // Object.values(effectSet).forEach((effect:any) => {
        // 	weightMultipliers =  weightMultipliers.concat(effect.multiply);
        // 	weightAdds =  weightAdds.concat(effect.add);
        // });
        // weightMultipliers.forEach(multiplier => {
        // 	totalWeight *= multiplier;
        // });
        // weightAdds.forEach(add => {
        // 	totalWeight += add
        // })
        let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
        if (totalWeight >= lightMax && totalWeight < mediumMax) {
            speedDecrease = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease');
            encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
        }
        if (totalWeight >= mediumMax && totalWeight < heavyMax) {
            speedDecrease = getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease');
            encumbranceTier = ENCUMBRANCE_TIERS.HEAVY;
        }
        if (totalWeight >= heavyMax) {
            encumbranceTier = ENCUMBRANCE_TIERS.MAX;
        }
        // Inventory encumbrance
        // actorEntity.data.data.attributes.encumbrance = { value: totalWeight.toNearest(0.1), max, pct, encumbered: pct > (200/3) };
        //@ts-ignore
        actorEntity.data.data.attributes.encumbrance = {
            value: totalWeight.toNearest(0.1),
            max,
            pct,
            encumbered: encumbranceTier != ENCUMBRANCE_TIERS.NONE,
        };
        return {
            totalWeight: totalWeight.toNearest(0.1),
            lightMax: lightMax,
            mediumMax: mediumMax,
            heavyMax: heavyMax,
            encumbranceTier: encumbranceTier,
            speedDecrease: speedDecrease,
        };
    },
    /**
     * Adds dynamic effects for specific effects
     *
     * @param {Effect} effect - the effect to handle
     * @param {Actor5e} actor - the effected actor
     */
    addDynamicEffects: async function (effectName, actor, encumbranceData) {
        // const invMidiQol = <boolean>getGame().modules.get(VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME)?.active;
        switch (effectName.toLowerCase()) {
            case ENCUMBRANCE_STATE.ENCUMBERED.toLowerCase(): {
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
                }
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
                }
                const effect = VariantEncumbranceImpl._encumbered();
                const speedDecreased = encumbranceData.speedDecrease ? encumbranceData.speedDecrease : 10;
                VariantEncumbranceImpl._addEncumbranceEffects({ effect, actor, value: speedDecreased });
                return effect;
            }
            case ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED.toLowerCase(): {
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
                }
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
                }
                let effect;
                if (invMidiQol) {
                    effect = VariantEncumbranceImpl._heavilyEncumbered();
                }
                else {
                    effect = VariantEncumbranceImpl._heavilyEncumberedNoMidi();
                }
                const speedDecreased = encumbranceData.speedDecrease ? encumbranceData.speedDecrease : 20;
                VariantEncumbranceImpl._addEncumbranceEffects({ effect, actor, value: speedDecreased });
                return effect;
            }
            case ENCUMBRANCE_STATE.UNENCUMBERED.toLowerCase(): {
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
                }
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
                }
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
                }
                return null;
            }
            case ENCUMBRANCE_STATE.OVERBURDENED.toLowerCase(): {
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
                }
                if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
                    await VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
                }
                let effect;
                if (invMidiQol) {
                    effect = VariantEncumbranceImpl._overburdenedEncumbered();
                }
                else {
                    effect = VariantEncumbranceImpl._overburdenedEncumberedNoMidi();
                }
                VariantEncumbranceImpl._addEncumbranceEffectsOverburdened({ effect, actor });
                return effect;
            }
            default: {
                throw new Error("The effect name '" + effectName + "' is not reconized");
            }
        }
    },
    _encumbered: function () {
        return new Effect({
            name: ENCUMBRANCE_STATE.ENCUMBERED,
            description: 'Lowers movement by 10 ft.',
            icon: 'icons/svg/down.svg',
            isDynamic: true,
        });
    },
    _heavilyEncumbered: function () {
        return new Effect({
            name: ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED,
            description: 'Lowers movement by 20 ft., disadvantage on all attack rolls, and disadvantage on strength, dexterity, and constitution saves',
            icon: 'icons/svg/downgrade.svg',
            isDynamic: true,
            changes: [
                {
                    key: 'flags.midi-qol.disadvantage.attack.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.str',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.dex',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.con',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
            ],
        });
    },
    _heavilyEncumberedNoMidi: function () {
        return new Effect({
            name: ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED,
            description: 'Lowers movement by 20 ft.',
            icon: 'icons/svg/downgrade.svg',
            isDynamic: true,
            changes: [],
        });
    },
    _overburdenedEncumbered: function () {
        return new Effect({
            name: ENCUMBRANCE_STATE.OVERBURDENED,
            description: 'Lowers movement to 0 ft., disadvantage on all attack rolls, and disadvantage on strength, dexterity, and constitution saves',
            // icon: 'icons/svg/hazard.svg',
            icon: 'icons/tools/smithing/anvil.webp',
            isDynamic: true,
            changes: [
                {
                    key: 'flags.midi-qol.disadvantage.attack.all',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.str',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.dex',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
                {
                    key: 'flags.midi-qol.disadvantage.ability.save.con',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: '1',
                },
            ],
        });
    },
    _overburdenedEncumberedNoMidi: function () {
        return new Effect({
            name: ENCUMBRANCE_STATE.OVERBURDENED,
            description: 'Lowers movement to 0 ft.',
            // icon: 'icons/svg/hazard.svg',
            icon: 'icons/tools/smithing/anvil.webp',
            isDynamic: true,
            changes: [],
        });
    },
    _addEncumbranceEffects: function ({ effect, actor, value }) {
        const movement = actor.data.data.attributes.movement;
        effect.changes.push({
            key: 'data.attributes.movement.burrow',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: movement.burrow > value ? `-${value}` : `-${movement.burrow}`,
        });
        effect.changes.push({
            key: 'data.attributes.movement.climb',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: movement.climb > value ? `-${value}` : `-${movement.climb}`,
        });
        effect.changes.push({
            key: 'data.attributes.movement.fly',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: movement.fly > value ? `-${value}` : `-${movement.fly}`,
        });
        effect.changes.push({
            key: 'data.attributes.movement.swim',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: movement.swim > value ? `-${value}` : `-${movement.swim}`,
        });
        effect.changes.push({
            key: 'data.attributes.movement.walk',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: movement.walk > value ? `-${value}` : `-${movement.walk}`,
        });
    },
    _addEncumbranceEffectsOverburdened: function ({ effect, actor }) {
        const movement = actor.data.data.attributes.movement;
        effect.changes.push({
            key: 'data.attributes.movement.burrow',
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: '0',
        });
        effect.changes.push({
            key: 'data.attributes.movement.climb',
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: '0',
        });
        effect.changes.push({
            key: 'data.attributes.movement.fly',
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: '0',
        });
        effect.changes.push({
            key: 'data.attributes.movement.swim',
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: '0',
        });
        effect.changes.push({
            key: 'data.attributes.movement.walk',
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: '0',
        });
    },
    /**
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is
     * applied to
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    async hasEffectApplied(effectName, actor) {
        // const actor = await this._foundryHelpers.getActorByUuid(uuid);
        return actor?.data?.effects?.some((activeEffect) => activeEffect?.data?.flags?.isConvenient && activeEffect?.data?.label == effectName);
    },
    /**
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is
     * applied to
     * @returns {boolean} true if the effect is applied, false otherwise
     */
    async hasEffectAppliedFromId(effect, actor) {
        // const actor = await this._foundryHelpers.getActorByUuid(uuid);
        return actor?.data?.effects?.some((activeEffect) => activeEffect?.data?.flags?.isConvenient && activeEffect?.data?._id == effect.id);
    },
    /**
     * Removes the effect with the provided name from an actor matching the
     * provided UUID
     *
     * @param {string} effectName - the name of the effect to remove
     * @param {string} uuid - the uuid of the actor to remove the effect from
     */
    async removeEffect(effectName, actor) {
        // const actor = await this._foundryHelpers.getActorByUuid(uuid);
        const effectToRemove = actor.data.effects.find((activeEffect) => activeEffect?.data?.flags?.isConvenient && activeEffect?.data?.label == effectName);
        if (effectToRemove) {
            await actor.deleteEmbeddedDocuments('ActiveEffect', [effectToRemove.id]);
            log(`Removed effect ${effectName} from ${actor.name} - ${actor.id}`);
        }
    },
    /**
     * Removes the effect with the provided name from an actor matching the
     * provided UUID
     *
     * @param {string} effectName - the name of the effect to remove
     * @param {string} uuid - the uuid of the actor to remove the effect from
     */
    async removeEffectFromId(effectToRemove, actor) {
        if (effectToRemove) {
            await actor.deleteEmbeddedDocuments('ActiveEffect', [effectToRemove.id]);
            log(`Removed effect ${effectToRemove?.data?.label} from ${actor.name} - ${actor.id}`);
        }
    },
    /**
     * Adds the effect with the provided name to an actor matching the provided
     * UUID
     *
     * @param {string} effectName - the name of the effect to add
     * @param {string} uuid - the uuid of the actor to add the effect to
     */
    async addEffect(effectName, actor, origin, encumbranceData) {
        // let effect = VariantEncumbranceImpl.findEffectByName(effectName);
        //const actor = await VariantEncumbranceImpl._foundryHelpers.getActorByUuid(uuid);
        // if (effect.isDynamic) {
        const effect = await VariantEncumbranceImpl.addDynamicEffects(effectName, actor, encumbranceData);
        // }
        if (effect) {
            // VariantEncumbranceImpl._handleIntegrations(effect);
            // effect.flags = {
            //   VariantEncumbrance: {
            //     tier: encumbranceData.encumbranceTier,
            //   },
            // };
            effect.flags = {
                'variant-encumbrance-dnd5e': {
                    tier: encumbranceData.encumbranceTier,
                },
            };
            const activeEffectData = effect.convertToActiveEffectData(origin);
            await actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);
            log(`Added effect ${effect.name} to ${actor.name} - ${actor.id}`);
        }
    },
};
