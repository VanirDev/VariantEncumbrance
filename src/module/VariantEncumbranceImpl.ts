/**
 * Author: Vanir#0001 (Discord) | github.com/VanirDev
 * Software License: Creative Commons Attributions International License
 */

// Import JavaScript modules
import {
  VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME,
  VARIANT_ENCUMBRANCE_MODULE_NAME,
  VARIANT_ENCUMBRANCE_FLAG,
  VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME,
} from './settings';
import { error, i18n, log, warn } from '../VariantEncumbrance';
import {
  EncumbranceActorType,
  // EncumbranceActorType,
  EncumbranceData,
  EncumbranceDnd5e,
  EncumbranceFlags,
  EncumbranceMode,
  VariantEncumbranceItemData,
} from './VariantEncumbranceModels';
import Effect from './effects/effect';
import {
  dfQualityLifeActive,
  dfredsConvenientEffectsActive,
  ENCUMBRANCE_STATE,
  invMidiQol,
  invPlusActive,
} from './Hooks';
import {
  ActorData,
  ItemData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import EffectInterface from './effects/effect-interface';
import { canvas, game } from './settings';

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

    // const enableVarianEncumbranceWeightOnActorFlag = <boolean>(
    //   actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.ENABLED_WE)
    // );
    // if (!enableVarianEncumbranceWeightOnActorFlag) {
    //   return;
    // }

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
          try {
            mergeObject(<ItemData>itemCurrent.data, updatedItem);
          } catch (e) {
            error(e?.message);
          }
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
      const im = <Item>game.items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
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
    if (<boolean>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'enablePreCheckEncumbranceTier')) {
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

      // Remove AE with empty a label but with flag of variant encumbrance ???
      if (!effectNameToSet && hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`)) {
        await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
        continue;
      }

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

    if (!game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useVariantEncumbrance')) {
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
          const origin = `Actor.${actorEntity.data._id}`;
          await VariantEncumbranceImpl.addEffect(effectName, actorEntity, origin, encumbranceTier);
        }
      }
    }
  },

  // manageActiveEffectLimited: async function (actorEntity: Actor) {
  //   for (const effectEntity of actorEntity.effects) {
  //     const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;

  //     if (!effectNameToSet) {
  //       continue;
  //     }

  //     if (
  //       hasProperty(effectEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}`) &&
  //       (effectNameToSet === ENCUMBRANCE_STATE.UNENCUMBERED ||
  //         effectNameToSet === ENCUMBRANCE_STATE.ENCUMBERED ||
  //         effectNameToSet === ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED ||
  //         effectNameToSet === ENCUMBRANCE_STATE.OVERBURDENED)
  //     ) {
  //       await VariantEncumbranceImpl.removeEffectFromId(effectEntity, actorEntity);
  //     }
  //   }
  // },

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
    const useStandardWeightCalculation = game.settings.get(
      VARIANT_ENCUMBRANCE_MODULE_NAME,
      'useStandardWeightCalculation',
    );
    if (!enableVarianEncumbranceWeightOnActorFlag && !useStandardWeightCalculation) {
      if (hasProperty(actorEntity.data, `flags.${VARIANT_ENCUMBRANCE_FLAG}.${EncumbranceFlags.DATA}`)) {
        return <EncumbranceData>actorEntity.getFlag(VARIANT_ENCUMBRANCE_FLAG, EncumbranceFlags.DATA);
      } else {
        // Inventory encumbrance STANDARD
        const dataEncumbrance =
          //@ts-ignore
          _standardActorWeightCalculation(actorEntity) ?? actorEntity.data.data.attributes.encumbrance;
        return dataEncumbrance;
      }
    } else if (!enableVarianEncumbranceWeightOnActorFlag && useStandardWeightCalculation) {
      // Inventory encumbrance STANDARD
      const dataEncumbrance =
        //@ts-ignore
        _standardActorWeightCalculation(actorEntity) ?? actorEntity.data.data.attributes.encumbrance;
      return dataEncumbrance;
    } else if (enableVarianEncumbranceWeightOnActorFlag && useStandardWeightCalculation) {
      // Inventory encumbrance STANDARD
      const dataEncumbrance =
        //@ts-ignore
        _standardActorWeightCalculation(actorEntity) ?? actorEntity.data.data.attributes.encumbrance;
      return dataEncumbrance;
    } else if (enableVarianEncumbranceWeightOnActorFlag && !useStandardWeightCalculation) {
      const invPlusCategoriesWeightToAdd = new Map<string, number>();

      // START TOTAL WEIGHT
      // Get the total weight from items
      const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
      // let totalWeight: number = actorEntity.data.items.reduce((weight, item) => {
      let totalWeight: number = inventoryItems.reduce((weight, item) => {
        if (!physicalItems.includes(item.type)) {
          return weight;
        }

        const itemQuantity =
          //@ts-ignore
          (item.data.quantity && item.data.quantity != item.data.data?.quantity
            ? //@ts-ignore
              item.data.quantity
            : //@ts-ignore
              item.data.data?.quantity) || 0;

        let itemWeight =
          //@ts-ignore
          (item.data.weight && item.data.weight != item.data.data?.weight
            ? //@ts-ignore
              item.data.weight
            : //@ts-ignore
              item.data.data?.weight) || 0;

        let ignoreEquipmentCheck = false;

        // External modules calculation

        // Start Item container check
        if (
          getProperty(item, 'data.flags.itemcollection.bagWeight') != null &&
          getProperty(item, 'data.flags.itemcollection.bagWeight') != undefined
        ) {
          const weightless = getProperty(item, 'data.data.capacity.weightless') ?? false;
          if (weightless) {
            itemWeight = getProperty(item, 'data.flags.itemcollection.bagWeight');
          } else {
            // itemWeight = calcItemWeight(item) + getProperty(item, 'data.flags.itemcollection.bagWeight');
            // MOD 4535992 Removed variant encumbrance take care of this
            const useEquippedUnequippedItemCollectionFeature = <boolean>(
              game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useEquippedUnequippedItemCollectionFeature')
            );
            itemWeight = calcWeight(item, useEquippedUnequippedItemCollectionFeature);
            //@ts-ignore
            if (useEquippedUnequippedItemCollectionFeature) {
              ignoreEquipmentCheck = true;
            }
          }
        }
        // End Item container check
        // Start inventory+ module is active
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
                // This is a error from the inventory plus developer flags stay on 'item.data' not on the 'item'
                //@ts-ignore
                (item.flags &&
                  //@ts-ignore
                  item.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId) ||
                (item.data?.flags &&
                  //@ts-ignore
                  item.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId) ||
                //@ts-ignore
                (item.data?.data?.flags &&
                  //@ts-ignore
                  item.data?.data?.flags[VARIANT_ENCUMBRANCE_INVENTORY_PLUS_MODULE_NAME]?.category === categoryId)
              ) {
                const section = inventoryPlusCategories[categoryId];
                // Ignore weight
                if (section?.ignoreWeight == true) {
                  itemWeight = 0;
                  ignoreEquipmentCheck = true;
                }
                // Inherent weight
                if (Number(section?.ownWeight) > 0) {
                  if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                    invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
                  }
                }
                // EXIT FOR
                actorHasCustomCategories = true;
                break;
              }
            }
            if (!actorHasCustomCategories) {
              for (const categoryId in inventoryPlusCategories) {
                if (item.type === categoryId) {
                  const section = inventoryPlusCategories[categoryId];
                  // Ignore weight
                  if (section?.ignoreWeight == true) {
                    itemWeight = 0;
                    ignoreEquipmentCheck = true;
                  }
                  // Inherent weight
                  if (Number(section?.ownWeight) > 0) {
                    if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                      invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
                    }
                  }
                  // EXIT FOR
                  break;
                }
              }
            }
          }
        }
        // End Inventory+ module is active

        // End External modules calculation

        let appliedWeight = itemQuantity * itemWeight;
        if (ignoreEquipmentCheck) {
          return weight + appliedWeight;
        }
        const isEquipped: boolean =
          //@ts-ignore
          (item.data.equipped && item.data.equipped != item.data.data?.equipped
            ? //@ts-ignore
              item.data.equipped
            : //@ts-ignore
              item.data.data?.equipped) || false;
        if (isEquipped) {
          const isProficient: boolean =
            //@ts-ignore
            (item.data.proficient && item.data.proficient != item.data.data?.proficient
              ? //@ts-ignore
                item.data.proficient
              : //@ts-ignore
                item.data.data?.proficient) || false;
          if (isProficient) {
            appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'profEquippedMultiplier');
          } else {
            appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'equippedMultiplier');
          }
        } else {
          appliedWeight *= <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unequippedMultiplier');
        }
        return weight + appliedWeight;
      }, 0);

      // Start inventory+ module is active 2
      if (invPlusActive) {
        for (const [key, value] of invPlusCategoriesWeightToAdd) {
          totalWeight = totalWeight + value;
        }
      }
      // End inventory+ module is active 2
      // END TOTAL WEIGHT

      // [Optional] add Currency Weight (for non-transformed actors)
      //@ts-ignore
      if (game.settings.get('dnd5e', 'currencyWeight') && actorEntity.data.data.currency) {
        //@ts-ignore
        const currency = actorEntity.data.data.currency;
        const numCoins = <number>(
          Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0)
        );

        const currencyPerWeight = game.settings.get('dnd5e', 'metricWeightUnits')
          ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeightMetric')
          : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight');

        totalWeight += numCoins / currencyPerWeight;
      }

      // Compute Encumbrance percentage
      totalWeight = totalWeight.toNearest(0.1);

      let speedDecrease = 0;

      let modForSize = 1; //actorEntity.data.data.abilities.str.value;
      if (game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'sizeMultipliers')) {
        //@ts-ignore
        const size = actorEntity.data.data.traits.size;
        if (size === 'tiny') {
          modForSize *= 0.5;
        } else if (size === 'sm') {
          modForSize *= 1;
        } else if (size === 'med') {
          modForSize *= 1;
        } else if (size === 'lg') {
          modForSize *= 2;
        } else if (size === 'huge') {
          modForSize *= 4;
        } else if (size === 'grg') {
          modForSize *= 8;
        } else {
          modForSize *= 1;
        }
        // Powerful build support
        //@ts-ignore
        if (actorEntity.data?.flags?.dnd5e?.powerfulBuild) {
          //jshint ignore:line
          // mod *= 2;
          modForSize = Math.min(modForSize * 2, 8);
        }
      }

      let strengthMultiplier = 1;
      if (game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useStrengthMultiplier')) {
        strengthMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
          ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplierMetric')
          : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplier');
      }

      let displayedUnits = game.settings.get('dnd5e', 'metricWeightUnits')
        ? <string>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unitsMetric')
        : <string>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units');

      const lightMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
        ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplierMetric')
        : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplier');
      let lightMax = lightMultiplier; // lightMultiplier * strengthScore;

      const mediumMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
        ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplierMetric')
        : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplier');
      let mediumMax = mediumMultiplier; // mediumMultiplier * strengthScore;

      const heavyMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
        ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplierMetric')
        : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier');
      let heavyMax = heavyMultiplier; // heavyMultiplier * strengthScore;

      let max = 0;
      let pct = 0;
      const totalWeightOriginal = totalWeight;

      if (actorEntity.type == EncumbranceActorType.CHARACTER) {
        // ==================
        // CHARACTER
        // ==================
        // const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize).toNearest(0.1);
        //@ts-ignore
        max = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
        pct = Math.clamped((totalWeight * 100) / max, 0, 100);
        //@ts-ignore
        const strengthScore = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
        lightMax = lightMultiplier * strengthScore;
        mediumMax = mediumMultiplier * strengthScore;
        heavyMax = heavyMultiplier * strengthScore;
      } else if (actorEntity.type == EncumbranceActorType.VEHICLE) {
        // ===============================
        // VEHICLE
        // ===============================
        // MOD 4535992 FROM 2000 to 1 SO I REMOVED ???
        /*
        const vehicleWeightMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
          ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplierMetric')
          : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'vehicleWeightMultiplier');

        // Vehicle weights are an order of magnitude greater.
        
        totalWeight /= vehicleWeightMultiplier;
        */
        // TODO
        //totalWeight /= <number>this.document.getFlag(SETTINGS.MOD_NAME, 'unit') || vehicleWeightMultiplier;

        // Integration with DragonFlagon Quality of Life, Vehicle Cargo Capacity Unit Feature
        if (dfQualityLifeActive && actorEntity.getFlag(VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME, `unit`)) {
          const dfVehicleUnit = actorEntity.getFlag(VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME, `unit`);
          switch (dfVehicleUnit) {
            case 2240:
              totalWeight /= dfVehicleUnit;
              displayedUnits = 'L.Ton';
              break;
            case 2000:
              totalWeight /= dfVehicleUnit;
              displayedUnits = 'S.Ton';
              break;
            case 1:
              totalWeight /= dfVehicleUnit;
              displayedUnits = 'lbs';
              break;
          }
        } else if (dfQualityLifeActive && actorEntity.getFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, EncumbranceFlags.DATA)) {
          const encumbranceData = <EncumbranceData>(
            actorEntity.getFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, EncumbranceFlags.DATA)
          );
          const dfVehicleUnitLabel = encumbranceData.unit;
          switch (dfVehicleUnitLabel) {
            case 'L.Ton':
              totalWeight /= 2240;
              displayedUnits = 'L.Ton';
              break;
            case 'S.Ton':
              totalWeight /= 2000;
              displayedUnits = 'S.Ton';
              break;
            case 'lbs':
              totalWeight /= 1;
              displayedUnits = 'lbs';
              break;
            default:
              totalWeight /= 1;
              displayedUnits = 'lbs';
              break;
          }
        }
        //@ts-ignore
        const capacityCargo = <number>actorEntity.data.data.attributes.capacity.cargo;
        // Compute overall encumbrance
        // const max = actorData.data.attributes.capacity.cargo;
        max = capacityCargo * strengthMultiplier * modForSize;
        pct = Math.clamped((totalWeightOriginal * 100) / max, 0, 100);
        // Manage vehicle specific case
        // lightMax = lightMultiplier * capacityCargo * strengthMultiplier * modForSize;
        // mediumMax = mediumMultiplier * capacityCargo * strengthMultiplier * modForSize;
        // heavyMax = heavyMultiplier * capacityCargo * strengthMultiplier * modForSize;
        lightMax = capacityCargo * strengthMultiplier * modForSize * 0.33;
        mediumMax = capacityCargo * strengthMultiplier * modForSize * 0.66;
        heavyMax = capacityCargo * strengthMultiplier * modForSize;
      } else {
        // ===========================
        // NO CHARACTER, NO VEHICLE (BY DEFAULT THE CHARACTER)
        // ===========================
        // const max = (actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize).toNearest(0.1);
        //@ts-ignore
        max = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
        pct = Math.clamped((totalWeight * 100) / max, 0, 100);
        //@ts-ignore
        const strengthScore = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
        lightMax = lightMultiplier * strengthScore;
        mediumMax = mediumMultiplier * strengthScore;
        heavyMax = heavyMultiplier * strengthScore;
      }

      let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
      if (totalWeight > lightMax && totalWeight <= mediumMax) {
        speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease');
        encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
      }
      if (totalWeight > mediumMax && totalWeight <= heavyMax) {
        speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease');
        encumbranceTier = ENCUMBRANCE_TIERS.HEAVY;
      }
      if (totalWeight > heavyMax) {
        encumbranceTier = ENCUMBRANCE_TIERS.MAX;
      }

      // Inventory encumbrance
      // actorEntity.data.data.attributes.encumbrance = { value: totalWeight.toNearest(0.1), max, pct, encumbered: pct > (200/3) };
      //@ts-ignore
      (<EncumbranceDnd5e>actorEntity.data.data.attributes.encumbrance) = {
        value: totalWeightOriginal.toNearest(0.1),
        max: max.toNearest(0.1),
        pct,
        encumbered: encumbranceTier != ENCUMBRANCE_TIERS.NONE,
      };

      return {
        totalWeight: totalWeightOriginal.toNearest(0.1),
        totalWeightToDisplay: totalWeight.toNearest(0.1),
        lightMax: lightMax.toNearest(0.1),
        mediumMax: mediumMax.toNearest(0.1),
        heavyMax: heavyMax.toNearest(0.1),
        // totalMax: max,
        encumbranceTier: encumbranceTier,
        speedDecrease: speedDecrease,
        unit: displayedUnits,
      };
    } else {
      throw new Error('Something is wrong');
    }
  },

  /**
   * Adds dynamic effects for specific effects
   *
   * @param {Effect} effect - the effect to handle
   * @param {Actor5e} actor - the effected actor
   */
  addDynamicEffects: async function (effectName: string, actor: Actor, speedDecrease: number): Promise<Effect | null> {
    // const invMidiQol = <boolean>game.modules.get(VARIANT_ENCUMBRANCE_MIDI_QOL_MODULE_NAME)?.active;
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
      transfer: true,
    });
  },

  _heavilyEncumbered: function (): Effect {
    return new Effect({
      name: ENCUMBRANCE_STATE.HEAVILY_ENCUMBERED,
      description: i18n('variant-encumbrance-dnd5e.effect.description.heavily_encumbered'),
      icon: 'icons/svg/downgrade.svg',
      isDynamic: true,
      transfer: true,
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
      transfer: true,
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
      transfer: true,
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
      transfer: true,
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
    /*
    // const actor = await this._foundryHelpers.getActorByUuid(uuid);
    return actor?.data?.effects?.some(
      (activeEffect) =>
        <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
    );
    */
    return (<EffectInterface>game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface).hasEffectAppliedOnActor(
      effectName,
      <string>actor.id,
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
    /*
    // const actor = await this._foundryHelpers.getActorByUuid(uuid);
    return actor?.data?.effects?.some(
      (activeEffect) =>
        <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?._id == effect.id,
    );
    */
    return (<EffectInterface>game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface).hasEffectAppliedFromIdOnActor(
      <string>effect.id,
      <string>actor.id,
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
    /*
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
    */
    return (<EffectInterface>game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface).removeEffect(
      effectName,
      <string>actor.id,
    );
  },

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectFromId(effectToRemove: ActiveEffect, actor: Actor) {
    /*
    if (effectToRemove) {
      // actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemove.id]);
      // effectInterface.removeEffect(effectToRemove.data.label, actor.id);
      // Why i need this ??? for avoid the double AE
      await effectToRemove.update({ disabled: true });
      await effectToRemove.delete();
      log(`Removed effect ${effectToRemove?.data?.label} from ${actor.name} - ${actor.id}`);
    }
    */
    return (<EffectInterface>game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface).removeEffectFromIdOnActor(
      <string>effectToRemove.id,
      <string>actor.id,
    );
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
      speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightWeightDecrease');
    } else if (encumbranceTier == ENCUMBRANCE_TIERS.HEAVY) {
      speedDecrease = <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyWeightDecrease');
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
      /*
      if (dfredsConvenientEffectsActive) {
        //@ts-ignore
        const arrayCustomEffects: Effect[] = game.dfreds?.effects?.customEffects || [];
        const isPresentonCustomEffect = arrayCustomEffects.find(
          (customEffect: Effect) => <boolean>customEffect.flags.isConvenient && <string>customEffect.name == effectName,
        );
        if (!isPresentonCustomEffect) {
          //@ts-ignore
          game.dfreds?.effects?.customEffects?.push(effect);
        }
      }
      */
      /*
      const activeEffectData = effect.convertToActiveEffectData(origin);
      actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);
      // effectInterface.addEffect(effectName, actor.id, origin);
      log(`Added effect ${effect.name ? effect.name : effectName} to ${actor.name} - ${actor.id}`);
      */
      return (<EffectInterface>game[VARIANT_ENCUMBRANCE_MODULE_NAME].effectInterface).addEffectOnActor(
        effectName,
        <string>actor.id,
        effect,
      );
    }
  },
};

export const isEnabledActorType = function (actorEntity: Actor): boolean {
  const useVarianEncumbranceWithSpecificType: string[] = game.settings.get(
    VARIANT_ENCUMBRANCE_MODULE_NAME,
    'useVarianEncumbranceWithSpecificType',
  )
    ? String(game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useVarianEncumbranceWithSpecificType')).split(',')
    : [];
  if (
    actorEntity &&
    useVarianEncumbranceWithSpecificType.length > 0 &&
    useVarianEncumbranceWithSpecificType.includes(<string>actorEntity?.type)
  ) {
    return true;
  }
  return false;
};

// ===========================
// Item Collection/Container SUPPORT
// ===========================

function calcWeight(
  item: Item,
  useEquippedUnequippedItemCollectionFeature: boolean,
  { ignoreItems, ignoreTypes } = { ignoreItems: undefined, ignoreTypes: undefined },
) {
  if (item.type !== 'backpack' || !item.data.flags.itemcollection) return calcItemWeight(item);
  // if (item.parent instanceof Actor && !item.data.data.equipped) return 0;
  // MOD 4535992 Removed variant encumbrance take care of this
  // const useEquippedUnequippedItemCollectionFeature = game.settings.get(
  //   VARIANT_ENCUMBRANCE_MODULE_NAME,
  //   'useEquippedUnequippedItemCollectionFeature',
  // );
  const isEquipped: boolean =
    //@ts-ignore
    (item.data.equipped && item.data.equipped != item.data.data?.equipped
      ? //@ts-ignore
        item.data.equipped
      : //@ts-ignore
        item.data.data?.equipped) || false;
  //@ts-ignore
  if (useEquippedUnequippedItemCollectionFeature && !isEquipped) {
    return 0;
  }
  // END MOD 4535992
  const weightless = getProperty(item, 'data.data.capacity.weightless') ?? false;
  if (weightless) return getProperty(item, 'data.flags.itemcollection.bagWeight') ?? 0;
  return (
    calcItemWeight(item, { ignoreItems, ignoreTypes }) + (getProperty(item, 'data.flags.itemcollection.bagWeight') ?? 0)
  );
}

function calcItemWeight(item: Item, { ignoreItems, ignoreTypes } = { ignoreItems: undefined, ignoreTypes: undefined }) {
  //@ts-ignore
  if (item.type !== 'backpack' || item.items === undefined) return _calcItemWeight(item);
  //@ts-ignore
  let weight = item.items.reduce((acc, item) => {
    //@ts-ignore
    if (ignoreTypes?.some((name) => item.name.includes(name))) return acc;
    //@ts-ignore
    if (ignoreItems?.includes(item.name)) return acc;
    return acc + (item.calcWeight() ?? 0);
  }, (item.type === 'backpack' ? 0 : _calcItemWeight(item)) ?? 0);
  // [Optional] add Currency Weight (for non-transformed actors)
  //@ts-ignore
  if (game.settings.get('dnd5e', 'currencyWeight') && item.data.data.currency) {
    //@ts-ignore
    const currency = item.data.data.currency ?? {};
    const numCoins = <number>Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0);

    const currencyPerWeight = game.settings.get('dnd5e', 'metricWeightUnits')
      ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeightMetric')
      : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'currencyWeight');

    weight = Math.round(weight + numCoins / currencyPerWeight);
  } else {
    //@ts-ignore
    const currency = item.data.data.currency ?? {};
    const numCoins = currency ? Object.keys(currency).reduce((val, denom) => val + currency[denom], 0) : 0;
    weight = Math.round(weight + numCoins / 50);
  }
  return weight;
}

function _calcItemWeight(item: Item) {
  // const quantity = item.data.data.quantity || 1;
  // const weight = item.data.data.weight || 0;
  const quantity =
    //@ts-ignore
    (item.data.quantity && item.data.quantity != item.data.data?.quantity
      ? //@ts-ignore
        item.data.quantity
      : //@ts-ignore
        item.data.data?.quantity) || 0;
  const weight =
    //@ts-ignore
    (item.data.weight && item.data.weight != item.data.data?.weight
      ? //@ts-ignore
        item.data.weight
      : //@ts-ignore
        item.data.data?.weight) || 0;
  return Math.round(weight * quantity * 100) / 100;
}

// ============================
// STANDARD SYSTEM CALCULATION SUPPORT
// ============================

function _standardActorWeightCalculation(actorEntity: Actor): EncumbranceData {
  let modForSize = 1; //actorEntity.data.data.abilities.str.value;
  if (game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'sizeMultipliers')) {
    //@ts-ignore
    const size = actorEntity.data.data.traits.size;
    if (size === 'tiny') {
      modForSize *= 0.5;
    } else if (size === 'sm') {
      modForSize *= 1;
    } else if (size === 'med') {
      modForSize *= 1;
    } else if (size === 'lg') {
      modForSize *= 2;
    } else if (size === 'huge') {
      modForSize *= 4;
    } else if (size === 'grg') {
      modForSize *= 8;
    } else {
      modForSize *= 1;
    }
    // Powerful build support
    //@ts-ignore
    if (actorEntity.data?.flags?.dnd5e?.powerfulBuild) {
      //jshint ignore:line
      // mod *= 2;
      modForSize = Math.min(modForSize * 2, 8);
    }
  }

  let strengthMultiplier = 1;
  if (game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'useStrengthMultiplier')) {
    strengthMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
      ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplierMetric')
      : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'strengthMultiplier');
  }

  let displayedUnits = game.settings.get('dnd5e', 'metricWeightUnits')
    ? <string>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'unitsMetric')
    : <string>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'units');

  // const strengthScore = actorEntity.data.data.abilities.str.value * modForSize;

  const lightMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
    ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplierMetric')
    : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'lightMultiplier');
  let lightMax = lightMultiplier; // lightMultiplier * strengthScore;

  const mediumMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
    ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplierMetric')
    : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'mediumMultiplier');
  let mediumMax = mediumMultiplier; // mediumMultiplier * strengthScore;

  const heavyMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
    ? <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplierMetric')
    : <number>game.settings.get(VARIANT_ENCUMBRANCE_MODULE_NAME, 'heavyMultiplier');
  let heavyMax = heavyMultiplier; // heavyMultiplier * strengthScore;

  let dataEncumbrance: EncumbranceDnd5e;
  if (actorEntity.type == EncumbranceActorType.CHARACTER) {
    dataEncumbrance = _standardCharacterWeightCalculation(actorEntity);
    //@ts-ignore
    const strengthScore = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
    lightMax = lightMultiplier * strengthScore;
    mediumMax = mediumMultiplier * strengthScore;
    heavyMax = heavyMultiplier * strengthScore;
  } else if (actorEntity.type == EncumbranceActorType.VEHICLE) {
    dataEncumbrance = _standardVehicleWeightCalculation(actorEntity);
    // Integration with DragonFlagon Quality of Life, Vehicle Cargo Capacity Unit Feature
    if (dfQualityLifeActive && actorEntity.getFlag(VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME, `unit`)) {
      const dfVehicleUnit = actorEntity.getFlag(VARIANT_ENCUMBRANCE_DF_QUALITY_OF_LIFE_MODULE_NAME, `unit`);
      switch (dfVehicleUnit) {
        case 2240:
          dataEncumbrance.value /= dfVehicleUnit;
          displayedUnits = 'L.Ton';
          break;
        case 2000:
          dataEncumbrance.value /= dfVehicleUnit;
          displayedUnits = 'S.Ton';
          break;
        case 1:
          dataEncumbrance.value /= dfVehicleUnit;
          displayedUnits = 'lbs';
          break;
      }
    } else if (dfQualityLifeActive && actorEntity.getFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, EncumbranceFlags.DATA)) {
      const encumbranceData = <EncumbranceData>(
        actorEntity.getFlag(VARIANT_ENCUMBRANCE_MODULE_NAME, EncumbranceFlags.DATA)
      );
      const dfVehicleUnitLabel = encumbranceData.unit;
      switch (dfVehicleUnitLabel) {
        case 'L.Ton':
          dataEncumbrance.value /= 2240;
          displayedUnits = 'L.Ton';
          break;
        case 'S.Ton':
          dataEncumbrance.value /= 2000;
          displayedUnits = 'S.Ton';
          break;
        case 'lbs':
          dataEncumbrance.value /= 1;
          displayedUnits = 'lbs';
          break;
        default:
          dataEncumbrance.value /= 1;
          displayedUnits = 'lbs';
          break;
      }
    }
    //@ts-ignore
    const capacityCargo = <number>actorEntity.data.data.attributes.capacity.cargo;
    // Compute overall encumbrance
    // Manage vehicle specific case
    // lightMax = lightMultiplier * capacityCargo * strengthMultiplier * modForSize;
    // mediumMax = mediumMultiplier * capacityCargo * strengthMultiplier * modForSize;
    // heavyMax = heavyMultiplier * capacityCargo * strengthMultiplier * modForSize;
    lightMax = capacityCargo * strengthMultiplier * modForSize * 0.33;
    mediumMax = capacityCargo * strengthMultiplier * modForSize * 0.66;
    heavyMax = capacityCargo * strengthMultiplier * modForSize;
  } else {
    dataEncumbrance = _standardCharacterWeightCalculation(actorEntity);
    //@ts-ignore
    const strengthScore = actorEntity.data.data.abilities.str.value * strengthMultiplier * modForSize;
    lightMax = lightMultiplier * strengthScore;
    mediumMax = mediumMultiplier * strengthScore;
    heavyMax = heavyMultiplier * strengthScore;
  }

  let encumbranceTier = ENCUMBRANCE_TIERS.NONE;
  const totalWeight = dataEncumbrance.value;
  // const max = dataEncumbrance.max;

  if (dataEncumbrance.encumbered) {
    if (totalWeight > lightMax && totalWeight <= mediumMax) {
      encumbranceTier = ENCUMBRANCE_TIERS.LIGHT;
    }
    if (totalWeight > mediumMax && totalWeight <= heavyMax) {
      encumbranceTier = ENCUMBRANCE_TIERS.HEAVY;
    }
    if (totalWeight > heavyMax) {
      encumbranceTier = ENCUMBRANCE_TIERS.MAX;
    }
  }

  return {
    totalWeight: totalWeight.toNearest(0.1),
    totalWeightToDisplay: totalWeight.toNearest(0.1),
    lightMax: lightMax.toNearest(0.1),
    mediumMax: mediumMax.toNearest(0.1),
    heavyMax: heavyMax.toNearest(0.1),
    // totalMax: max,
    encumbranceTier: encumbranceTier,
    speedDecrease: 0,
    unit: displayedUnits,
  };
}

function _standardCharacterWeightCalculation(actorEntity: Actor): EncumbranceDnd5e {
  //@ts-ignore
  return <EncumbranceDnd5e>actorEntity._computeEncumbrance(actorEntity.data);
}

function _standardVehicleWeightCalculation(actorEntity: Actor): EncumbranceDnd5e {
  const data = actorEntity.data;
  // Classify items owned by the vehicle and compute total cargo weight
  let totalWeight = 0;
  for (const item of data.items) {
    //@ts-ignore
    actorEntity._prepareCrewedItem(item);

    // Handle cargo explicitly
    //@ts-ignore
    const isCargo = item.flags.dnd5e?.vehicleCargo === true;
    if (isCargo) {
      //@ts-ignore
      totalWeight += (item.data.weight || 0) * item.data.quantity;
      // cargo.cargo.items.push(item);
      // MOD 4535992
      //@ts-ignore
      return actorEntity._computeEncumbrance(totalWeight, data);
      // END MOD 4535992
      // continue;
    }

    // Handle non-cargo item types
    switch (item.type) {
      case 'weapon':
        // features.weapons.items.push(item);
        break;
      case 'equipment':
        // features.equipment.items.push(item);
        break;
      case 'feat':
        // if ( !item.data.activation.type || (item.data.activation.type === "none") ) features.passive.items.push(item);
        // else if (item.data.activation.type === "reaction") features.reactions.items.push(item);
        // else features.actions.items.push(item);
        break;
      default:
        //@ts-ignore
        totalWeight += (item.data.weight || 0) * item.data.quantity;
      // cargo.cargo.items.push(item);
    }
  }

  // Update the rendering context data
  // data.features = Object.values(features);
  // data.cargo = Object.values(cargo);
  // data.data.attributes.encumbrance = actorEntity._computeEncumbrance(totalWeight, data);
  //@ts-ignore
  return <EncumbranceDnd5e>actorEntity._computeEncumbrance(totalWeight, data);
}

// VERSION 1.5.3

// /**
//  * Compute the level and percentage of encumbrance for an Actor.
//  *
//  * Optionally include the weight of carried currency across all denominations by applying the standard rule
//  * from the PHB pg. 143
//  * @param {object} actorData      The data object for the Actor being rendered
//  * @returns {{max: number, value: number, pct: number}}  An object describing the character's encumbrance level
//  * @private
//  */
//  _computeEncumbranceActor(actorData) {

//   // Get the total weight from items
//   const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
//   let weight = actorData.items.reduce((weight, i) => {
//     if ( !physicalItems.includes(i.type) ) return weight;
//     const q = i.data.data.quantity || 0;
//     const w = i.data.data.weight || 0;
//     return weight + (q * w);
//   }, 0);

//   // [Optional] add Currency Weight (for non-transformed actors)
//   if ( game.settings.get("dnd5e", "currencyWeight") && actorData.data.currency ) {
//     const currency = actorData.data.currency;
//     const numCoins = Object.values(currency).reduce((val, denom) => val += Math.max(denom, 0), 0);

//     const currencyPerWeight = game.settings.get("dnd5e", "metricWeightUnits")
//       ? CONFIG.DND5E.encumbrance.currencyPerWeight.metric
//       : CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;

//     weight += numCoins / currencyPerWeight;
//   }

//   // Determine the encumbrance size class
//   let mod = {
//     tiny: 0.5,
//     sm: 1,
//     med: 1,
//     lg: 2,
//     huge: 4,
//     grg: 8
//   }[actorData.data.traits.size] || 1;
//   if ( this.getFlag("dnd5e", "powerfulBuild") ) mod = Math.min(mod * 2, 8);

//   // Compute Encumbrance percentage
//   weight = weight.toNearest(0.1);

//   const strengthMultiplier = game.settings.get("dnd5e", "metricWeightUnits")
//     ? CONFIG.DND5E.encumbrance.strMultiplier.metric
//     : CONFIG.DND5E.encumbrance.strMultiplier.imperial;

//   const max = (actorData.data.abilities.str.value * strengthMultiplier * mod).toNearest(0.1);
//   const pct = Math.clamped((weight * 100) / max, 0, 100);
//   return { value: weight.toNearest(0.1), max, pct, encumbered: pct > (200/3) };
// }

// /**
//  * Compute the total weight of the vehicle's cargo.
//  * @param {number} totalWeight    The cumulative item weight from inventory items
//  * @param {object} actorData      The data object for the Actor being rendered
//  * @returns {{max: number, value: number, pct: number}}
//  * @private
//  */
//  _computeEncumbranceVehicle(totalWeight, actorData) {

//   // Compute currency weight
//   const totalCoins = Object.values(actorData.data.currency).reduce((acc, denom) => acc + denom, 0);

//   const currencyPerWeight = game.settings.get("dnd5e", "metricWeightUnits")
//     ? CONFIG.DND5E.encumbrance.currencyPerWeight.metric
//     : CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;

//   totalWeight += totalCoins / currencyPerWeight;

//   // Vehicle weights are an order of magnitude greater.
//   totalWeight /= game.settings.get("dnd5e", "metricWeightUnits")
//     ? CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.metric
//     : CONFIG.DND5E.encumbrance.vehicleWeightMultiplier.imperial;

//   // Compute overall encumbrance
//   const max = actorData.data.attributes.capacity.cargo;
//   const pct = Math.clamped((totalWeight * 100) / max, 0, 100);
//   return {value: totalWeight.toNearest(0.1), max, pct};
// }
