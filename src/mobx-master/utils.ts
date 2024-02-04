import {isAction} from 'mobx';
import {Payload, PayloadArgs} from './types';

export const getActionsFromStore = (store: any): string[] => {
  const storeMethods = Object.values(
    Object.getOwnPropertyNames(Object.getPrototypeOf(store)),
  );

  return storeMethods.filter(method => isAction(store?.[method]));
};

export const getStoreName = (store: any[]): string => {
  return store?.[0] || '';
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

  console.log({
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
  });
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
