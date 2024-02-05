//@ts-ignore
import {addPlugin, Flipper} from 'react-native-flipper';
import {spy, toJS} from 'mobx';

import type {
  Payload,
  StoreMapItem,
  EmitAction,
  Event,
  ActionListener,
  Stores,
} from './types';
import {
  getActionsFromStore,
  getActionStoreName,
  getStoreName,
  generatePayload,
} from './utils';

let currentConnection: Flipper.FlipperConnection | null = null;
const storeActions: Record<string, string[]> = {};
const payloadsArray: Payload[] = [];

let stores: Stores = new Map<string, StoreMapItem>();

export const MobxMaster = (...mobxStores: any) => {
  if (!__DEV__ || currentConnection) {
    return;
  }

  mobxStores?.forEach((store: any[]) => {
    stores.set(getStoreName(store), {
      actions: getActionsFromStore(store[1]),
      store: store[1],
    });
  });

  initPlugin();
  spy(makeMobxActionListener() as ActionListener);
};

const initPlugin = () => {
  if (currentConnection === null) {
    addPlugin({
      getId() {
        return 'flipper-plugin-mobx-master';
      },
      onConnect(connection) {
        currentConnection = connection;

        try {
          connection.send('init', {
            stores: Object.fromEntries(stores.entries()),
          });
          connection.receive('message', (message: string) => {
            console.log('message', message);
          });
          connection.receive(
            'emitAction',
            ({storeKey, action, payload}: EmitAction) => {
              let finalPayload: any = payload;
              try {
                finalPayload = JSON.parse(payload);
              } catch (e) {}

              stores.get(storeKey)?.store[action]?.(finalPayload);
            },
          );
        } catch (error) {
          console.warn(error);
        }
      },
      onDisconnect() {},
      runInBackground() {
        return true;
      },
    });
  }
};

const makeMobxActionListener = () => {
  let payload: any | undefined;
  return (event: Event) => {
    if (!currentConnection) {
      return;
    }
    if (!payload && event.name && event.type === 'action') {
      const storeName = getActionStoreName(event, stores);
      if (storeName) {
        const startTime = new Date();
        const observableKeys = Object.keys(event.object ?? {});
        storeActions[storeName] = observableKeys;
        const before: Record<string, any> = {};
        observableKeys.forEach(name => {
          if (stores.get(storeName)?.store[name]) {
            before[name] = toJS(stores.get(storeName)?.store[name]);
          }
        });
        payload = generatePayload({
          args:
            event?.arguments?.length && event.arguments[0].nativeEvent
              ? undefined
              : event.arguments,
          name: event.name,
          storeName,
          tree: {},
          before,
          startTime,
        });
      }
      return;
    }
    if (payload && event.spyReportEnd) {
      payload.took = `${
        Date.now() - Date.parse(payload.startTime.toString())
      } ms`;
      payloadsArray.push({...payload});
      setTimeout(() => {
        const payloadToSend = payloadsArray[payloadsArray.length - 1];
        const currentStore = stores.get(payloadToSend.storeName);
        const after: Record<string, any> = {};
        storeActions[payloadToSend.storeName].forEach(name => {
          if (currentStore?.store[name]) {
            after[name] = toJS(currentStore?.store[name]);
          }
        });
        payloadToSend.after = after;
        try {
          currentConnection?.send('action', payloadToSend);
        } catch (error) {
          console.warn(error);
        }
        payloadsArray.pop();
      }, 100);
      payload = null;
    }
  };
};
