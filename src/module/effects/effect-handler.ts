import { error, i18n, log } from '../lib/lib';
import FoundryHelpers from './foundry-helpers';
import { canvas, game } from '../settings';
import Effect from './effect';
import EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import {
  ActiveEffectData,
  ActorData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

export default class EffectHandler {
  _customEffects: Effect[];
  moduleName: string;
  _foundryHelpers: FoundryHelpers;

  constructor(moduleName: string) {
    if (!game[moduleName]) {
      game[moduleName] = {};
    }
    if (!game[moduleName]?.effects) {
      game[moduleName].effects = {};
    }
    if (!game[moduleName].effects.customEffects) {
      game[moduleName].effects.customEffects = [];
    }
    this._customEffects = <Effect[]>game[moduleName].effects.customEffects || [];
    this.moduleName = moduleName;
    this._foundryHelpers = new FoundryHelpers();
  }

  /**
   * Toggles an effect on or off by name on an actor by UUID
   *
   * @param {string} effectName - name of the effect to toggle
   * @param {object} params - the effect parameters
   * @param {string} params.overlay - name of the effect to toggle
   * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
   */
  async toggleEffect(effectName, { overlay, uuids }) {
    for (const uuid of uuids) {
      if (await this.hasEffectApplied(effectName, uuid)) {
        await this.removeEffect({ effectName, uuid });
      } else {
        const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
        const origin = `Actor.${actor.id}`;
        await this.addEffect({ effectName, effectData: null, uuid, origin, overlay });
      }
    }
  }

  /**
   * Toggles an effect on or off by name on an actor by UUID
   *
   * @param {string} effectName - name of the effect to toggle
   * @param {object} params - the effect parameters
   * @param {string} params.overlay - name of the effect to toggle
   * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
   */
  async toggleEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('toggleEffectArr | inAttributes must be of type array');
    }
    const [effectName, params] = inAttributes;
    return this.toggleEffect(effectName, params);
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectApplied(effectName, uuid) {
    const actor = await this._foundryHelpers.getActorByUuid(uuid);
    const isApplied = actor?.data?.effects?.some(
      // (activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
      (activeEffect) => <string>activeEffect?.data?.label == effectName && !activeEffect?.data?.disabled,
    );
    return isApplied;
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectAppliedArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    return this.hasEffectApplied(effectName, uuid);
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {object} params - the effect parameters
   * @param {string} params.effectName - the name of the effect to remove
   * @param {string} params.uuid - the uuid of the actor to remove the effect from
   */
  async removeEffect({ effectName, uuid }) {
    const actor = await this._foundryHelpers.getActorByUuid(uuid);
    const effectToRemove = actor.data.effects.find(
      //(activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && activeEffect?.data?.label == effectName,
      (activeEffect) => activeEffect?.data?.label == effectName,
    );

    if (!effectToRemove) return;

    await actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemove.id]);
    log(`Removed effect ${effectName} from ${actor.name} - ${actor.id}`);
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectArr | inAttributes must be of type array');
    }
    const [params] = inAttributes;
    return this.removeEffect(params);
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {object} params - the effect parameters
   * @param {string} params.effectName - the name of the effect to add
   * @param {object} params.effectData - the effect data to add if effectName is not provided
   * @param {string} params.uuid - the uuid of the actor to add the effect to
   * @param {string} params.origin - the origin of the effect
   * @param {boolean} params.overlay - if the effect is an overlay or not
   */
  async addEffect({ effectName, effectData, uuid, origin, overlay }) {
    const actor = await this._foundryHelpers.getActorByUuid(uuid);
    let effect = <Effect>this._findEffectByName(effectName, actor);

    if (!effect && effectData) {
      effect = new Effect(effectData);
    }

    if (!origin) {
      origin = `Actor.${actor.id}`;
    }
    effect.origin = origin;
    effect.overlay = overlay;

    // let effect = game.dfreds.effectInterface.findEffectByName(effectName);

    // if (!effect && effectData) {
    //   effect = new Effect(effectData);
    // }

    // const actor = await this._foundryHelpers.getActorByUuid(uuid);

    // if (effect.name.startsWith('Exhaustion')) {
    //   await this._removeAllExhaustionEffects(uuid);
    // }

    // if (effect.isDynamic) {
    //   await this._dynamicEffectsAdder.addDynamicEffects(effect, actor);
    // }

    this._handleIntegrations(effect);

    const activeEffectData = effect.convertToActiveEffectData({
      origin,
      overlay,
    });
    await actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);

    log(`Added effect ${effect.name} to ${actor.name} - ${actor.id}`);
  }

  // async _removeAllExhaustionEffects(uuid) {
  //   await this.removeEffect({ effectName: 'Exhaustion 1', uuid });
  //   await this.removeEffect({ effectName: 'Exhaustion 2', uuid });
  //   await this.removeEffect({ effectName: 'Exhaustion 3', uuid });
  //   await this.removeEffect({ effectName: 'Exhaustion 4', uuid });
  //   await this.removeEffect({ effectName: 'Exhaustion 5', uuid });
  // }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {object} params - the effect parameters
   * @param {string} params.effectName - the name of the effect to add
   * @param {string} params.uuid - the uuid of the actor to add the effect to
   * @param {string} params.origin - the origin of the effect
   * @param {boolean} params.overlay - if the effect is an overlay or not
   */
  async addEffectArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectArr | inAttributes must be of type array');
    }
    const [params] = inAttributes;
    return this.addEffect(params);
  }

  _handleIntegrations(effect) {
    if (effect.atlChanges.length > 0) {
      this._addAtlChangesToEffect(effect);
    }

    if (effect.tokenMagicChanges.length > 0) {
      this._addTokenMagicChangesToEffect(effect);
    }
  }

  _addAtlChangesToEffect(effect: Effect) {
    effect.changes.push(...effect.atlChanges);
  }

  _addTokenMagicChangesToEffect(effect: Effect) {
    effect.changes.push(...effect.tokenMagicChanges);
  }

  // ============================================================
  // Additional feature for retrocompatibility
  // ============================================================

  /**
   * Searches through the list of available effects and returns one matching the
   * effect name. Prioritizes finding custom effects first.
   *
   * @param {string} effectName - the effect name to search for
   * @returns {Effect} the found effect
   */
  _findEffectByName(effectName: string, actor: Actor) {
    if (!effectName) {
      return null;
    }
    // const effect = this._customEffectsHandler
    //   .getCustomEffects()
    //   .find((effect) => effect.name == effectName);

    // if (effect) return effect;

    // return game.dfreds.effects.all.find((effect) => effect.name == effectName);
    let effect = <Effect>this._customEffects.find((effect: Effect) => effect.name == effectName);
    if (!effect) {
      const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
      // regex expression to match all non-alphanumeric characters in string
      const regex = /[^A-Za-z0-9]/g;
      for (const effectEntity of actorEffects) {
        const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
        if (!effectNameToSet) {
          continue;
        }
        // use replace() method to match and remove all the non-alphanumeric characters
        const effectNameToCheckOnActor = effectNameToSet.replace(regex, '');
        if (effectNameToCheckOnActor.toLowerCase().startsWith(effectName.toLowerCase())) {
          effect = this.convertToEffectClass(effectEntity);
        }
      }
    }
    return effect;
  }

  convertToEffectClass(effect: ActiveEffect): Effect {
    const atlChanges = effect.data.changes.filter((changes) => changes.key.startsWith('ATL'));
    const tokenMagicChanges = effect.data.changes.filter((changes) => changes.key === 'macro.tokenMagic');
    const changes = effect.data.changes.filter(
      (change) => !change.key.startsWith('ATL') && change.key !== 'macro.tokenMagic',
    );

    return new Effect({
      customId: <string>effect.id,
      name: effect.data.label,
      description: <string>effect.data.flags.customEffectDescription,
      icon: <string>effect.data.icon,
      tint: <string>effect.data.tint,
      seconds: effect.data.duration.seconds,
      rounds: effect.data.duration.rounds,
      turns: effect.data.duration.turns,
      flags: effect.data.flags,
      changes,
      atlChanges,
      tokenMagicChanges,
    });
  }

  /**
   * Searches through the list of available effects and returns one matching the
   * effect name. Prioritizes finding custom effects first.
   *
   * @param {string} effectName - the effect name to search for
   * @returns {Effect} the found effect
   */
  async findEffectByNameOnActor(effectName: string, uuid: string): Promise<ActiveEffect | null> {
    if (effectName) {
      effectName = i18n(effectName);
    }
    const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
    // return await (<ActiveEffect>(
    //   actor?.data?.effects?.find((activeEffect) => <string>activeEffect?.data?.label == effectName)
    // ));
    let effect: ActiveEffect | null = null;
    if (!effectName) {
      return effect;
    }
    const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>actor?.data.effects;
    // regex expression to match all non-alphanumeric characters in string
    const regex = /[^A-Za-z0-9]/g;
    for (const effectEntity of actorEffects) {
      const effectNameToSet = effectEntity.name ? effectEntity.name : effectEntity.data.label;
      if (!effectNameToSet) {
        continue;
      }
      // use replace() method to match and remove all the non-alphanumeric characters
      const effectNameToCheckOnActor = effectNameToSet.replace(regex, '');
      if (effectNameToCheckOnActor.toLowerCase().startsWith(effectName.toLowerCase())) {
        // effect = this.convertToEffectClass(effectEntity);
        effect = effectEntity;
        break;
      }
    }
    return effect;
  }

  /**
   * Searches through the list of available effects and returns one matching the
   * effect name. Prioritizes finding custom effects first.
   *
   * @param {string} effectName - the effect name to search for
   * @returns {Effect} the found effect
   */
  async findEffectByNameOnActorArr(...inAttributes: any[]): Promise<ActiveEffect | null> {
    if (!Array.isArray(inAttributes)) {
      throw error('findEffectByNameOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    return this.findEffectByNameOnActor(effectName, uuid);
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectAppliedOnActor(effectName, uuid): Promise<boolean> {
    if (effectName) {
      effectName = i18n(effectName);
    }
    const actor = await this._foundryHelpers.getActorByUuid(uuid);
    const isApplied = actor?.data?.effects?.some(
      // (activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
      (activeEffect) => <string>activeEffect?.data?.label == effectName,
    );
    return isApplied;
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectAppliedOnActorArr(...inAttributes: any[]): Promise<boolean> {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    return this.hasEffectAppliedOnActor(effectName, uuid);
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectId - the id of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectAppliedFromIdOnActor(effectId, uuid): Promise<boolean> {
    const actor = await this._foundryHelpers.getActorByUuid(uuid);
    const isApplied = actor?.data?.effects?.some(
      // (activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?._id == effectId,
      (activeEffect) => <string>activeEffect?.id == effectId,
    );
    return isApplied;
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectId - the id of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  async hasEffectAppliedFromIdOnActorArr(...inAttributes: any[]): Promise<boolean> {
    if (!Array.isArray(inAttributes)) {
      throw error('hasEffectAppliedFromIdOnActorArr | inAttributes must be of type array');
    }
    const [effectId, uuid] = inAttributes;
    return this.hasEffectAppliedFromIdOnActor(effectId, uuid);
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectOnActor(effectName, uuid) {
    if (effectName) {
      effectName = i18n(effectName);
    }
    const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
    const effectToRemove = <ActiveEffect>actor.data.effects.find(
      // (activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect?.data?.label == effectName,
      (activeEffect) => <string>activeEffect?.data?.label == effectName,
    );

    if (!effectToRemove) return;

    // actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemove.id]);
    // Why i need this ??? for avoid the double AE
    await effectToRemove.update({ disabled: true });
    await effectToRemove.delete();
    log(`Removed effect ${effectName} from ${actor.name} - ${actor.id}`);
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid] = inAttributes;
    return this.removeEffectOnActor(effectName, uuid);
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectId - the id of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectFromIdOnActor(effectId, uuid) {
    if (effectId) {
      const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
      //actor.deleteEmbeddedDocuments('ActiveEffect', [<string>effectToRemoveId]);
      // Why i need this ??? for avoid the double AE
      const effectToRemove = <ActiveEffect>actor.data.effects.find(
        //(activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect.id == effectId,
        (activeEffect) => <string>activeEffect.id == effectId,
      );
      await effectToRemove.update({ disabled: true });
      await effectToRemove.delete();
      log(`Removed effect ${effectToRemove?.data?.label} from ${actor.name} - ${actor.id}`);
    }
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectId - the id of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectFromIdOnActorArr(...inAttributes: any[]) {
    if (!Array.isArray(inAttributes)) {
      throw error('removeEffectFromIdOnActor | inAttributes must be of type array');
    }
    const [effectId, uuid] = inAttributes;
    return this.removeEffectFromIdOnActor(effectId, uuid);
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {object} params - the effect parameters
   * @param {string} params.effectName - the name of the effect to add
   * @param {string} params.uuid - the uuid of the actor to add the effect to
   * @param {string} params.origin - the origin of the effect
   * @param {boolean} params.overlay - if the effect is an overlay or not
   */
  async addEffectOnActor(effectName, uuid, origin, overlay, effect: Effect | null) {
    if (effectName) {
      effectName = i18n(effectName);
    }
    if (effect) {
      const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
      if (!origin) {
        origin = `Actor.${actor.id}`;
      }
      const activeEffectData = effect.convertToActiveEffectData({
        origin,
        overlay,
      });
      actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);
      log(`Added effect ${effect.name ? effect.name : effectName} to ${actor.name} - ${actor.id}`);
    }
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {string} effectName - the name of the effect to add
   * @param {string} uuid - the uuid of the actor to add the effect to
   */
  async addEffectOnActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectName, uuid, origin, overlay, effect] = inAttributes;
    return this.addEffectOnActor(effectName, uuid, origin, overlay, effect);
  }

  /**
   * @href https://github.com/ElfFriend-DnD/foundryvtt-temp-effects-as-statuses/blob/main/scripts/temp-effects-as-statuses.js
   */
  async toggleEffectFromIdOnActor(
    effectId: string,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    const actor = <Actor>game.actors?.get(uuid);
    const effect = <ActiveEffect>actor.effects.find((entity: ActiveEffect) => {
      return <string>entity.id == effectId;
    });
    // nuke it if it has a statusId
    // brittle assumption
    // provides an option to always do this
    if (effect.getFlag('core', 'statusId') || alwaysDelete) {
      const deleted = await effect.delete();
      return !!deleted;
    }
    let updated;
    if (forceEnabled) {
      updated = await effect.update({
        disabled: false,
      });
    } else if (forceDisabled) {
      updated = await effect.update({
        disabled: true,
      });
    } else {
      // otherwise toggle its disabled status
      updated = await effect.update({
        disabled: !effect.data.disabled,
      });
    }

    return !!updated;
  }

  async toggleEffectFromIdOnActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addEffectOnActorArr | inAttributes must be of type array');
    }
    const [effectId, uuid, alwaysDelete, forceEnabled, forceDisabled] = inAttributes;
    return this.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled);
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {string} uuid - the uuid of the actor to add the effect to
   * @param {string} activeEffectData - the name of the effect to add
   */
  async addActiveEffectOnActor(uuid, activeEffectData: ActiveEffectData) {
    if (activeEffectData) {
      const actor = <Actor>await this._foundryHelpers.getActorByUuid(uuid);
      activeEffectData.origin = `Actor.${actor.id}`;
      //@ts-ignore
      actor.createEmbeddedDocuments('ActiveEffect', [activeEffectData]);
      log(`Added effect ${activeEffectData.label} to ${actor.name} - ${actor.id}`);
    }
  }

  async addActiveEffectOnActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error('addActiveEffectOnActorArr | inAttributes must be of type array');
    }
    const [uuid, activeEffectData] = inAttributes;
    return this.addActiveEffectOnActor(uuid, activeEffectData);
  }
}
