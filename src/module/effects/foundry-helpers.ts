import { canvas, game } from '../settings';

/**
 * Simple helpers for querying aspects of foundry
 */
export default class FoundryHelpers {
  constructor() {
    // this._settings = new Settings();
  }

  /**
   * Gets all UUIDs for selected or targeted tokens, depending on if prioritize
   * targets is enabled
   *
   * @returns {string[]} actor uuids for selected or targeted tokens
   */
  getActorUuidsFromCanvas() {
    if (canvas.tokens?.controlled.length == 0 && game.user?.targets.size == 0) {
      return <string[]>[];
    }

    // if (this._settings.prioritizeTargets && getGame().user?.targets.size !== 0) {
    //   return Array.from(<UserTargets>getGame().user?.targets).map((token) => token.actor?.uuid);
    // } else {
    return <string[]>canvas.tokens?.controlled.map((token) => token.actor?.uuid);
    // }
  }

  /**
   * Gets the actor object by the actor UUID
   *
   * @param {string} uuid - the actor UUID
   * @returns {Actor5e} the actor that was found via the UUID
   */
  async getActorByUuid(uuid: string): Promise<Actor> {
    //const actorToken = <TokenDocument>await fromUuid(uuid);
    //const actor = actorToken?.actor ? actorToken?.actor : actorToken;
    const actor = <Actor>game.actors?.get(uuid);
    return actor;
  }

  /**
   * Gets the actor object by the actor UUID
   *
   * @param {string} uuid - the actor UUID
   * @returns {Actor5e} the actor that was found via the UUID
   */
  async getTokenByUuid(uuid: string): Promise<Token> {
    const tokens = <Token[]>canvas.tokens?.placeables;
    const token = <Token>tokens.find((token) => token.id == uuid);
    return token;
  }
}
