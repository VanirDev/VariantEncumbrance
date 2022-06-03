import type { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs';
import type { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import CONSTANTS from '../constants';
import { error, i18n, info, log } from '../lib/lib';

/**
 * Handles all the logic related to the Active Effect itself
 * This is an extension of the core ActiveEffect document class which
 * overrides `update` and `delete` to make them work.
 * @href https://github.com/ElfFriend-DnD/foundryvtt-edit-owned-item-effects
 * THIS IS UNSTABLE, BRITTLE, AND NOT MADE FOR USE BEYOND THIS MODULE'S USE CASE
 */
export class EffectOwnedItem extends ActiveEffect {
  constructor(effect: ActiveEffectData, owner: Actor) {
    log(`Attempting instantiation of Owned Item Effect ${effect}`);

    // manually set the parent
    super(effect, { parent: owner });

    log(`Instantiated Owned Item Effect ${this}`);
  }

  /**
   * Fake Create this effect by instead updating the parent embedded Item document's array of effects.
   */
  async create(context: DocumentModificationOptions) {
    const dataToCreate = <ActiveEffectData>this.toJSON();

    log(`Attempting create on Owned Item Effect ${dataToCreate} ${context}`);

    try {
      await this._preCreate(dataToCreate, context, <User>game.user); // game.userId
    } catch (error) {
      error(error);
    }

    log(`Updating Parent ${dataToCreate.label}`);

    this.parent?.update(
      {
        effects: [dataToCreate],
      },
      context,
    );

    try {
      await this._onCreate(dataToCreate, { ...context, renderSheet: false }, <string>game.userId);
    } catch (e) {
      error(e);
    }
  }

  /**
   * Fake delete this effect by instead updating the parent embedded Item document's array of effects.
   */
  async delete(context: DocumentModificationOptions) {
    log(`Attempting delete on Owned Item Effect ${context}`);

    try {
      await this._preDelete(context, <User>game.user);
    } catch (error) {
      error(error);
    }

    const effectIdToDelete = <string>this.id;

    const newParentEffects = <ActiveEffect[]>this.parent?.effects.filter((effect) => effect.id !== effectIdToDelete);

    const newParentEffectsData = <ActiveEffectData[]>[];
    for (const ae of newParentEffects) {
      newParentEffectsData.push(ae.data);
    }

    log(`Updating Parent, delete effect with id ${effectIdToDelete}, new parent effects ${newParentEffectsData}`);

    this.parent?.update(
      {
        effects: newParentEffectsData,
      },
      { ...context, recursive: false },
    );

    try {
      await this._onDelete(context, <string>game.userId);
    } catch (e) {
      error(e);
    }
    return this;
  }

  /**
   * Fake Update this Effect Document by instead updating the parent embedded Item document's array of effects.
   */
  async update(data: ActiveEffectData, context: DocumentModificationOptions = {}) {
    log(`Attempting update on Owned Item Effect ${data} ${context}`);

    const embeddedItem = <Item>this.parent;
    //@ts-ignore
    if (!(embeddedItem instanceof Item) && embeddedItem.parent instanceof Actor) {
      log(`Attempted to update a non owned item effect with the owned Item effect update method ${data} ${context}`);
      return;
    }

    const newEffects = <ActiveEffectData[]>embeddedItem.effects.toObject();

    const originalEffectIndex = <number>newEffects.findIndex((effect) => effect._id === this.id);

    // means somehow we are editing an effect which does not exist on the item
    if (originalEffectIndex < 0) {
      return;
    }

    // merge updates directly into the array of objects
    //@ts-ignore
    foundry.utils.mergeObject(<ActiveEffectData>newEffects[originalEffectIndex], data, <any>context);

    const diff = foundry.utils.diffObject(this.data._source, foundry.utils.expandObject(data));

    try {
      await this._preUpdate(diff, context, <User>game.user);
    } catch (e) {
      error(e);
    }

    log(`Attempting update on Owned Item Effect ${newEffects}`);

    try {
      await embeddedItem.update({
        effects: newEffects,
      });
    } catch (e) {
      error(e);
    }

    try {
      await this._onUpdate(diff, context, <string>game.userId);
    } catch (e) {
      error(e);
    }

    this.data.update(diff);
    this.sheet?.render();

    if (this.data.transfer) {
      info(i18n(`${CONSTANTS.MODULE_NAME}.effect.not-reflected`), true);
    }

    if (!this.data.transfer && data.transfer) {
      info(i18n(`${CONSTANTS.MODULE_NAME}.effect.not-transferred`), true);
    }
    return this;
  }

  /**
   * Applies the effect to the grandparent actor.
   */
  async transferToActor() {
    const actor = <Actor>this.parent?.parent;

    if (!actor || !(actor instanceof Actor)) {
      log('Attempted to Transfer an effect on an unowned item.');
      return;
    }

    log(`Attempting to Transfer an effect with id ${this.uuid} to an Actor ${actor.name}`);

    return ActiveEffect.create(
      {
        ...this.toJSON(),
        origin: <string>this.parent?.uuid,
      },
      { parent: actor },
    );
  }

  /**
   * Gets default duration values from the provided item.
   * Assumes dnd5e data model, falls back to 1 round default.
   */
  static getDurationFromItem(item: Item, passive: boolean) {
    if (passive === true) {
      return undefined;
    }

    // Only for dnd5e for now
    //@ts-ignore
    const hasDuration = !!item?.data.data?.duration?.value;

    if (hasDuration) {
      const duration = <any>{};

      // Only for dnd5e for now
      //@ts-ignore
      const durationValue = item.data.data.duration;

      switch (durationValue.units) {
        case 'hour':
          duration.seconds = durationValue?.value * 60 * 60;
          break;
        case 'minute':
          duration.seconds = durationValue?.value * 60;
          break;
        case 'day':
          duration.seconds = durationValue?.value * 60 * 60 * 24;
          break;
        case 'month':
          duration.seconds = durationValue?.value * 60 * 60 * 24 * 28;
          break;
        case 'year':
          duration.seconds = durationValue?.value * 60 * 60 * 24 * 365;
          break;
        case 'turn':
          duration.turns = durationValue?.value;
          break;
        case 'round':
          duration.rounds = durationValue?.value;
          break;
        default:
          duration.rounds = 1;
          break;
      }

      return duration;
    }

    return {
      rounds: 1,
    };
  }

  // /**
  //  * Overridden handlers for the buttons on the item sheet effect list
  //  * Assumes core active effect list controls (what 5e uses)
  //  */
  // static onManageOwnedItemActiveEffect(event, owner) {
  //   event.preventDefault();

  //   const a = event.currentTarget;
  //   const li = a.closest("li");
  //   const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;

  //   const initialEffectFromItem = {
  //     label: owner.data.name,
  //     icon: owner.data.img,
  //     origin: owner.uuid,
  //     duration: this.getDurationFromItem(owner, li.dataset.effectType === "passive"),
  //     disabled: li.dataset.effectType === "inactive"
  //   }

  //   const effectData = effect?.toJSON() ?? initialEffectFromItem;

  //   const ownedItemEffect = new EffectOwnedItem(effectData, owner);

  //   switch (a.dataset.action) {
  //     case "create":
  //       return ownedItemEffect.create();

  //     case "transfer":
  //       return ownedItemEffect.transferToActor();

  //     case "delete":
  //       return ownedItemEffect.delete();

  //     case "edit":
  //       return ownedItemEffect.sheet?.render(true);
  //   }
  // }

  static createEffectOnOwnedItem(effectData: ActiveEffectData, item: Item) {
    const parent = <Actor>item.parent;

    if (!parent) {
      throw new Error('Parent must be provided on the creation context');
    }

    const ownedItemEffect = new this(effectData, parent);

    return ownedItemEffect.create({});

    // or
    //ActiveEffect.create(effectData, item);
  }
}
