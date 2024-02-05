import {isAction} from 'mobx';
import {Event, Payload, PayloadArgs, Stores} from './types';

export const getActionsFromStore = (store: any): string[] => {
  const storeMethods = Object.values(
    Object.getOwnPropertyNames(Object.getPrototypeOf(store)),
  );

  return storeMethods.filter(method => isAction(store?.[method]));
};

export const getStoreName = (store: any[]): string => {
  return store?.[0] || '';
};

export const getActionStoreName = (event: Event, stores: Stores) => {
  if (!event.name) {
    return '';
  }

  let actionStoreName = '';

  stores.forEach((store, storeName) => {
    if (store.actions?.includes(event.name)) {
      let containsAllKeys = true;
      Object.keys(store?.store)?.forEach(key => {
        if (!(key in event.object)) {
          containsAllKeys = false;
        }
      });
      if (containsAllKeys) {
        actionStoreName = storeName;
      }
    }
  });

  return actionStoreName;
};

export const generatePayload = ({
  name,
  args,
  tree,
  before,
  startTime,
  storeName,
}: PayloadArgs): Payload => {
  const stringifyNumber = (input: number) =>
    input < 10 ? `0${input}` : `${input}`;

  return {
    id: (Math.random() + 1).toString(36).substring(7) + new Date().getTime(),
    startTime: startTime.toISOString(),
    time: `${stringifyNumber(startTime.getHours())}:${stringifyNumber(
      startTime.getMinutes(),
    )}:${stringifyNumber(startTime.getSeconds())}.${stringifyNumber(
      startTime.getMilliseconds(),
    )}`,
    took: '',
    action: {type: name, payload: args ? args[0] : undefined},
    actionName: name,
    storeName,
    before,
    after: tree,
  };
};
