import { VariantEncumbranceImpl } from './VariantEncumbranceImpl';
import CONSTANTS from './constants';
import type Effect from './effects/effect';
import { checkBulkCategory, error, isStringEquals, warn } from './lib/lib';
import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import type { EncumbranceBulkData, EncumbranceData } from './VariantEncumbranceModels';
import { VariantEncumbranceBulkImpl } from './VariantEncumbranceBulkImpl';
import { invPlusActive } from './modules';
import type { EffectInterfaceApi } from './effects/effect-interface-api';

const API = {
  effectInterface: <EffectInterfaceApi>{},

  // ======================
  // Effect Management
  // ======================

  // async removeEffectArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('removeEffectArr | inAttributes must be of type array');
  //   }
  //   const [params] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectArr(params);
  //   return result;
  // },

  // async toggleEffectArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('toggleEffectArr | inAttributes must be of type array');
  //   }
  //   const [effectName, params] = inAttributes;
  //   const result = await this.effectInterface.toggleEffect(effectName, params);
  //   return result;
  // },

  // async addEffectArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('addEffectArr | inAttributes must be of type array');
  //   }
  //   const [params] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectArr(params);
  //   return result;
  // },

  // async hasEffectAppliedArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('hasEffectAppliedArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.hasEffectApplied(effectName, uuid);
  //   return result;
  // },

  // async addEffectOnActorArr(...inAttributes) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('addEffectOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid, origin, overlay, effect] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnActor(
  //     effectName,
  //     uuid,
  //     origin,
  //     overlay,
  //     effect,
  //   );
  //   return result;
  // },

  // async removeEffectOnActorArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('removeEffectOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnActor(effectName, uuid);
  //   return result;
  // },

  // async removeEffectFromIdOnActorArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('removeEffectFromIdOnActor | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnActor(
  //     effectId,
  //     uuid,
  //   );
  //   return result;
  // },

  // async hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid, includeDisabled] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedFromIdOnActor(
  //     effectId,
  //     uuid,
  //     includeDisabled,
  //   );
  //   return result;
  // },

  // async hasEffectAppliedOnActorArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('hasEffectAppliedOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid, includeDisabled] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.hasEffectAppliedOnActor(
  //     effectName,
  //     uuid,
  //     includeDisabled,
  //   );
  //   return result;
  // },

  // async toggleEffectFromIdOnActorArr(...inAttributes) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('addEffectOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnActor(
  //     effectId,
  //     uuid,
  //     alwaysDelete,
  //     forceEnabled,
  //     forceDisabled,
  //   );
  //   return result;
  // },

  // async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('findEffectByNameOnActorArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnActor(
  //     effectName,
  //     uuid,
  //   );
  //   return result;
  // },

  // async addEffectOnTokenArr(...inAttributes) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('addEffectOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid, origin, overlay, effect] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.addEffectOnToken(
  //     effectName,
  //     uuid,
  //     origin,
  //     overlay,
  //     effect,
  //   );
  //   return result;
  // },

  // async removeEffectOnTokenArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('removeEffectOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectOnToken(effectName, uuid);
  //   return result;
  // },

  // async removeEffectFromIdOnTokenArr(...inAttributes: any[]) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('removeEffectFromIdOnToken | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.removeEffectFromIdOnToken(
  //     effectId,
  //     uuid,
  //   );
  //   return result;
  // },

  // async toggleEffectFromIdOnTokenArr(...inAttributes) {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('addEffectOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.toggleEffectFromIdOnToken(
  //     effectId,
  //     uuid,
  //     alwaysDelete,
  //     forceEnabled,
  //     forceDisabled,
  //   );
  //   return result;
  // },

  // async findEffectByNameOnTokenArr(...inAttributes: any[]): Promise<ActiveEffect | null> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('findEffectByNameOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.findEffectByNameOnToken(
  //     effectName,
  //     uuid,
  //   );
  //   return result;
  // },

  // async updateEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('updateEffectFromIdOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromIdOnToken(
  //     effectId,
  //     uuid,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('updateEffectFromNameOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateEffectFromNameOnToken(
  //     effectName,
  //     uuid,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateActiveEffectFromIdOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('updateActiveEffectFromIdOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectId, uuid, origin, overlay, effectUpdated] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromIdOnToken(
  //     effectId,
  //     uuid,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateActiveEffectFromNameOnTokenArr(...inAttributes: any[]): Promise<boolean | undefined> {
  //   if (!Array.isArray(inAttributes)) {
  //     throw error('updateActiveEffectFromNameOnTokenArr | inAttributes must be of type array');
  //   }
  //   const [effectName, uuid, origin, overlay, effectUpdated] = inAttributes;
  //   const result = await (<EffectInterface>this.effectInterface)._effectHandler.updateActiveEffectFromNameOnToken(
  //     effectName,
  //     uuid,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // // ======================
  // // Effect Actor Management
  // // ======================

  // async addEffectOnActor(actorId: string, effectName: string, effect: Effect) {
  //   const result = await (<EffectInterface>this.effectInterface).addEffectOnActor(effectName, <string>actorId, effect);
  //   return result;
  // },

  // async findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | null> {
  //   const result = await this.effectInterface.findEffectByNameOnActor(effectName, <string>actorId);
  //   return result;
  // },

  // async hasEffectAppliedOnActor(actorId: string, effectName: string, includeDisabled: boolean) {
  //   const result = await this.effectInterface.hasEffectAppliedOnActor(effectName, <string>actorId, includeDisabled);
  //   return result;
  // },

  // async hasEffectAppliedFromIdOnActor(actorId: string, effectId: string, includeDisabled: boolean) {
  //   const result = await this.effectInterface.hasEffectAppliedFromIdOnActor(effectId, <string>actorId, includeDisabled);
  //   return result;
  // },

  // async toggleEffectFromIdOnActor(
  //   actorId: string,
  //   effectId: string,
  //   alwaysDelete: boolean,
  //   forceEnabled?: boolean,
  //   forceDisabled?: boolean,
  // ) {
  //   const result = await this.effectInterface.toggleEffectFromIdOnActor(
  //     effectId,
  //     <string>actorId,
  //     alwaysDelete,
  //     forceEnabled,
  //     forceDisabled,
  //   );
  //   return result;
  // },

  // async addActiveEffectOnActor(actorId: string, activeEffect: ActiveEffect) {
  //   const result = this.effectInterface.addActiveEffectOnActor(<string>actorId, activeEffect.data);
  //   return result;
  // },

  // async removeEffectOnActor(actorId: string, effectName: string) {
  //   const result = await this.effectInterface.removeEffectOnActor(effectName, <string>actorId);
  //   return result;
  // },

  // async removeEffectFromIdOnActor(actorId: string, effectId: string) {
  //   const result = await this.effectInterface.removeEffectFromIdOnActor(effectId, <string>actorId);
  //   return result;
  // },

  // // ======================
  // // Effect Token Management
  // // ======================

  // async addEffectOnToken(tokenId: string, effectName: string, effect: Effect) {
  //   const result = await this.effectInterface.addEffectOnToken(effectName, <string>tokenId, effect);
  //   return result;
  // },

  // async findEffectByNameOnToken(tokenId: string, effectName: string): Promise<ActiveEffect | null> {
  //   const result = await this.effectInterface.findEffectByNameOnToken(effectName, <string>tokenId);
  //   return result;
  // },

  // async hasEffectAppliedOnToken(tokenId: string, effectName: string, includeDisabled: boolean) {
  //   const result = await this.effectInterface.hasEffectAppliedOnToken(effectName, <string>tokenId, includeDisabled);
  //   return result;
  // },

  // async hasEffectAppliedFromIdOnToken(tokenId: string, effectId: string, includeDisabled: boolean) {
  //   const result = await this.effectInterface.hasEffectAppliedFromIdOnToken(effectId, <string>tokenId, includeDisabled);
  //   return result;
  // },

  // async toggleEffectFromIdOnToken(
  //   tokenId: string,
  //   effectId: string,
  //   alwaysDelete: boolean,
  //   forceEnabled?: boolean,
  //   forceDisabled?: boolean,
  // ) {
  //   const result = await this.effectInterface.toggleEffectFromIdOnToken(
  //     effectId,
  //     <string>tokenId,
  //     alwaysDelete,
  //     forceEnabled,
  //     forceDisabled,
  //   );
  //   return result;
  // },

  // async addActiveEffectOnToken(tokenId: string, activeEffect: ActiveEffect) {
  //   const result = this.effectInterface.addActiveEffectOnToken(<string>tokenId, activeEffect.data);
  //   return result;
  // },

  // async removeEffectOnToken(tokenId: string, effectName: string) {
  //   const result = await this.effectInterface.removeEffectOnToken(effectName, <string>tokenId);
  //   return result;
  // },

  // async removeEffectFromIdOnToken(tokenId: string, effectId: string) {
  //   const result = await this.effectInterface.removeEffectFromIdOnToken(effectId, <string>tokenId);
  //   return result;
  // },

  // async updateEffectFromIdOnToken(tokenId: string, effectId: string, origin, overlay, effectUpdated: Effect) {
  //   const result = await this.effectInterface.updateEffectFromIdOnToken(
  //     effectId,
  //     tokenId,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateEffectFromNameOnToken(tokenId: string, effectName: string, origin, overlay, effectUpdated: Effect) {
  //   const result = await this.effectInterface.updateEffectFromNameOnToken(
  //     effectName,
  //     tokenId,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateActiveEffectFromIdOnToken(
  //   tokenId: string,
  //   effectId: string,
  //   origin,
  //   overlay,
  //   effectUpdated: ActiveEffectData,
  // ) {
  //   const result = await this.effectInterface.updateActiveEffectFromIdOnToken(
  //     effectId,
  //     tokenId,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // async updateActiveEffectFromNameOnToken(
  //   tokenId: string,
  //   effectName: string,
  //   origin,
  //   overlay,
  //   effectUpdated: ActiveEffectData,
  // ) {
  //   const result = await this.effectInterface.updateActiveEffectFromNameOnToken(
  //     effectName,
  //     tokenId,
  //     origin,
  //     overlay,
  //     effectUpdated,
  //   );
  //   return result;
  // },

  // =======================================================================================

  async calculateWeightOnActorFromIdArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateWeightOnActorFromIdArr | inAttributes must be of type array');
    }
    const [actorIdOrName] = inAttributes;
    return this.calculateWeightOnActorFromId(actorIdOrName);
  },

  calculateWeightOnActorFromId(actorIdOrName: string): EncumbranceData | undefined {
    const actor = game.actors?.contents.find((a) => {
      return isStringEquals(a.id, actorIdOrName) || isStringEquals(<string>a.name, actorIdOrName);
    });
    if (!actor) {
      warn(`No actor found for reference '${actorIdOrName}'`);
      return;
    }
    return this.calculateWeightOnActor(actor);
  },

  async calculateWeightOnTokenFromIdArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateWeightOnTokenFromIdArr | inAttributes must be of type array');
    }
    const [tokenIdOrName] = inAttributes;
    return this.calculateWeightOnTokenFromId(tokenIdOrName);
  },

  calculateWeightOnTokenFromId(tokenIdOrName: string): EncumbranceData | undefined {
    const token = canvas.tokens?.placeables.find((a) => {
      return isStringEquals(a.id, tokenIdOrName) || isStringEquals(a.name, tokenIdOrName);
    });
    if (!token) {
      warn(`No token found for reference '${tokenIdOrName}'`);
      return;
    }
    const actor = token.actor;
    if (!actor) {
      warn(`No actor found for reference '${tokenIdOrName}'`);
      return;
    }
    return this.calculateWeightOnActor(actor);
  },

  async calculateWeightOnActorArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateWeightOnActorArr | inAttributes must be of type array');
    }
    const [actor] = inAttributes;
    return this.calculateWeightOnActor(actor);
  },

  calculateWeightOnActor(actor: Actor): EncumbranceData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    const inventoryItems: Item[] = [];
    actor.data.items.contents.forEach((im: Item) => {
      if (im && physicalItems.includes(im.type)) {
        inventoryItems.push(im);
      }
    });
    const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actor, inventoryItems, false, invPlusActive);
    return encumbranceData;
  },

  // ====================================================

  async calculateBulkOnActorFromIdArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateBulkOnActorFromIdArr | inAttributes must be of type array');
    }
    const [actorIdOrName] = inAttributes;
    return this.calculateBulkOnActorFromId(actorIdOrName);
  },

  calculateBulkOnActorFromId(actorIdOrName: string): EncumbranceData | undefined {
    const actor = game.actors?.contents.find((a) => {
      return isStringEquals(a.id, actorIdOrName) || isStringEquals(<string>a.name, actorIdOrName);
    });
    if (!actor) {
      warn(`No actor found for reference '${actorIdOrName}'`);
      return;
    }
    return this.calculateBulkOnActor(actor);
  },

  async calculateBulkOnTokenFromIdArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateBulkOnTokenFromIdArr | inAttributes must be of type array');
    }
    const [tokenIdOrName] = inAttributes;
    return this.calculateBulkOnTokenFromId(tokenIdOrName);
  },

  calculateBulkOnTokenFromId(tokenIdOrName: string): EncumbranceData | undefined {
    const token = canvas.tokens?.placeables.find((a) => {
      return isStringEquals(a.id, tokenIdOrName) || isStringEquals(a.name, tokenIdOrName);
    });
    if (!token) {
      warn(`No token found for reference '${tokenIdOrName}'`);
      return;
    }
    const actor = token.actor;
    if (!actor) {
      warn(`No actor found for reference '${tokenIdOrName}'`);
      return;
    }
    return this.calculateBulkOnActor(actor);
  },

  async calculateBulkOnActorArr(...inAttributes: any[]): Promise<EncumbranceData | undefined> {
    if (!Array.isArray(inAttributes)) {
      throw error('calculateBulkOnActorArr | inAttributes must be of type array');
    }
    const [actor] = inAttributes;
    return this.calculateBulkOnActor(actor);
  },

  calculateBulkOnActor(actor: Actor): EncumbranceData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    const inventoryItems: Item[] = [];
    actor.data.items.contents.forEach((im: Item) => {
      if (im && physicalItems.includes(im.type)) {
        inventoryItems.push(im);
      }
    });
    const encumbranceData = VariantEncumbranceBulkImpl.calculateEncumbrance(
      actor,
      inventoryItems,
      false,
      invPlusActive,
    );
    return encumbranceData;
  },

  // ====================================================

  calculateWeightOnActorWithItems(actor: Actor, items: Item[]): EncumbranceData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actor, items, true, invPlusActive);
    return encumbranceData;
  },

  calculateBulkOnActorWithItems(actor: Actor, items: Item[]): EncumbranceBulkData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const encumbranceData = VariantEncumbranceBulkImpl.calculateEncumbrance(actor, items, true, invPlusActive);
    return encumbranceData;
  },

  convertLbToBulk(weight: number): number {
    return checkBulkCategory(weight).bulk;
  },

  calculateWeightOnActorWithItemsNoInventoryPlus(actor: Actor, items: Item[]): EncumbranceData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const encumbranceData = VariantEncumbranceImpl.calculateEncumbrance(actor, items, true, false);
    return encumbranceData;
  },

  calculateBulkOnActorWithItemsNoInventoryPlus(actor: Actor, items: Item[]): EncumbranceBulkData | undefined {
    if (!actor) {
      warn(`No actor is been passed`);
      return;
    }
    const encumbranceData = VariantEncumbranceBulkImpl.calculateEncumbrance(actor, items, true, false);
    return encumbranceData;
  },
};

export default API;
