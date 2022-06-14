import FoundryHelpers from './foundry-helpers';
import { registerSocket } from '../socket';
import Effect from './effect';
import EffectHandler from './effect-handler';
import { isGMConnectedAndSocketLibEnable } from '../lib/lib';
import type {
  ActiveEffectData,
  ActorData,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import type EmbeddedCollection from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs';
import type { EffectActions } from './effect-models';

/**
 * Interface for working with effects and executing them as a GM via sockets
 */
export default class EffectInterface {
  //   _actorUpdater: ActorUpdater;
  _effectHandler: EffectHandler;
  _foundryHelpers: FoundryHelpers;

  _socket: any;
  moduleName: string;

  constructor(moduleName) {
    this.moduleName = moduleName;
    // this._actorUpdater = new ActorUpdater();
    this._effectHandler = new EffectHandler(moduleName);
    this._foundryHelpers = new FoundryHelpers();
    // this._socket = socket;
  }

  /**
   * Initializes the socket and registers the socket functions
   */
  initialize() {
    // this._socket = socketlib.registerModule(Constants.MODULE_ID);
    // this._registerFunctions();
    this._socket = registerSocket();
  }

  // _registerFunctions() {
  //   this._socket.register(
  //     'toggleEffect',
  //     this._effectHandler.toggleEffect.bind(this._effectHandler)
  //   );
  //   this._socket.register(
  //     'addEffect',
  //     this._effectHandler.addEffect.bind(this._effectHandler)
  //   );
  //   this._socket.register(
  //     'removeEffect',
  //     this._effectHandler.removeEffect.bind(this._effectHandler)
  //   );
  //   this._socket.register(
  //     'addActorDataChanges',
  //     this._actorUpdater.addActorDataChanges.bind(this._actorUpdater)
  //   );
  //   this._socket.register(
  //     'removeActorDataChanges',
  //     this._actorUpdater.removeActorDataChanges.bind(this._actorUpdater)
  //   );
  // }

  // /**
  //  * Searches through the list of available effects and returns one matching the
  //  * effect name. Prioritizes finding custom effects first.
  //  *
  //  * @param {string} effectName - the effect name to search for
  //  * @returns {Effect} the found effect
  //  */
  // async findEffectByName(effectName: string) {
  //   const effect = this.findEffectByName(effectName);

  //   if (!effect) {
  //     ui.notifications?.error(`Effect ${effectName} was not found`);
  //     return;
  //   }
  //   return effect;
  // }

  // /**
  //  * Searches through the list of available custom effects and returns one matching the
  //  * effect name.
  //  *
  //  * @param {string} effectName - the effect name to search for
  //  * @returns {Effect} the found effect
  //  */
  //   findCustomEffectByName(effectName) {
  //     const effect = this._customEffectsHandler
  //       .getCustomEffects()
  //       .find((effect) => effect.name == effectName);

  //     return effect;
  //   }

  /**
   * Toggles the effect on the provided actor UUIDS as the GM via sockets
   *
   * @param {string} effectName - name of the effect to toggle
   * @param {object} params - the effect parameters
   * @param {string} params.overlay - name of the effect to toggle
   * @param {string[]} params.uuids - UUIDS of the actors to toggle the effect on
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async toggleEffect(effectName, { overlay = false, uuids = <string[]>[] } = {}) {
    if (uuids.length == 0) {
      uuids = this._foundryHelpers.getActorUuidsFromCanvas();
    }

    if (uuids.length == 0) {
      ui.notifications?.error(`Please select or target a token to toggle ${effectName}`);
      return;
    }

    // const effect = this.findEffectByName(effectName);

    // if (!effect) {
    //   ui.notifications?.error(`Effect ${effectName} was not found`);
    //   return;
    // }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this.getNestedEffectSelection(effect);
    //   if (!effect) return; // dialog closed without selecting one
    // }

    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('toggleEffect', effectName, {
        overlay,
        uuids,
      });
    } else {
      return this._effectHandler.toggleEffect(effectName, { overlay, uuids });
    }
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   * @deprecated remove from dfreds
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is
   * applied to
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  hasEffectApplied(effectName: string, uuid: string): boolean {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('hasEffectApplied', effectName, uuid);
    } else {
      return this._effectHandler.hasEffectApplied(effectName, uuid);
    }
  }

  /**
   * Removes the effect from the provided actor UUID as the GM via sockets
   *
   * @param {object} params - the effect params
   * @param {string} params.effectName - the name of the effect to remove
   * @param {string} params.uuid - the UUID of the actor to remove the effect from
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async removeEffect({ effectName, uuid }) {
    // const effect = this.findEffectByName(effectName);

    // if (!effect) {
    //   ui.notifications?.error(`Effect ${effectName} could not be found`);
    //   return;
    // }

    const actor = this._foundryHelpers.getActorByUuid(uuid);

    if (!actor) {
      ui.notifications?.error(`Actor ${uuid} could not be found`);
      return;
    }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this.getNestedEffectSelection(effect);
    // }

    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffect', {
        effectName,
        uuid,
      });
    } else {
      return this._effectHandler.removeEffect({ effectName, uuid });
    }
  }

  /**
   * Adds the effect to the provided actor UUID as the GM via sockets
   *
   * @param {object} params - the params for adding an effect
   * @param {string} params.effectName - the name of the effect to add
   * @param {string} params.effectData - the active effect data to add // mod 4535992
   * @param {string} params.uuid - the UUID of the actor to add the effect to
   * @param {string} params.origin - the origin of the effect
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async addEffect({ effectName, effectData, uuid, origin, overlay, metadata = undefined }, withSocket = true) {
    // const effect = this.findEffectByName(effectName);

    // if (!effect) {
    //   ui.notifications?.error(`Effect ${effectName} could not be found`);
    //   return;
    // }

    const actor = this._foundryHelpers.getActorByUuid(uuid);

    if (!actor) {
      ui.notifications?.error(`Actor ${uuid} could not be found`);
      return;
    }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this.getNestedEffectSelection(effect);
    // }

    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addEffect', {
        effectName,
        effectData,
        uuid,
        origin,
        overlay,
        metadata,
      });
    } else {
      return this._effectHandler.addEffect({
        effectName,
        effectData,
        uuid,
        origin,
        overlay,
        metadata,
      });
    }
  }

  /**
   * Adds the defined effect to the provided actor UUID as the GM via sockets
   *
   * @param {object} params - the params for adding an effect
   * @param {object} params.effectData - the object containing all of the relevant effect data
   * @param {string} params.uuid - the UUID of the actor to add the effect to
   * @param {string} params.origin - the origin of the effect
   * @param {boolean} params.overlay - if the effect is an overlay or not
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async addEffectWith({ effectData, uuid, origin, overlay }, withSocket = true) {
    const effect = new Effect(effectData);

    const actor = this._foundryHelpers.getActorByUuid(uuid);

    if (!actor) {
      ui.notifications?.error(`Actor ${uuid} could not be found`);
      return;
    }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this._getNestedEffectSelection(effect);
    // }

    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addEffect', {
        effectName: null, // mod 4535992
        effectData,
        uuid,
        origin,
        overlay,
      });
    } else {
      return this._effectHandler.addEffect({
        effectName: undefined,
        effectData,
        uuid,
        origin,
        overlay,
      });
    }
  }

  // /**
  //  * Creates new custom effects with the provided active effect data.
  //  *
  //  * @param {object} params - the params for adding an effect
  //  * @param {object[]} params.activeEffects - array of active effects to add
  //  * @returns {Promise} a promise that resolves when the active effects have finished being added
  //  */
  // createNewCustomEffectsWith({ activeEffects }) {
  //   return this._customEffectsHandler.createNewCustomEffectsWith({
  //     activeEffects,
  //   });
  // }

  // /**
  //  * Adds data changes to the provided actor UUID as the GM via sockets
  //  *
  //  * @param {string} effectName - the name of the effect that is adding actor data changes
  //  * @param {string} uuid - the UUID of the actor to add the data changes to
  //  * @returns {Promise} a promise that resolves when the GM socket function completes
  //  */
  // addActorDataChanges(effectName, uuid) {
  //   return this._socket.executeAsGM('addActorDataChanges', effectName, uuid);
  // }

  // /**
  //  * Removes data changes from the provided actor UUID as the GM via sockets
  //  *
  //  * @param {string} effectName - the name of the effect that is removing actor data changes
  //  * @param {string} uuid - the UUID of the actor to remove the data changes from
  //  * @returns {Promise} a promise that resolves when the GM socket function completes
  //  */
  // removeActorDataChanges(effectName, uuid) {
  //   return this._socket.executeAsGM('removeActorDataChanges', effectName, uuid);
  // }

  // async _getNestedEffectSelection(effect) {
  //   const content = await renderTemplate(
  //     'modules/dfreds-convenient-effects/templates/nested-effects-dialog.html',
  //     { parentEffect: effect }
  //   );
  //   const choice = await Dialog.prompt(
  //     {
  //       title: effect.name,
  //       content: content,
  //       label: 'Select Effect',
  //       callback: (html) => {
  //         const htmlChoice = html.find('select[name="effect-choice"]').val();
  //         return htmlChoice;
  //       },
  //       rejectClose: false,
  //     },
  //     { width: 300 }
  //   );

  //   return effect.nestedEffects.find(
  //     (nestedEffect) => nestedEffect.name == choice
  //   );
  // }

  // /**
  //  * Adds the given effect name to the status effects. Note that Foundry
  //  * needs to be refreshed to reflect the changes on the token HUD.
  //  *
  //  * @param {string} effectName - the effect name to add as a status effect
  //  */
  // async addStatusEffect(effectName) {
  //   await this._settings.addStatusEffect(effectName);
  // }

  // /**
  //  * Removes the given effect name from the status effects. Note that Foundry
  //  * needs to be refreshed to reflect the changes on the token HUD.
  //  *
  //  * @param {string} effectName - the effect name to remove as a status effect
  //  */
  //  async removeStatusEffect(effectName) {
  //   await this._settings.removeStatusEffect(effectName);
  // }

  // ============================================================
  // Additional feature for retrocompatibility
  // ============================================================

  // ====================================================================
  // ACTOR MANAGEMENT
  // ====================================================================

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is applied to
   * @param {string} includeDisabled - if true include the applied disabled effect
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  hasEffectAppliedOnActor(effectName: string, uuid: string, includeDisabled: boolean): boolean {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('hasEffectAppliedOnActor', effectName, uuid, includeDisabled);
    } else {
      return this._effectHandler.hasEffectAppliedOnActor(effectName, uuid, includeDisabled);
    }
  }

  /**
   * Checks to see if any of the current active effects applied to the actor
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectId - the id of the effect to check
   * @param {string} uuid - the uuid of the actor to see if the effect is applied to
   * @param {string} includeDisabled - if true include the applied disabled effect
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  hasEffectAppliedFromIdOnActor(effectId: string, uuid: string, includeDisabled: boolean): boolean {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('hasEffectAppliedFromIdOnActor', effectId, uuid, includeDisabled);
    } else {
      return this._effectHandler.hasEffectAppliedFromIdOnActor(effectId, uuid, includeDisabled);
    }
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectOnActor(effectName: string, uuid: string) {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffectOnActor', effectName, uuid);
    } else {
      return this._effectHandler.removeEffectOnActor(effectName, uuid);
    }
  }

  /**
   * Removes the effect with the provided name from an actor matching the
   * provided UUID
   *
   * @param {string} effectId - the id of the effect to remove
   * @param {string} uuid - the uuid of the actor to remove the effect from
   */
  async removeEffectFromIdOnActor(effectId: string, uuid: string) {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffectFromIdOnActor', effectId, uuid);
    } else {
      return this._effectHandler.removeEffectFromIdOnActor(effectId, uuid);
    }
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {string} effectName - the name of the effect to add
   * @param {string} uuid - the uuid of the actor to add the effect to
   */
  async addEffectOnActor(effectName: string, uuid: string, effect: Effect, withSocket = true): Promise<void> {
    if (!uuid) {
      ui.notifications?.error(`Actor ${uuid} could not be found`);
      return;
    }

    if (!effect) {
      ui.notifications?.error(`Effect ${effectName} could not be found`);
      return;
    }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this.getNestedEffectSelection(effect);
    // }
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addEffectOnActor', effect.name, uuid, undefined, false, effect);
    } else {
      return this._effectHandler.addEffectOnActor(effect.name, uuid, undefined, false, effect);
    }
  }

  async toggleEffectFromIdOnActor(
    effectId: string,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    if (effectId.length == 0) {
      ui.notifications?.error(`Please select or target a active effect to toggle ${effectId}`);
      return;
    }

    const actor = <Actor>game.actors?.get(uuid);
    const effect = <ActiveEffect>actor.effects.find((entity: ActiveEffect) => {
      return <string>entity.id == effectId;
    });

    if (!effect) {
      ui.notifications?.error(`Effect ${effectId} was not found`);
      return;
    }

    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'toggleEffectFromIdOnActor',
        effectId,
        uuid,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
      );
    } else {
      return this._effectHandler.toggleEffectFromIdOnActor(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled);
    }
  }

  /**
   * Adds the effect with the provided name to an actor matching the provided
   * UUID
   *
   * @param {string} uuid - the uuid of the actor to add the effect to
   * @param {string} activeEffectData - the name of the effect to add
   */
  async addActiveEffectOnActor(uuid, activeEffectData: ActiveEffectData, withSocket = true) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addActiveEffectOnActor', uuid, activeEffectData);
    } else {
      return this._effectHandler.addActiveEffectOnActor(uuid, activeEffectData);
    }
  }

  /**
   * Toggles the effect on the provided actor UUIDS as the GM via sockets
   *
   * @param {string} effectName - name of the effect to toggle
   * @param {string} uuid - UUID of the actor to toggle the effect on
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async findEffectByNameOnActor(effectName: string, uuid): Promise<ActiveEffect | null> {
    // if (uuids.length == 0) {
    //   uuids = this._foundryHelpers.getActorUuidsFromCanvas();
    // }

    // if (uuids.length == 0) {
    //   ui.notifications?.error(`Please select or target a token to toggle ${effectName}`);
    //   return null;
    // }

    // const effect = this.findEffectByName(effectName);

    // if (!effect) {
    //   ui.notifications?.error(`Effect ${effectName} was not found`);
    //   return null;
    // }
    // return effect;
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('findEffectByNameOnActor', effectName, uuid);
    } else {
      return this._effectHandler.findEffectByNameOnActor(effectName, uuid);
    }
  }

  // ====================================================================
  // TOKEN MANAGEMENT
  // ====================================================================

  /**
   * Checks to see if any of the current active effects applied to the token
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectName - the name of the effect to check
   * @param {string} uuid - the uuid of the token to see if the effect is applied to
   * @param {string} includeDisabled - if true include the applied disabled effect
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  hasEffectAppliedOnToken(effectName: string, uuid: string, includeDisabled: boolean): boolean {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('hasEffectAppliedOnToken', effectName, uuid, includeDisabled);
    } else {
      return this._effectHandler.hasEffectAppliedOnToken(effectName, uuid, includeDisabled);
    }
  }

  /**
   * Checks to see if any of the current active effects applied to the token
   * with the given UUID match the effect name and are a convenient effect
   *
   * @param {string} effectId - the id of the effect to check
   * @param {string} uuid - the uuid of the token to see if the effect is applied to
   * @param {string} includeDisabled - if true include the applied disabled effect
   * @returns {boolean} true if the effect is applied, false otherwise
   */
  hasEffectAppliedFromIdOnToken(effectId: string, uuid: string, includeDisabled: boolean): boolean {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('hasEffectAppliedFromIdOnToken', effectId, uuid, includeDisabled);
    } else {
      return this._effectHandler.hasEffectAppliedFromIdOnToken(effectId, uuid, includeDisabled);
    }
  }

  /**
   * Removes the effect with the provided name from an token matching the
   * provided UUID
   *
   * @param {string} effectName - the name of the effect to remove
   * @param {string} uuid - the uuid of the token to remove the effect from
   */
  async removeEffectOnToken(effectName: string, uuid: string) {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffectOnToken', effectName, uuid);
    } else {
      return this._effectHandler.removeEffectOnToken(effectName, uuid);
    }
  }

  /**
   * Removes the effect with the provided name from an token matching the
   * provided UUID
   *
   * @param {string} effectId - the id of the effect to remove
   * @param {string} uuid - the uuid of the token to remove the effect from
   */
  async removeEffectFromIdOnToken(effectId: string, uuid: string) {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffectFromIdOnToken', effectId, uuid);
    } else {
      return this._effectHandler.removeEffectFromIdOnToken(effectId, uuid);
    }
  }

  /**
   * Removes the effect with the provided name from an token matching the
   * provided UUID
   *
   * @param {string} effectIds - the id of the effect to remove
   * @param {string} uuid - the uuid of the token to remove the effect from
   */
  async removeEffectFromIdOnTokenMultiple(effectIds: string[], uuid: string) {
    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('removeEffectFromIdOnTokenMultiple', effectIds, uuid);
    } else {
      return this._effectHandler.removeEffectFromIdOnTokenMultiple(effectIds, uuid);
    }
  }

  /**
   * Adds the effect with the provided name to an token matching the provided
   * UUID
   *
   * @param {string} effectName - the name of the effect to add
   * @param {string} uuid - the uuid of the token to add the effect to
   */
  async addEffectOnToken(effectName: string, uuid: string, effect: Effect, withSocket = true): Promise<void> {
    if (!uuid) {
      ui.notifications?.error(`Token ${uuid} could not be found`);
      return;
    }

    if (!effect) {
      ui.notifications?.error(`Effect ${effectName} could not be found`);
      return;
    }

    // if (effect.nestedEffects.length > 0) {
    //   effect = await this.getNestedEffectSelection(effect);
    // }
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addEffectOnToken', effect.name, uuid, undefined, false, effect);
    } else {
      return this._effectHandler.addEffectOnToken(effect.name, uuid, undefined, false, effect);
    }
  }

  async toggleEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    alwaysDelete: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
  ) {
    if (effectId.length == 0) {
      ui.notifications?.error(`Please select or target a active effect to toggle ${effectId}`);
      return;
    }

    const token = <Token>this._foundryHelpers.getTokenByUuid(uuid);
    // const tokenEffects = <PropertiesToSource<ActiveEffectDataProperties>[]>token?.data.actorData.effects ?? [];
    // const effects = <PropertiesToSource<ActiveEffectDataProperties>[]>tokenEffects.map(
    //   //(activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect.id == effectId,
    //   (activeEffect) => {
    //     if (<string>activeEffect?._id == effectId) {
    //       return activeEffect;
    //     }
    //   },
    // );
    // if (!effects) return;
    // const effect = <ActiveEffect>await fromUuid(<string>effects[0]._id);
    const actorEffects = <EmbeddedCollection<typeof ActiveEffect, ActorData>>token.actor?.data.effects;
    const effect = <ActiveEffect>actorEffects.find(
      //(activeEffect) => <boolean>activeEffect?.data?.flags?.isConvenient && <string>activeEffect.id == effectId,
      (activeEffect) => <string>activeEffect?.data?._id == effectId,
    );

    if (!effect) return;

    if (!effect) {
      ui.notifications?.error(`Effect ${effectId} was not found`);
      return;
    }

    if (isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'toggleEffectFromIdOnToken',
        effectId,
        uuid,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
      );
    } else {
      return this._effectHandler.toggleEffectFromIdOnToken(effectId, uuid, alwaysDelete, forceEnabled, forceDisabled);
    }
  }

  /**
   * Adds the effect with the provided name to an token matching the provided
   * UUID
   *
   * @param {string} uuid - the uuid of the token to add the effect to
   * @param {string} activeEffectData - the name of the effect to add
   */
  async addActiveEffectOnToken(uuid, activeEffectData: ActiveEffectData, withSocket = true) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('addActiveEffectOnToken', uuid, activeEffectData);
    } else {
      return this._effectHandler.addActiveEffectOnToken(uuid, activeEffectData);
    }
  }

  /**
   * Toggles the effect on the provided token UUIDS as the GM via sockets
   *
   * @param {string} effectName - name of the effect to toggle
   * @param {string} uuid - UUID of the token to toggle the effect on
   * @returns {Promise} a promise that resolves when the GM socket function completes
   */
  async findEffectByNameOnToken(effectName: string, uuid, withSocket = true): Promise<ActiveEffect | null> {
    // if (uuids.length == 0) {
    //   uuids = this._foundryHelpers.getTokenUuidsFromCanvas();
    // }

    // if (uuids.length == 0) {
    //   ui.notifications?.error(`Please select or target a token to toggle ${effectName}`);
    //   return null;
    // }

    // const effect = this.findEffectByName(effectName);

    // if (!effect) {
    //   ui.notifications?.error(`Effect ${effectName} was not found`);
    //   return null;
    // }
    // return effect;
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('findEffectByNameOnToken', effectName, uuid);
    } else {
      return this._effectHandler.findEffectByNameOnToken(effectName, uuid);
    }
  }

  async updateEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    origin,
    overlay,
    effectUpdated: Effect,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('updateEffectFromIdOnToken', effectId, uuid, origin, overlay, effectUpdated);
    } else {
      return this._effectHandler.updateEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
    }
  }

  async updateEffectFromNameOnToken(
    effectName: string,
    uuid: string,
    origin,
    overlay,
    effectUpdated: Effect,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM('updateEffectFromNameOnToken', effectName, uuid, origin, overlay, effectUpdated);
    } else {
      return this._effectHandler.updateEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
    }
  }

  async updateActiveEffectFromIdOnToken(
    effectId: string,
    uuid: string,
    origin,
    overlay,
    effectUpdated: ActiveEffectData,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'updateActiveEffectFromIdOnToken',
        effectId,
        uuid,
        origin,
        overlay,
        effectUpdated,
      );
    } else {
      return this._effectHandler.updateActiveEffectFromIdOnToken(effectId, uuid, origin, overlay, effectUpdated);
    }
  }

  async updateActiveEffectFromNameOnToken(
    effectName: string,
    uuid: string,
    origin,
    overlay,
    effectUpdated: ActiveEffectData,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'updateActiveEffectFromNameOnToken',
        effectName,
        uuid,
        origin,
        overlay,
        effectUpdated,
      );
    } else {
      return this._effectHandler.updateActiveEffectFromNameOnToken(effectName, uuid, origin, overlay, effectUpdated);
    }
  }

  // ==================================================================

  async onManageActiveEffectFromEffectId(
    effectActions: EffectActions,
    owner: Actor | Item,
    effectId: string,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'onManageActiveEffectFromEffectId',
        effectActions,
        owner,
        effectId,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    } else {
      return this._effectHandler.onManageActiveEffectFromEffectId(
        effectActions,
        owner,
        effectId,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    }
  }

  /**
   * Manage Active Effect instances through the Actor Sheet via effect control buttons.
   * @param {MouseEvent} event      The left-click event on the effect control
   * @param {Actor|Item} owner      The owning document which manages this effect
   * @returns {Promise|null}        Promise that resolves when the changes are complete.
   */
  async onManageActiveEffectFromEffect(
    effectActions: EffectActions,
    owner: Actor | Item,
    effect: Effect,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'onManageActiveEffectFromEffect',
        effectActions,
        owner,
        effect,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    } else {
      return this._effectHandler.onManageActiveEffectFromEffect(
        effectActions,
        owner,
        effect,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    }
  }

  /**
   * Manage Active Effect instances through the Actor Sheet via effect control buttons.
   * @param {MouseEvent} event      The left-click event on the effect control
   * @param {Actor|Item} owner      The owning document which manages this effect
   * @returns {Promise|null}        Promise that resolves when the changes are complete.
   */
  async onManageActiveEffectFromActiveEffect(
    effectActions: EffectActions,
    owner: Actor | Item,
    activeEffect: ActiveEffect | null | undefined,
    alwaysDelete?: boolean,
    forceEnabled?: boolean,
    forceDisabled?: boolean,
    isTemporary?: boolean,
    isDisabled?: boolean,
    withSocket = true,
  ) {
    if (withSocket && isGMConnectedAndSocketLibEnable()) {
      return this._socket.executeAsGM(
        'onManageActiveEffectFromActiveEffect',
        effectActions,
        owner,
        activeEffect,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    } else {
      return this._effectHandler.onManageActiveEffectFromActiveEffect(
        effectActions,
        owner,
        activeEffect,
        alwaysDelete,
        forceEnabled,
        forceDisabled,
        isTemporary,
        isDisabled,
      );
    }
  }
}
