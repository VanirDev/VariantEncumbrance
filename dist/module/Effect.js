import { getGame } from "./settings.js";
/**
 * Data class for defining an effect
 */
export default class Effect {
    constructor({ customId = '', name = '', description = '', icon = '', tint = '', seconds = NaN, rounds = NaN, turns = NaN, isDynamic = false, isViewable = true, flags = {}, changes = [], atlChanges = [], tokenMagicChanges = [], nestedEffects = [], }) {
        this.isDynamic = false;
        this.isViewable = true;
        this.changes = [];
        this.atlChanges = [];
        this.tokenMagicChanges = [];
        this.nestedEffects = [];
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
    }
    /**
     * Converts the effect data to an active effect data object
     *
     * @param {string} origin - the origin to add to the effect
     * @returns The active effect data object for this effect
     */
    convertToActiveEffectData(origin) {
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
                },
                isConvenient: true,
            }),
            origin: origin,
            changes: this.changes,
        };
    }
    get _id() {
        return `Convenient Effect: ${this.name}`;
    }
    _getDurationData() {
        if (getGame().combat) {
            return {
                startRound: getGame().combat?.round,
                rounds: this._getCombatRounds(),
                turns: this.turns,
            };
        }
        else {
            return {
                startTime: getGame().time.worldTime,
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
}
/**
 * Contains any constants for the application
 */
export class Constants {
}
Constants.COLORS = {
    COLD_FIRE: '#389888',
    FIRE: '#f98026',
    WHITE: '#ffffff',
};
Constants.SECONDS = {
    IN_ONE_ROUND: 6,
    IN_ONE_MINUTE: 60,
    IN_TEN_MINUTES: 600,
    IN_ONE_HOUR: 3600,
    IN_SIX_HOURS: 21600,
    IN_EIGHT_HOURS: 28800,
    IN_ONE_DAY: 86400,
    IN_ONE_WEEK: 604800,
};
