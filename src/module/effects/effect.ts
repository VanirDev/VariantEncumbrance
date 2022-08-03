import type { ActiveEffectDataProperties } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData';
import type { EffectChangeData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/effectChangeData';
import type { PropertiesToSource } from '@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes';
import { duplicateExtended, i18n, isStringEquals, is_real_number } from '../lib/lib';

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
    overlay = false,
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
    this.dae = dae || {};
    // This are not effect data
    this.isDisabled = isDisabled;
    this.isTemporary = isTemporary;
    this.isSuppressed = isSuppressed;
    this.overlay = overlay;
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
    if (is_real_number(this.seconds)) {
      this.isTemporary = true;
    }
    if (is_real_number(this.rounds)) {
      this.isTemporary = true;
    }
    if (is_real_number(this.turns)) {
      this.isTemporary = true;
    }
    const isPassive = !this.isTemporary;
    const currentDae = this._isEmptyObject(this.dae) ? this.flags.dae : this.dae;
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
        dae: this._isEmptyObject(currentDae)
          ? isPassive
            ? { stackable: false, specialDuration: [], transfer: true }
            : {}
          : currentDae,
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
    return deepClone({ ...this });
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

  isDuplicateEffectChange(aeKey: string, arrChanges: EffectChangeData[]) {
    let isDuplicate = false;
    for (const aec of arrChanges) {
      if (isStringEquals(aec.key, aeKey)) {
        isDuplicate = true;
        break;
      }
    }
    return isDuplicate;
  }

  _handleIntegrations() {
    const arrChanges: EffectChangeData[] = [];
    for (const change of <EffectChangeData[]>this?.changes) {
      if (!change.value) {
        change.value = '';
      }
      arrChanges.push(change);
    }

    if (this.atlChanges.length > 0) {
      for (const atlChange of this.atlChanges) {
        if (arrChanges.filter((e) => e.key === atlChange.key).length <= 0) {
          if (!this.isDuplicateEffectChange(atlChange.key, arrChanges)) {
            if (!atlChange.value) {
              atlChange.value = '';
            }
            arrChanges.push(atlChange);
          }
        }
      }
    }

    if (this.tokenMagicChanges.length > 0) {
      for (const tokenMagicChange of this.tokenMagicChanges) {
        if (arrChanges.filter((e) => e.key === tokenMagicChange.key).length <= 0) {
          if (!this.isDuplicateEffectChange(tokenMagicChange.key, arrChanges)) {
            if (!tokenMagicChange.value) {
              tokenMagicChange.value = '';
            }
            arrChanges.push(tokenMagicChange);
          }
        }
      }
    }

    if (this.atcvChanges.length > 0) {
      for (const atcvChange of this.atcvChanges) {
        if (arrChanges.filter((e) => e.key === atcvChange.key).length <= 0) {
          if (!this.isDuplicateEffectChange(atcvChange.key, arrChanges)) {
            if (!atcvChange.value) {
              atcvChange.value = '';
            }
            arrChanges.push(atcvChange);
          }
        }
      }
    }
    /*
    if (this.atlChanges.length > 0) {
      arrChanges.push(...this.atlChanges);
    }

    if (this.tokenMagicChanges.length > 0) {
      arrChanges.push(...this.tokenMagicChanges);
    }

    if (this.atcvChanges.length > 0) {
      arrChanges.push(...this.atcvChanges);
    }
    */
    return arrChanges;
  }

  _isEmptyObject(obj: any) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    if (obj === null || obj === undefined) {
      return true;
    }
    const result =
      obj && // null and undefined check
      (Object.keys(obj).length === 0 || Object.getPrototypeOf(obj) === Object.prototype);
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
