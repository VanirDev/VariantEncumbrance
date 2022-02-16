import CONSTANTS from './constants';
import { canvas, game } from './settings';
import EffectInterface from './effects/effect-interface';
import Effect from './effects/effect';

export default class API {
  static effectInterface: EffectInterface;

  static addEffect(actorId: string, effectName: string, effect: Effect) {
    return API.effectInterface.addEffectOnActor(effectName, <string>actorId, effect);
  }

  static async findEffectByNameOnActor(actorId: string, effectName: string): Promise<ActiveEffect | null> {
    return await API.effectInterface.findEffectByNameOnActor(effectName, <string>actorId);
  }

  static async hasEffectAppliedOnActor(actorId: string, effectName: string) {
    return await API.effectInterface.hasEffectAppliedOnActor(effectName, <string>actorId);
  }

  static async hasEffectAppliedFromIdOnActor(actorId: string, effectId: string) {
    return await API.effectInterface.hasEffectAppliedFromIdOnActor(effectId, <string>actorId);
  }

  static removeEffectFromIdOnActor(actorId: string, effectId: string) {
    return API.effectInterface.removeEffectFromIdOnActor(effectId, <string>actorId);
  }

  static removeEffectOnActor(actorId: string, effectName: string) {
    return API.effectInterface.removeEffectOnActor(effectName, <string>actorId);
  }
}
