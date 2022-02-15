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
  changes: any[] = [];
  atlChanges: any[] = [];
  tokenMagicChanges: any[] = [];
  nestedEffects: Effect[] = [];
  transfer = false;
  // ADDED FROM 4535992
  origin = '';
  overlay = false;
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
    flags = {},
    changes = <any[]>[],
    atlChanges = <any[]>[],
    tokenMagicChanges = <any[]>[],
    nestedEffects = <Effect[]>[],
    transfer = false,
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
    return {
      id: this._id,
      name: this.name,
      label: this.name,
      icon: this.icon,
      tint: this.tint,
      duration: this._getDurationData(),
      flags: foundry.utils.mergeObject(this.flags, {
        core: {
          statusId: this._id,
          overlay: overlay ? overlay : this.overlay ? this.overlay : false, // MOD 4535992
        },
        isConvenient: true,
        convenientDescription: this.description,
      }),
      origin: origin ? origin : this.origin ? this.origin : '', // MOD 4535992
      transfer: this.transfer ?? false,
      //changes: this.changes, // MOD 4535992
      changes: this._handleIntegrations(),
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
    if (game.combat) {
      return {
        startRound: game.combat.round,
        rounds: this._getCombatRounds(),
        turns: this.turns,
      };
    } else {
      return {
        startTime: game.time.worldTime,
        seconds: this._getSeconds(),
      };
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
    return arrChanges;
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
