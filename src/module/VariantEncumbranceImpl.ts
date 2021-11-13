/**
 * Author: Vanir#0001 (Discord) | github.com/VanirDev
 * Software License: Creative Commons Attributions International License
 */

// Import JavaScript modules
import {
  VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MODULE_NAME,
  getGame,
  VARIANT_ENCUMBRANCE_FLAG,
} from './settings';
import { i18n, log, warn } from '../VariantEncumbrance';
import {
  EncumbranceActorType,
  EncumbranceData,
  EncumbranceFlags,
  EncumbranceMode,
  VariantEncumbranceItemData,
} from './VariantEncumbranceModels';
import Effect from './lib/effect';
import { ENCUMBRANCE_STATE, invMidiQol, invPlusActive } from './Hooks';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

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
  updateEncumbrance: async function (
    actorEntity: Actor,
    updatedItems: any[] | undefined,
    updatedEffect?: ActiveEffect | undefined,
    mode?: EncumbranceMode,
  ): Promise<void> {
    // if (updatedItems && (<any[]>updatedItems)?.length > 1) {
    //   throw new Error('Variant encumbrance not work with multiple item');
    // }

    // const enableVarianEncumbranceOnActorFlag = <boolean>actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_VE);
    // if(!enableVarianEncumbranceOnActorFlag){
    //   return;
    // }

    if (updatedItems && updatedItems.length > 0) {
      for (let i = 0; i < updatedItems.length; i++) {
        const updatedItem: any = updatedItems ? (<any[]>updatedItems)[i] : undefined;
        await VariantEncumbranceImpl._updateEncumbranceInternal(actorEntity, updatedItem, updatedEffect, mode);
      }
    } else {
      await VariantEncumbranceImpl._updateEncumbranceInternal(actorEntity, undefined, updatedEffect, mode);
    }
  },

  _updateEncumbranceInternal: async function (
    actorEntity: Actor,
    updatedItem: any | undefined,
    updatedEffect?: ActiveEffect | undefined,
    mode?: EncumbranceMode,
  ): Promise<void> {
    // Remove old flags
    if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.weight`)) {
      await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, 'weight');
    }
    if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.VariantEncumbrance`)) {
      await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, 'VariantEncumbrance');
    }
    if (hasProperty(actorEntity.data, 'flags.VariantEncumbrance')) {
      await actorEntity.unsetFlag(VARIANT_ENCUMBRANCE_FLAG, 'VariantEncumbrance');
    }

    const enableVarianEncumbranceWeightOnActorFlag = <boolean>(
      actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_WE)
    );
    if (!enableVarianEncumbranceWeightOnActorFlag) {
      return;
    }

    if (updatedItem) {
      let itemID: any;
      if (typeof updatedItem === 'string' || updatedItem instanceof String) {
        itemID = <string>updatedItem;
      } else {
        itemID = updatedItem?.id ? updatedItem?.id : updatedItem._id;
      }
      let itemCurrent: Item | undefined = itemID ? <Item>actorEntity.items.get(itemID) : undefined;
      if (!itemCurrent && (updatedItem.id || updatedItem._id)) {
        itemCurrent = updatedItem;
      }
      if (itemCurrent?.type == 'feat' || itemCurrent?.type == 'spell') {
        return;
      }

      if (itemCurrent) {
        if (typeof updatedItem === 'string' || updatedItem instanceof String) {
          // Do nothing
        } else {
          // On update operations, the actorEntity's items have not been updated.
          // Override the entry for this item using the updatedItem data.
          mergeObject(<ItemData>itemCurrent.data, updatedItem);
        }
        updatedItem = itemCurrent;
      }
    }

    const currentItemId = updatedItem?.id
      ? updatedItem?.id
      : updatedItem?.data?._id
      ? updatedItem?.data?._id
      : updatedItem?._id;
    const inventoryItems: Item[] = [];
    const isAlreadyInActor = <Item>actorEntity.items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
    const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    actorEntity.data.items.contents.forEach((im: Item) => {
      if (im && physicalItems.includes(im.type)) {
        if (im.id === currentItemId) {
          if (mode == EncumbranceMode.DELETE) {
            // setProperty(im, 'data.data.weight', 0);
          } else {
            inventoryItems.push(im);
          }
        } else {
          inventoryItems.push(im);
        }
      }
    });
    if (!isAlreadyInActor) {
      const im = <Item>getGame().items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
      if (im && physicalItems.includes(im.type)) {
        if (mode == EncumbranceMode.DELETE) {
          // setProperty(im, 'data.data.weight', 0);
        } else {
          inventoryItems.push(im);
        }
      }
    }

    const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actorEntity, inventoryItems);

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

    //@ts-ignore
    if (burrow !== actorEntity.data.data.attributes.movement.burrow) {
      await actorEntity.setFlag(
        VARIANT_ENCUMBRANCE_FLAG,
        EncumbranceFlags.BURROW,
        //@ts-ignore
        actorEntity.data.data.attributes.movement.burrow,
      );
    }
    //@ts-ignore
    if (climb !== actorEntity.data.data.attributes.movement.climb) {
      await actorEntity.setFlag(
        VARIANT_ENCUMBRANCE_FLAG,
        EncumbranceFlags.CLIMB,
        //@ts-ignore
        actorEntity.data.data.attributes.movement.climb,
      );
    }
    //@ts-ignore
    if (fly !== actorEntity.data.data.attributes.movement.fly) {
      await actorEntity.setFlag(
        VARIANT_ENCUMBRANCE_FLAG,
        EncumbranceFlags.FLY,
        //@ts-ignore
        actorEntity.data.data.attributes.movement.fly,
      );
    }
    //@ts-ignore
    if (swim !== actorEntity.data.data.attributes.movement.swim) {
      await actorEntity.setFlag(
        VARIANT_ENCUMBRANCE_FLAG,
        EncumbranceFlags.SWIM,
        //@ts-ignore
        actorEntity.data.data.attributes.movement.swim,
      );
    }
    //@ts-ignore
    if (walk !== actorEntity.data.data.attributes.movement.walk) {
      await actorEntity.setFlag(
        VARIANT_ENCUMBRANCE_FLAG,
        EncumbranceFlags.WALK,
        //@ts-ignore
        actorEntity.data.data.attributes.movement.walk,
      );
    }

    // SEEM NOT NECESSARY Add pre check for encumbrance tier
    if (<boolean>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enablePreCheckEncumbranceTier')) {
      if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.DATA}`)) {
        const encumbranceDataCurrent = <EncumbranceData>(
          actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA)
        );
        if (encumbranceDataCurrent.encumbranceTier == encumbranceData.encumbranceTier) {
          //We ignore all the AE check
          await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA, encumbranceData);
          return;
        }
      }
    }

    await actorEntity.setFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA, encumbranceData);

    const enableVarianEncumbranceEffectsOnActorFlag = <boolean>(
      actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_AE)
    );
    if (enableVarianEncumbranceEffectsOnActorFlag) {
      VariantEncumbranceImpl.manageActiveEffect(actorEntity, encumbranceData.encumbranceTier);
    }
  },

  manageActiveEffect: async function (actorEntity: Actor, encumbranceTier: number) {
    let effectEntityPresent: ActiveEffect | undefined;

    for (const effectEntity of actorEntity.effects) {
      const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;

      if (!effectNameToSet) {
        continue;
      }

      // Remove all encumbrance effect renamed from the player
      if (
        // encumbranceData.encumbranceTier &&
        effectEntity.data.flags &&
        hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
        effectNameToSet != ENCUMBRANCE_STATE.UNENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.ENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.OVERBURDENED
      ) {
        await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
        continue;
      }

      // Remove Old settings
      if (effectEntity.data.flags && hasProperty(effectEntity.data, `flags.VariantEncumbrance`)) {
        await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
        continue;
      }

      // // Ignore all convenient effect
      // if (hasProperty(effectEntity.data, `flags.isConvenient`)) {
      //   if (
      //     effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
      //     effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
      //     effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
      //     effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED
      //   ) {
      //     VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
      //   }
      //   continue;
      // }

      // Ignore all non encumbrance effect renamed from the player (again)
      if (
        !hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
        effectNameToSet != ENCUMBRANCE_STATE.UNENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.ENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED &&
        effectNameToSet != ENCUMBRANCE_STATE.OVERBURDENED
      ) {
        continue;
      }

      // Remove encumbrance effect with same name used in this module
      if (
        !hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
        (effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED)
      ) {
        await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
        continue;
      }

      // if (typeof encumbranceData.encumbranceTier === 'number') {
      //   if (!effectEntityPresent) {
      //     effectEntityPresent = effectEntity;
      //   } else {
      //     // Cannot have more than one effect tier present at any one time
      //     if (
      //       effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED
      //     ) {
      //       VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
      //     }
      //   }
      // } else if (encumbranceData.encumbranceTier) {
      //   if (!effectEntityPresent) {
      //     effectEntityPresent = effectEntity;
      //   } else {
      //     // Cannot have more than one effect tier present at any one time
      //     if (
      //       effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
      //       effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED
      //     ) {
      //       VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
      //     }
      //   }
      // } else {

      if (
        hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
        (effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED)
      ) {
        if (!effectEntityPresent) {
          effectEntityPresent = effectEntity;
        } else {
          await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
        }
      }
      // }
    }

    let effectName;
    switch (encumbranceTier) {
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

    if (effectName && effectName != '') {
      if (effectName === effectEntityPresent?.data.label) {
        // Skip if name is the same and the active effect is already present.
        return;
      }
      if (effectName == ENCUMBRANCE_STATE.UNENCUMBERED) {
        if (effectEntityPresent?.id) {
          await VariantEncumbranceImpl.removeEffectFromId(<ActiveEffect>effectEntityPresent, actorEntity);
        }
      } else {
        if (effectEntityPresent?.id) {
          await VariantEncumbranceImpl.removeEffectFromId(<ActiveEffect>effectEntityPresent, actorEntity);
        }
        if (!(await VariantEncumbranceImpl.hasEffectApplied(effectName, actorEntity))) {
          const origin = <string>actorEntity.id; // `Actor.${actorEntity.data._id}`;
          await VariantEncumbranceImpl.addEffect(effectName, actorEntity, origin, encumbranceTier);
        }
      }
    }
  },

  manageActiveEffectLimited: async function (actorEntity: Actor) {
    for (const effectEntity of actorEntity.effects) {
      const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;

      if (!effectNameToSet) {
        continue;
      }

      if (
        hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
        (effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
          effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED)
      ) {
        await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
      }
    }
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
  calculateEncumbrance: function (
    actorEntity: Actor,
    // veItemData: VariantEncumbranceItemData | null,
    inventoryItems: Item[],
    // mode?: EncumbranceMode,
  ): EncumbranceData {
    const enableVarianEncumbranceWeightOnActorFlag = <boolean>(
      actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_WE)
    );
    if (!enableVarianEncumbranceWeightOnActorFlag) {
      if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.DATA}`)) {
        return <EncumbranceData>actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA);
      } else {
        // actorEntity.data.data.attributes.encumbrance = { value: totalWeight.toNearest(0.1), max, pct, encumbered: pct > (200/3) };
        //@ts-ignore
        const dataEncumbrance = actorEntity.data.data.attributes.encumbrance;
        return {
          totalWeight: dataEncumbrance.value,
          lightMax: dataEncumbrance.max,
          mediumMax: dataEncumbrance.max,
          heavyMax: dataEncumbrance.max,
          encumbranceTier: 0,
          speedDecrease: 0,
        };
      }
    }

    let speedDecrease = 0;

    let mod = 1; //actorEntity.data.data.abilities.str.value;
    if (getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'sizeMultipliers')) {
      //@ts-ignore
      const size = actorEntity.data.data.traits.size;
      if (size === 'tiny') {
        mod *= 0.5;
      } else if (size === 'sm') {
        mod *= 1;
      } else if (size === 'med') {
        mod *= 1;
      } else if (size === 'lg') {
        mod *= 2;
      } else if (size === 'huge') {
        mod *= 4;
      } else if (size === 'grg') {
        mod *= 8;
      } else {
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
    const lightMax = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplier') * strengthScore;
    const mediumMax =
      <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplier') * strengthScore;
    const heavyMax = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier') * strengthScore;

    const invPlusCategoriesWithInherentWeight: string[] = [];

    // START TOTAL WEIGHT
    // Get the total weight from items
    const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    // let totalWeight: number = actorEntity.data.items.reduce((weight, item) => {
    let totalWeight: number = inventoryItems.reduce((weight, item) => {
      if (!physicalItems.includes(item.type)) {
        return weight;
      }

      //@ts-ignore
      const itemQuantity = item.data.data.quantity || 0;

      //@ts-ignore
      let itemWeight = item.data.data.weight || 0;
      // Start Item container check
      if (
        getProperty(item, 'data.flags.itemcollection.bagWeight') != null &&
        getProperty(item, 'data.flags.itemcollection.bagWeight') != undefined
      ) {
        const weightless = getProperty(item, 'data.data.capacity.weightless') ?? false;
        if (weightless) {
          itemWeight = getProperty(item, 'data.flags.itemcollection.bagWeight');
        } else {
          itemWeight = calcItemWeight(item) + getProperty(item, 'data.flags.itemcollection.bagWeight');
        }
      }
      // End Item container check
      // Start inventory+ module is active
      let ignoreQuantityAndEquipmentCheck = false;
      if (invPlusActive) {
        // Retrieve flag 'categorys' from inventory plus module
        const inventoryPlusCategories = <any[]>(
          actorEntity.getFlag(VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME, 'categorys')
        );
        if (inventoryPlusCategories) {
          // "weapon", "equipment", "consumable", "tool", "backpack", "loot"
          let actorHasCustomCategories = false;
          for (const categoryId in inventoryPlusCategories) {
            if (
              (item.data?.flags &&
                //@ts-ignore
                item.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId) ||
              //@ts-ignore
              (item.data?.data?.flags &&
                //@ts-ignore
                item.data?.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId)
            ) {
              // Ignore weight
              const section = inventoryPlusCategories[categoryId];
              if (section?.ignoreWeight) {
                itemWeight = 0;
                ignoreQuantityAndEquipmentCheck = true;
              }

              // Inherent weight
              if (Number(section?.ownWeight) > 0) {
                itemWeight = Number(section?.ownWeight);
                if (invPlusCategoriesWithInherentWeight.includes(categoryId)) {
                  itemWeight = 0;
                } else {
                  invPlusCategoriesWithInherentWeight.push(categoryId);
                }
                ignoreQuantityAndEquipmentCheck = true;
              }
              // EXIT FOR
              actorHasCustomCategories = true;
              break;
            }
          }
          if (!actorHasCustomCategories) {
            for (const categoryId in inventoryPlusCategories) {
              if (item.type === categoryId) {
                // ignore weight
                const section = inventoryPlusCategories[categoryId];
                if (section?.ignoreWeight) {
                  itemWeight = 0;
                  ignoreQuantityAndEquipmentCheck = true;
                }

                // Inherent weight
                if (Number(section?.ownWeight) > 0) {
                  itemWeight = Number(section?.ownWeight);
                  if (invPlusCategoriesWithInherentWeight.includes(categoryId)) {
                    itemWeight = 0;
                  } else {
                    invPlusCategoriesWithInherentWeight.push(categoryId);
                  }
                  ignoreQuantityAndEquipmentCheck = true;
                }
                // EXIT FOR
                break;
              }
            }
          }
        }
        if (ignoreQuantityAndEquipmentCheck) {
          return weight + itemWeight;
        }
      }
      // End Inventory+ module is active
      let appliedWeight = itemQuantity * itemWeight;
      //@ts-ignore
      const isEquipped: boolean = item.data.data.equipped;
      if (isEquipped) {
        //@ts-ignore
        const isProficient: boolean = item.data.data.proficient;
        if (isProficient) {
          appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'profEquippedMultiplier');
        } else {
          appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'equippedMultiplier');
        }
      } else {
        appliedWeight *= <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unequippedMultiplier');
      }
      return weight + appliedWeight;
    }, 0);
    // END TOTAL WEIGHT

    // [Optional] add Currency Weight (for non-transformed actors)
    //@ts-ignore
    if (getGame().settings.get('dnd5e', 'currencyWeight') && actorEntity.data.data.currency) {
      //@ts-ignore
      const currency = actorEntity.data.data.currency;
      const numCoins = <number>Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0);

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
      if (<number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight') > 0) {
        currencyPerWeight = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight');
      }
      totalWeight += numCoins / currencyPerWeight;
    }

    // Compute Encumbrance percentage
    totalWeight = totalWeight.toNearest(0.1);

    let max = 0;
    let pct = 0;

    if (actorEntity.type == EncumbranceActorType.CHARACTER) {
      // CHARACTER
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

      if (<number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier') > 0) {
        strengthMultiplier = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier');
      }

      // const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
      //@ts-ignore
      max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
      pct = Math.clamped((totalWeight * 100) / max, 0, 100);
    } else if (actorEntity.type == EncumbranceActorType.VEHICLE) {
      // VEHICLE

      // Vehicle weights are an order of magnitude greater.
      totalWeight /= getGame().settings.get('dnd5e', 'metricWeightUnits')
        ? //@ts-ignore
          CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.metric
        : //@ts-ignore
          CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.imperial;

      // Compute overall encumbrance
      // const max = actorData.data.attributes.capacity.cargo;
      //@ts-ignore
      max = (actorData.data.attributes.capacity.cargo * mod).toNearest(0.1);
      pct = Math.clamped((totalWeight * 100) / max, 0, 100);
    } else {
      // NO CHARACTER, NO VEHICLE
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

      if (<number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier') > 0) {
        strengthMultiplier = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier');
      }

      // const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
      //@ts-ignore
      max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
      pct = Math.clamped((totalWeight * 100) / max, 0, 100);
    }

    let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
    if (totalWeight > lightMax && totalWeight <= mediumMax) {
      speedDecrease = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease');
      encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
    }
    if (totalWeight > mediumMax && totalWeight <= heavyMax) {
      speedDecrease = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease');
      encumbranceTier = ENCUMBRANCE_TIERS.HEAVY;
    }
    if (totalWeight > heavyMax) {
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
  addDynamicEffects: async function (effectName: string, actor: Actor, speedDecrease: number): Promise<Effect | null> {
    // const invMidiQol = <boolean>getGame().modules.get(VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME)?.active;
    switch (effectName.toLowerCase()) {
      case ENCUMBRANCE_STATE.ENCUMBERED.toLowerCase(): {
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
        // }
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
        // }
        const effect = VariantEncumbranceImpl._encumbered();
        const speedDecreased = speedDecrease > 0 ? speedDecrease : 10;
        VariantEncumbranceImpl._addEncumbranceEffects({ effect, actor, value: speedDecreased });
        return effect;
      }
      case ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED.toLowerCase(): {
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
        // }
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
        // }
        let effect: Effect;
        if (invMidiQol) {
          effect = VariantEncumbranceImpl._heavilyEncumbered();
        } else {
          effect = VariantEncumbranceImpl._heavilyEncumberedNoMidi();
        }
        const speedDecreased = speedDecrease > 0 ? speedDecrease : 20;
        VariantEncumbranceImpl._addEncumbranceEffects({ effect, actor, value: speedDecreased });
        return effect;
      }
      case ENCUMBRANCE_STATE.UNENCUMBERED.toLowerCase(): {
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
        // }
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
        // }
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.OVERBURDENED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.OVERBURDENED, actor);
        // }
        return null;
      }
      case ENCUMBRANCE_STATE.OVERBURDENED.toLowerCase(): {
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.ENCUMBERED, actor);
        // }
        // if (await VariantEncumbranceImpl.hasEffectApplied(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor)) {
        //   VariantEncumbranceImpl.removeEffect(ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED, actor);
        // }
        let effect: Effect;
        if (invMidiQol) {
          effect = VariantEncumbranceImpl._overburdenedEncumbered();
        } else {
          effect = VariantEncumbranceImpl._overburdenedEncumberedNoMidi();
        }
        VariantEncumbranceImpl._addEncumbranceEffectsOverburdened({ effect, actor });
        return effect;
      }
      default: {
        throw new Error("The effect name '" + effectName + "' is not recognized");
      }
    }
  },

  _encumbered: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.ENCUMBERED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.encumbered'),
      icon: 'icons/svg/down.svg',
      isDynamic: true,
    });
  },

  _heavilyEncumbered: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.heavily_encumbered'),
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

  _heavilyEncumberedNoMidi: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.heavily_encumbered'),
      icon: 'icons/svg/downgrade.svg',
      isDynamic: true,
      changes: [],
    });
  },

  _overburdenedEncumbered: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.OVERBURDENED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.overburdened'),
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

  _overburdenedEncumberedNoMidi: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.OVERBURDENED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.overburdened'),
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
    // const movement = actor.data.data.attributes.movement;

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
  async hasEffectApplied(effectName: string, actor: Actor): Promise<boolean> {
    // const actor = await this._foundryHelpers.getActorByUuid(uuid);
    return actor?.data?.effects?.some(
      (activeEffect) =>
        <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
    );
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
  async hasEffectAppliedFromId(effect: ActiveEffect, actor: Actor): Promise<boolean> {
    // const actor = await this._foundryHelpers.getActorByUuid(uuid);
    return actor?.data?.effects?.some(
      (activeEffect) =>
        <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?._id == effect.id,
    );
  },

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffect(effectName: string, actor: Actor) {
    // const actor = await this._foundryHelpers.getActorByUuid(uuid);
    const effectToRemove = actor.data.effects.find(
      (activeEffect) =>
        <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
    );

    if (effectToRemove) {
      // actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemove.id]);
      // effectInterface.removeEffect(effectToRemove.data.label, actor.id);
      // Why i need this ??? for avoid the double AE
      await effectToRemove.update({ disabled: true });
      await effectToRemove.delete();

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
  async removeEffectFromId(effectToRemove: ActiveEffect, actor: Actor) {
    if (effectToRemove) {
      // actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemove.id]);
      // effectInterface.removeEffect(effectToRemove.data.label, actor.id);
      // Why i need this ??? for avoid the double AE
      await effectToRemove.update({ disabled: true });
      await effectToRemove.delete();
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
  async addEffect(effectName: string, actor: Actor, origin: string, encumbranceTier: number) {
    let speedDecrease: number | null = 0;
    if (encumbranceTier == ENCUMBRANCE_TIERS.NONE) {
      speedDecrease = 0;
    } else if (encumbranceTier == ENCUMBRANCE_TIERS.LIGHT) {
      speedDecrease = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease');
    } else if (encumbranceTier == ENCUMBRANCE_TIERS.HEAVY) {
      speedDecrease = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease');
    } else if (encumbranceTier == ENCUMBRANCE_TIERS.MAX) {
      speedDecrease = null;
    }
    // let effect = VariantEncumbranceImpl.findEffectByName(effectName, actor.id);
    //const actor = await VariantEncumbranceImpl._foundryHelpers.getActorByUuid(uuid);
    // if (effect.isDynamic) {
    const effect: Effect | null = await VariantEncumbranceImpl.addDynamicEffects(
      effectName,
      actor,
      <number>speedDecrease,
    );
    // }
    if (effect) {
      // VariantEncumbranceImpl._handleIntegrations(effect);
      // effect.flags = {
      //   VariantEncumbrance: {
      //     tier: encumbranceTier,
      //   },
      // };
      effect.flags = {
        'variant-encumbrance-dnd5e': {
          tier: encumbranceTier,
        },
      };
      const activeEffectData = effect.convertToActiveEffectData(origin);
      actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);
      // effectInterface.addEffect(effectName, actor.id, origin);
      log(`Added effect ${effect.name ? effect.name : effectName} to ${actor.name} - ${actor.id}`);
    }
  },
};

function calcItemWeight(item: Item) {
  //@ts-ignore
  if (item.type !== 'backpack' || item.items === undefined) {
    return _calcItemWeight(item);
  }
  //@ts-ignore
  let weight = item.items.reduce((acc, item) => {
    return acc + (item.calcWeight() ?? 0);
  }, (item.type === 'backpack' ? 0 : _calcItemWeight(item)) ?? 0);

  // [Optional] add Currency Weight (for non-transformed actors)
  //@ts-ignore
  if (getGame().settings.get('dnd5e', 'currencyWeight') && item.data.data.currency) {
    //@ts-ignore
    const currency = item.data.data.currency ?? {};
    const numCoins = <number>Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0);

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
    if (<number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight') > 0) {
      currencyPerWeight = <number>getGame().settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight');
    }
    weight = Math.round(weight + numCoins / currencyPerWeight);
  } else {
    //@ts-ignore
    const currency = item.data.data.currency ?? {};
    const numCoins = currency ? Object.keys(currency).reduce((val, denom) => val + currency[denom], 0) : 0;
    weight = Math.round(weight + numCoins / 50);
  }
  return Math.round(weight);
}

function _calcItemWeight(item: Item) {
  //@ts-ignore
  const quantity = item.data.data.quantity || 1;
  //@ts-ignore
  const weight = item.data.data.weight || 0;
  return Math.round(weight * quantity * 100) / 100;
}
