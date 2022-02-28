import { ActiveEffectDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import { EffectDurationData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectDurationData';
import { PropertiesToSource } from '@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes';
import { i18n } from '../lib/lib';
import { game } from '../settings';

/**
 * Data class for defining an effect
 */
export default class Effect {
  customId: string;
  name: string;
  description: string;
  icon: string;
  tint: string;
  seconds: number;
  rounds: number;
  turns: number;
  isDynamic = false;
  isViewable = true;
  flags: any;
  changes: EffectChangeData[] = [];
  atlChanges: EffectChangeData[] = [];
  tokenMagicChanges: EffectChangeData[] = [];
  nestedEffects: Effect[] = [];
  transfer = false;
  // ADDED FROM 4535992
  origin = '';
  overlay = false;
  atcvChanges: EffectChangeData[] = [];
  isDisabled: boolean;
  isTemporary: boolean;
  isSuppressed: boolean;
  dae: {};
  // END ADDED FROM 4535992

  constructor({
    customId = '',
    name = '',
    description = '',
    icon = '',
    tint = '',
    seconds = NaN,
    rounds = NaN,
    turns = NaN,
    isDynamic = false,
    isViewable = true,
    isDisabled = false,
    isTemporary = false,
    isSuppressed = false,
    flags = {},
    changes = <any[]>[],
    atlChanges = <any[]>[],
    tokenMagicChanges = <any[]>[],
    nestedEffects = <Effect[]>[],
    transfer = false,
    atcvChanges = <any[]>[],
    dae = {},
  }) {
    this.customId = customId;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.tint = tint;
    this.seconds = seconds;
    this.rounds = rounds;
    this.turns = turns;
    this.isDynamic = isDynamic;
    this.isViewable = isViewable;
    this.flags = flags;
    this.changes = changes;
    this.atlChanges = atlChanges;
    this.tokenMagicChanges = tokenMagicChanges;
    this.nestedEffects = nestedEffects;
    this.transfer = transfer;
    // 4535992 ADDED
    this.atcvChanges = atcvChanges;
    this.dae = {};
    // This are not effect data
    this.isDisabled = isDisabled;
    this.isTemporary = isTemporary;
    this.isSuppressed = isSuppressed;
  }

  /**
   * Converts the effect data to an active effect data object
   *
   * @param {object} params - the params to use for conversion
   * @param {string} params.origin - the origin to add to the effect
   * @param {boolean} params.overlay - whether the effect is an overlay or not
   * @returns {object} The active effect data object for this effect
   */
  convertToActiveEffectData({ origin = '', overlay = false } = {}): Record<string, unknown> {
    const isPassive = !this.isTemporary;
    return {
      id: this._id,
      name: i18n(this.name),
      label: i18n(this.name),
      description: i18n(this.description), // 4535992 this not make sense, but it doesn't hurt either
      icon: this.icon,
      tint: this.tint,
      duration: this._getDurationData(),
      flags: foundry.utils.mergeObject(this.flags, {
        core: {
          statusId: isPassive ? undefined : this._id,
          overlay: overlay ? overlay : this.overlay ? this.overlay : false, // MOD 4535992
        },
        isConvenient: true,
        convenientDescription: i18n(this.description),
        dae: this._isEmptyObject(this.dae)
          ? isPassive
            ? { stackable: false, specialDuration: [], transfer: true }
            : {}
          : this.dae,
      }),
      origin: origin ? origin : this.origin ? this.origin : '', // MOD 4535992
      transfer: isPassive ? false : this.transfer,
      //changes: this.changes, // MOD 4535992
      changes: this._handleIntegrations(),
      // 4535992 these are not under data
      // isDisabled: this.isDisabled ?? false,
      // isTemporary: this.isTemporary ?? false,
      // isSuppressed: this.isSuppressed ?? false,
    };
  }

  /**
   * Converts the Effect into an object
   *
   * @returns {object} the object representation of this effect
   */
  convertToObject() {
    return { ...this };
  }

  get _id() {
    return `Convenient Effect: ${this.name}`;
  }

  _getDurationData() {
    const isPassive = !this.isTemporary;
    if (game.combat) {
      if (isPassive) {
        return {
          startTime: game.time.worldTime,
          startRound: 0,
          startTurn: 0,
        };
      } else {
        return {
          startRound: game.combat.round,
          rounds: this._getCombatRounds(),
          turns: this.turns,
        };
      }
    } else {
      if (isPassive) {
        return {
          startTime: game.time.worldTime,
          startRound: 0,
          startTurn: 0,
        };
      } else {
        return {
          startTime: game.time.worldTime,
          seconds: this._getSeconds(),
        };
      }
    }
  }

  _getCombatRounds() {
    if (this.rounds) {
      return this.rounds;
    }

    if (this.seconds) {
      return this.seconds / Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  _getSeconds() {
    if (this.seconds) {
      return this.seconds;
    }

    if (this.rounds) {
      return this.rounds * Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  // =============================================

  _handleIntegrations() {
    const arrChanges = this.changes || [];
    if (this.atlChanges.length > 0) {
      arrChanges.push(...this.atlChanges);
    }

    if (this.tokenMagicChanges.length > 0) {
      arrChanges.push(...this.tokenMagicChanges);
    }

    if (this.atcvChanges.length > 0) {
      arrChanges.push(...this.atcvChanges);
    }

    return arrChanges;
  }

  _isEmptyObject(obj: any) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    const result =
      obj && // null and undefined check
      Object.keys(obj).length === 0 &&
      Object.getPrototypeOf(obj) === Object.prototype;
    return result;
  }
}

/**
 * Contains any constants for the application
 */
export class Constants {
  static COLORS = {
    COLD_FIRE: '#389888',
    FIRE: '#f98026',
    WHITE: '#ffffff',
    MOON_TOUCHED: '#f4f1c9',
  };

  static SECONDS = {
    IN_ONE_ROUND: CONFIG.time.roundTime || 6,
    IN_ONE_MINUTE: 60,
    IN_TEN_MINUTES: 600,
    IN_ONE_HOUR: 3600,
    IN_SIX_HOURS: 21600,
    IN_EIGHT_HOURS: 28800,
    IN_ONE_DAY: 86400,
    IN_ONE_WEEK: 604800,
  };
}

export class EffectSupport {
  static buildDefault(
    effectData: any,
    isPassive: boolean,
    changes: any[] = [],
    atlChanges: any[] = [],
    tokenMagicChanges: any[] = [],
    atcvChanges: any[] = [],
  ): Effect {
    return new Effect({
      customId: effectData.id,
      name: i18n(effectData.name),
      description: ``,
      icon: effectData.img,
      tint: undefined,
      seconds: 0,
      rounds: 0,
      turns: 0,
      flags: foundry.utils.mergeObject(
        {},
        {
          core: {
            statusId: isPassive ? undefined : effectData.id,
            overlay: false,
          },
          isConvenient: true,
        },
      ),
      changes: changes,
      atlChanges: atlChanges,
      tokenMagicChanges: tokenMagicChanges,
      atcvChanges: atcvChanges,
      isDisabled: false,
      isTemporary: !isPassive,
      isSuppressed: false,
    });
  }

  static _handleIntegrations(changes: any[]): EffectChangeData[] {
    let arrChanges: EffectChangeData[] = [];
    // if (this.atlChanges.length > 0) {
    //   arrChanges.push(...this.atlChanges);
    // }

    // if (this.tokenMagicChanges.length > 0) {
    //   arrChanges.push(...this.tokenMagicChanges);
    // }

    // if (this.atcvChanges.length > 0) {
    //   arrChanges.push(...this.atcvChanges);
    // }
    arrChanges = EffectSupport.retrieveChangesOrderedByPriority(changes);
    return arrChanges;
  }

  static _isEmptyObject(obj: any) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    const result =
      obj && // null and undefined check
      Object.keys(obj).length === 0 &&
      Object.getPrototypeOf(obj) === Object.prototype;
    return result;
  }

  static _getDurationData(seconds: number, rounds: number, turns: number) {
    if (game.combat) {
      return {
        startRound: game.combat.round,
        rounds: EffectSupport._getCombatRounds(seconds, rounds),
        turns: turns,
      };
    } else {
      return {
        startTime: game.time.worldTime,
        seconds: EffectSupport._getSeconds(seconds, rounds),
      };
    }
  }

  static _getCombatRounds(seconds: number, rounds: number) {
    if (rounds) {
      return rounds;
    }

    if (seconds) {
      return seconds / Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  static _getSeconds(seconds: number, rounds: number) {
    if (seconds) {
      return seconds;
    }

    if (rounds) {
      return rounds * Constants.SECONDS.IN_ONE_ROUND;
    }

    return undefined;
  }

  static convertActiveEffectToEffect(effect: ActiveEffect): Effect {
    const atlChanges = effect.data.changes.filter((changes) => changes.key.startsWith('ATL'));
    const tokenMagicChanges = effect.data.changes.filter((changes) => changes.key === 'macro.tokenMagic');
    const atcvChanges = effect.data.changes.filter((changes) => changes.key.startsWith('ATCV'));
    const changes = effect.data.changes.filter(
      (change) => !change.key.startsWith('ATL') && change.key !== 'macro.tokenMagic' && !change.key.startsWith('ATCV'),
    );
    const isDisabled = effect.data.disabled || false;
    //@ts-ignore
    const isSuppressed = effect.data.document.isSuppressed || false;
    const isTemporary = effect.isTemporary || false;
    const isPassive = !isTemporary;

    return new Effect({
      customId: <string>effect.id,
      name: i18n(effect.data.label),
      description: i18n(<string>effect.data.flags.customEffectDescription),
      icon: <string>effect.data.icon,
      tint: <string>effect.data.tint,
      seconds: effect.data.duration.seconds,
      rounds: effect.data.duration.rounds,
      turns: effect.data.duration.turns,
      flags: effect.data.flags,
      changes,
      atlChanges,
      tokenMagicChanges,
      atcvChanges,
      isDisabled,
      isTemporary,
      isSuppressed,
    });
  }

  static convertActiveEffectDataPropertiesToActiveEffect(
    p: PropertiesToSource<ActiveEffectDataProperties>,
    isPassive: boolean,
  ): ActiveEffect {
    //@ts-ignore
    return ActiveEffect.create({
      id: p._id,
      name: i18n(p.label),
      label: i18n(p.label),
      icon: p.icon,
      tint: p.tint,
      duration: EffectSupport._getDurationData(
        <number>p.duration.seconds,
        <number>p.duration.rounds,
        <number>p.duration.turns,
      ),
      flags: foundry.utils.mergeObject(p.flags, {
        core: {
          statusId: isPassive ? undefined : p._id,
          //@ts-ignore
          overlay: p.overlay ? p.overlay : false, // MOD 4535992
        },
        isConvenient: true,
        //@ts-ignore
        convenientDescription: p.description ? i18n(p.description) : '',
        dae: this._isEmptyObject(p.flags.dae) ? { stackable: false, specialDuration: [], transfer: true } : p.flags.dae,
      }),
      origin: origin ? origin : p.origin ? p.origin : '', // MOD 4535992
      transfer: p.transfer ?? false,
      //changes: p.changes, // MOD 4535992
      changes: EffectSupport._handleIntegrations(p.changes),
    });
  }

  static retrieveChangesOrderedByPriority(changesTmp: EffectChangeData[]) {
    // Organize non-disabled effects by their application priority
    const changes = <EffectChangeData[]>changesTmp.reduce((changes) => {
      return changes.map((c: EffectChangeData) => {
        const c2 = <EffectChangeData>duplicate(c);
        // c2.effect = e;
        c2.priority = <number>c2.priority ?? c2.mode * 10;
        return c2;
      });
    }, []);
    changes.sort((a, b) => <number>a.priority - <number>b.priority);
    return changes;
  }

  static retrieveChangesOrderedByPriorityFromAE(effectEntity: ActiveEffect) {
    // Organize non-disabled effects by their application priority
    const changes = <EffectChangeData[]>[effectEntity].reduce((changes, e: ActiveEffect) => {
      if (e.data.disabled) {
        return changes;
      }
      return changes.concat(
        //@ts-ignore
        (<EffectChangeData[]>e.data.changes).map((c: EffectChangeData) => {
          const c2 = <EffectChangeData>duplicate(c);
          // c2.effect = e;
          c2.priority = <number>c2.priority ?? c2.mode * 10;
          return c2;
        }),
      );
    }, []);
    changes.sort((a, b) => <number>a.priority - <number>b.priority);
    return changes;
  }
}
