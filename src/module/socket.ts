import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';
import { setSocket } from '../VariantEncumbrance';

export const SOCKET_HANDLERS = {
  /**
   * Generic sockets
   */
  CALL_HOOK: 'callHook',

  /**
   * Variant Encumbrance sockets
   */

  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */
};

export let variantEncumbranceSocket;

export function registerSocket() {
  debug('Registered variantEncumbranceSocket');
  if (variantEncumbranceSocket) {
    return variantEncumbranceSocket;
  }
  //@ts-ignore
  variantEncumbranceSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

  /**
   * Generic socket
   */
  variantEncumbranceSocket.register(SOCKET_HANDLERS.CALL_HOOK, (hook, ...args) => callHook(hook, ...args));

  // /**
  //  * Conditional Visibility sockets
  //  */
  // variantEncumbranceSocket.register(SOCKET_HANDLERS.ON_RENDER_TOKEN_CONFIG, (...args) =>
  //   API._onRenderTokenConfig(...args),
  // );

  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */

  /**
   * Effects
   */

  // variantEncumbranceSocket.register('addActorDataChanges', (...args) => API._actorUpdater.addActorDataChanges(...args));
  // variantEncumbranceSocket.register('removeActorDataChanges', (...args) => API._actorUpdater.removeActorDataChanges(...args));
  // variantEncumbranceSocket.register('toggleEffect', (...args) => API.toggleEffectArr(...args));
  // variantEncumbranceSocket.register('addEffect', (...args) => API.addEffectArr(...args));
  // variantEncumbranceSocket.register('removeEffect', (...args) => API.removeEffectArr(...args));

  // variantEncumbranceSocket.register('addEffectOnActor', (...args) => API.addEffectOnActorArr(...args));
  // variantEncumbranceSocket.register('removeEffectOnActor', (...args) => API.removeEffectOnActorArr(...args));
  // variantEncumbranceSocket.register('removeEffectFromIdOnActor', (...args) =>
  //   API.removeEffectFromIdOnActorArr(...args),
  // );
  // variantEncumbranceSocket.register('toggleEffectFromIdOnActor', (...args) =>
  //   API.toggleEffectFromIdOnActorArr(...args),
  // );
  // variantEncumbranceSocket.register('findEffectByNameOnActor', (...args) => API.findEffectByNameOnActorArr(...args));
  // variantEncumbranceSocket.register('hasEffectAppliedFromIdOnActor', (...args) =>
  //   API.hasEffectAppliedFromIdOnActorArr(...args),
  // );
  // variantEncumbranceSocket.register('hasEffectAppliedOnActor', (...args) => API.hasEffectAppliedOnActorArr(...args));

  // variantEncumbranceSocket.register('addEffectOnToken', (...args) => API.addEffectOnTokenArr(...args));
  // variantEncumbranceSocket.register('removeEffectOnToken', (...args) => API.removeEffectOnTokenArr(...args));
  // variantEncumbranceSocket.register('removeEffectFromIdOnToken', (...args) =>
  //   API.removeEffectFromIdOnTokenArr(...args),
  // );
  // variantEncumbranceSocket.register('toggleEffectFromIdOnToken', (...args) =>
  //   API.toggleEffectFromIdOnTokenArr(...args),
  // );
  // variantEncumbranceSocket.register('findEffectByNameOnToken', (...args) => API.findEffectByNameOnTokenArr(...args));
  // variantEncumbranceSocket.register('updateEffectFromIdOnToken', (...args) =>
  //   API.updateEffectFromIdOnTokenArr(...args),
  // );
  // variantEncumbranceSocket.register('updateEffectFromNameOnToken', (...args) =>
  //   API.updateEffectFromNameOnTokenArr(...args),
  // );
  // variantEncumbranceSocket.register('updateActiveEffectFromIdOnToken', (...args) =>
  //   API.updateActiveEffectFromIdOnTokenArr(...args),
  // );
  // variantEncumbranceSocket.register('updateActiveEffectFromNameOnToken', (...args) =>
  //   API.updateActiveEffectFromNameOnTokenArr(...args),
  // );

  // =========================================================
  variantEncumbranceSocket.register('calculateWeightOnActorFromId', (...args) =>
    API.calculateWeightOnActorFromIdArr(...args),
  );
  variantEncumbranceSocket.register('calculateWeightOnTokenFromId', (...args) =>
    API.calculateWeightOnTokenFromIdArr(...args),
  );
  variantEncumbranceSocket.register('calculateWeightOnActor', (...args) => API.calculateWeightOnActorArr(...args));

  setSocket(variantEncumbranceSocket);
  return variantEncumbranceSocket;
}

async function callHook(inHookName, ...args) {
  const newArgs: any[] = [];
  for (let arg of args) {
    if (typeof arg === 'string') {
      const testArg = await fromUuid(arg);
      if (testArg) {
        arg = testArg;
      }
    }
    newArgs.push(arg);
  }
  return Hooks.callAll(inHookName, ...newArgs);
}
