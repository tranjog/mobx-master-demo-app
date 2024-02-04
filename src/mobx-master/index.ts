//@ts-ignore
import {addPlugin} from 'react-native-flipper';
import {spy, toJS} from 'mobx';

import {Payload, StoreMapItem, EmitAction, Event} from './types';
import {getActionsFromStore, getStoreName, generatePayload} from './utils';

let currentConnection: any = null;
const storeActions: Record<string, string[]> = {};
const payloadsArray: Payload[] = [];

let stores = new Map<string, StoreMapItem>();

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
  spy(makeMobxDebugger() as any);
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

const getActionStoreName = (property: string) => {
  if (!property) {
    return '';
  }

  let actionStoreName = '';

  stores.forEach((store, storeName) => {
    if (store.actions?.includes(property)) {
      actionStoreName = storeName;
    }
  });

  return actionStoreName;
};

const makeMobxDebugger = () => {
  let payload: any | undefined;
  return (event: Event) => {
    if (!currentConnection) {
      return;
    }
    if (!payload && event.name && event.type === 'action') {
      const storeName = getActionStoreName(event.name);
      if (storeName) {
        const startTime = new Date();
        const observableKeys = Object.keys(event.object ?? {});
        storeActions[storeName] = observableKeys;
        const before: any = {};
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
        const after: any = {};
        storeActions[payloadToSend.storeName].forEach(name => {
          if (currentStore?.store[name]) {
            after[name] = toJS(currentStore?.store[name]);
          }
        });
        payloadToSend.after = after;
        try {
          currentConnection.send('action', payloadToSend);
        } catch (error) {
          console.warn(error);
        }
        payloadsArray.pop();
      }, 100);
      payload = null;
    }
  };
};
