/**
 * Author: Vanir#0001 (Discord) | github.com/VanirDev
 * Software License: Creative Commons Attributions International License
 */

// Import JavaScript modules
import { INVENTORY_PLUS_MODULE_NAME, MIDI_QOL_MODULE_NAME, registerSettings, VARIANT_ENCUMBRANCE_MODULE_NAME } from './settings';
import { preloadTemplates } from './preloadTemplates';
//@ts-ignore
import { DND5E } from '../../../systems/dnd5e/module/config';

/* ------------------------------------ */
/* Constants         					*/
/* ------------------------------------ */
export const ENCUMBRANCE_TIERS = {
	NONE: 0,
	LIGHT: 1,
	HEAVY: 2,
	MAX: 3,
};




export const veItem = function(item) {
	return {
		_id: item._id,
		weight: item.data.weight,
		count: item.data.quantity,
		totalWeight: item.data.weight * item.data.quantity,
		proficient: item.data.proficient,
		equipped: item.data.equipped
	}
}

export const veEffect = function(effect) {
	let result = {
		multiply: [],
		add: []
	}

	if (!effect.disabled) {
		effect.changes.forEach(change => {
			if (change.key === "data.attributes.encumbrance.value") {
				if (change.mode == 1) {
					result.multiply.push(Number(change.value));
				} else if (change.mode == 2) {
					result.add.push(Number(change.value));
				}
			}
		});
	}
	return result;
}

export const convertItemSet = function(actorEntity) {
	let itemSet = {};
	const weightlessCategoryIds = [];
  //@ts-ignore ????
	const scopes = game.getPackageScopes();

  // Check for inventory-plus module
	const invPlusActive = game.modules.get(INVENTORY_PLUS_MODULE_NAME)?.active;
	const hasInvPlus = scopes.includes(INVENTORY_PLUS_MODULE_NAME);
	if (hasInvPlus && invPlusActive) {
		const inventoryPlusCategories = actorEntity.getFlag(INVENTORY_PLUS_MODULE_NAME, 'category');
		if (inventoryPlusCategories) {
			for (const categoryId in inventoryPlusCategories) {
				if (inventoryPlusCategories[categoryId]?.ownWeight != 0) {
					itemSet["i+" + categoryId] = {
						_id: "i+" + categoryId,
						totalWeight: inventoryPlusCategories[categoryId]?.ownWeight
					};
				}
				if (inventoryPlusCategories.hasOwnProperty(categoryId) && inventoryPlusCategories[categoryId]?.ignoreWeight) {
					weightlessCategoryIds.push(categoryId);
				}
			}
		}
	}
	actorEntity.items.forEach(item => {
		const hasWeight = !!item.data.data.weight;
		const isNotInWeightlessCategory = hasInvPlus && invPlusActive ? weightlessCategoryIds.indexOf(item.getFlag(INVENTORY_PLUS_MODULE_NAME, 'category')) < 0 : true;
		if (hasWeight && isNotInWeightlessCategory) {
			itemSet[item.data._id] = veItem(item.data);
		}
	});

	return itemSet;
}

export const convertEffectSet = function(actorEntity) {
	let result = {}
	actorEntity.effects.forEach(effect => {
		result[effect.data._id] = veEffect(effect.data);
	})
	return result;
}

export const updateEncumbrance = async function (actorEntity, updatedItem, updatedEffect, mode) {
	if (game.actors.get(actorEntity.data._id).data.type !== "character" || !game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "enabled")) {
		return;
	}
	const itemSet = convertItemSet(actorEntity);
	if (updatedItem) {
		// On update operations, the actorEntity's items have not been updated.
		// Override the entry for this item using the updatedItem data.
		if (mode == "add") {
			itemSet[updatedItem._id] = veItem(updatedItem);
		} else if (mode == "delete") {
			delete itemSet[updatedItem._id];
		}
	}

	const effectSet = convertEffectSet(actorEntity);
	if (updatedEffect) {
		// On update operations, the actorEntity's effects have not been updated.
		// Override the entry for this effect using the updatedActiveEffect data.
		if (mode == "add") {
			effectSet[updatedEffect._id] = veEffect(updatedEffect);
		} else if (mode == "delete") {
			delete effectSet[updatedEffect._id];
		}
	}
	let encumbranceData = calculateEncumbrance(actorEntity, itemSet, effectSet);

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

	if (!game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "useVariantEncumbrance")) {
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

	// Skip if name is the same.
	if (effectName === effectEntityPresent.data.label) {
		return;
	}

	let movementSet = ['walk', 'swim', 'fly', 'climb', 'burrow'];
	if (actorEntity._data?.data?.attributes?.movement) {
		movementSet = [];
		Object.entries(actorEntity._data?.data?.attributes?.movement).forEach(speed => {
			if (speed[0] == "hover" || speed[0] == "units") {
				return;
			}
			if (speed[1] > 0) {
				movementSet.push(speed[0]);
			}
		});
	}
	let changes = movementSet.map((movementType) => {
		const changeKey = "data.attributes.movement." + movementType;
		return {
			key: changeKey,
			value: changeValue,
			mode: changeMode,
			priority: 1000
		};
	});
	if (encumbranceData.encumbranceTier >= 2) {
    const invMidiQol = game.modules.get(MIDI_QOL_MODULE_NAME)?.active;
    //const hasMidiQol = scopes.includes(MIDI_QOL_MODULE_NAME);
    if (invMidiQol) {
      //@ts-ignore
      changes = changes.concat(['attack.mwak', 'attack.rawk', 'ability.save.con', 'ability.save.str', 'ability.save.dex', 'ability.check.con', 'ability.check.str', 'ability.check.dex'].map((mod) => {
        const changeKey = 'flags.midi-qol.disadvantage.' + mod;
        return {
          key: changeKey,
          value: 1,
          mode: 0, // should be 1 | 2
          priority: 1000
        }
      }));
    }
	}

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
		actorEntity.setFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, "speed", actorEntity.data.data.attributes.movement.walk);
	}
	if (tier !== encumbranceData.encumbranceTier) {
		actorEntity.setFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, "tier", encumbranceData.encumbranceTier);
	}
	if (weight !== encumbranceData.totalWeight) {
		actorEntity.setFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, "weight", encumbranceData.totalWeight);
	}
}

export const calculateEncumbrance = function(actorEntity, itemSet, effectSet) {
	if (actorEntity.data.type !== "character") {
		console.log("ERROR: NOT A CHARACTER");
		return null;
	}

	if (itemSet === null || itemSet === undefined) {
		itemSet = convertItemSet(actorEntity);
	}
	if (effectSet === null || effectSet === undefined) {
		effectSet = convertEffectSet(actorEntity);
	}

	let speedDecrease = 0;
	let totalWeight = 0;
	let strengthScore = actorEntity.data.data.abilities.str.value;
	if (game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "sizeMultipliers")) {
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
	const lightMax = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "lightMultiplier") * strengthScore;
	const mediumMax = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "mediumMultiplier") * strengthScore;
	const heavyMax = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyMultiplier") * strengthScore;

	Object.values(itemSet).forEach((item:any) => {
		let appliedWeight = item.totalWeight;
		if (item.equipped) {
			if (item.proficient) {
				appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "profEquippedMultiplier");
			} else {
				appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "equippedMultiplier");
			}
		} else {
			if (!item._id.startsWith("i+")) {
				appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "unequippedMultiplier");
			}
		}
		totalWeight += appliedWeight;
	});

	if (game.settings.get("dnd5e", "currencyWeight")) {
		let totalCoins = 0;
		Object.values(actorEntity.data.data.currency).forEach(count => {
			totalCoins += <number>count;
		});
		totalWeight += totalCoins / <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "currencyWeight");
	}

	let weightMultipliers = [];
	let weightAdds = [];
	Object.values(effectSet).forEach((effect:any) => {
		weightMultipliers =  weightMultipliers.concat(effect.multiply);
		weightAdds =  weightAdds.concat(effect.add);
	});

	weightMultipliers.forEach(multiplier => {
		totalWeight *= multiplier;
	});
	weightAdds.forEach(add => {
		totalWeight += add
	})

	let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
	if (totalWeight >= lightMax && totalWeight < mediumMax) {
		speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "lightWeightDecrease");
		encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
	}
	if (totalWeight >= mediumMax && totalWeight < heavyMax) {
		speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, "heavyWeightDecrease");
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
