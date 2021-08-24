import { getGame } from "./settings.js";
/**
 * Data class for defining an effect
 */
export default class Effect {
    constructor({ name = '', description = '', icon = '', seconds = NaN, turns = NaN, isDynamic = false, isViewable = true, flags = {}, changes = [], atlChanges = [], tokenMagicChanges = [], nestedEffects = [], }) {
        this.isDynamic = false;
        this.isViewable = true;
        this.changes = [];
        this.atlChanges = [];
        this.tokenMagicChanges = [];
        this.nestedEffects = [];
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.seconds = seconds;
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
                rounds: this.seconds ? this.seconds / 6 : undefined,
                turns: this.turns,
            };
        }
        else {
            return {
                startTime: getGame().time.worldTime,
                seconds: this.seconds ? this.seconds : undefined,
            };
        }
    }
}
