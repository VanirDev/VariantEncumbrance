import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';

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
  //@ts-ignore
  variantEncumbranceSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

  /**
   * Generic socket
   */
  variantEncumbranceSocket.register(SOCKET_HANDLERS.CALL_HOOK, (hook, ...args) => callHook(hook, ...args));

  /**
   * Sense walls sockets
   */

  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */

  /**
   * Effects
   */
  variantEncumbranceSocket.register('toggleEffect', (...args) =>
    API.effectInterface._effectHandler.toggleEffectArr(...args),
  );
  variantEncumbranceSocket.register('addEffect', (...args) => API.effectInterface._effectHandler.addEffectArr(...args));
  variantEncumbranceSocket.register('removeEffect', (...args) =>
    API.effectInterface._effectHandler.removeEffectArr(...args),
  );
  // variantEncumbranceSocket.register('addActorDataChanges', (...args) => API._actorUpdater.addActorDataChanges(...args));
  // variantEncumbranceSocket.register('removeActorDataChanges', (...args) => API._actorUpdater.removeActorDataChanges(...args));
  variantEncumbranceSocket.register('addEffectOnActor', (...args) =>
    API.effectInterface._effectHandler.addEffectOnActorArr(...args),
  );
  variantEncumbranceSocket.register('removeEffectOnActor', (...args) =>
    API.effectInterface._effectHandler.removeEffectOnActorArr(...args),
  );
  variantEncumbranceSocket.register('removeEffectFromIdOnActor', (...args) =>
    API.effectInterface._effectHandler.removeEffectFromIdOnActorArr(...args),
  );
  variantEncumbranceSocket.register('toggleEffectFromIdOnActor', (...args) =>
    API.effectInterface._effectHandler.toggleEffectFromIdOnActorArr(...args),
  );
  variantEncumbranceSocket.register('findEffectByNameOnActor', (...args) =>
    API.effectInterface._effectHandler.findEffectByNameOnActorArr(...args),
  );
  variantEncumbranceSocket.register('addActiveEffectOnActor', (...args) =>
    API.effectInterface._effectHandler.addActiveEffectOnActorArr(...args),
  );

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
