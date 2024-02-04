# mobx-master-demo-app

A demo app with the middleware for the [Mobx Master Flipper Plugin](https://github.com/tranjog/flipper-plugin-mobx-master).
It might be published as an npm package at a later stage, but for now please copy `./src/mobx-master` to your app, and initialize it as in the example below

```
import {MobxMaster} from './src/mobx-master/index';

if (__DEV__) {
  MobxMaster(['TodoStore', TodoStore], ['UserStore', UserStore]);
}
```

[App.tsx](https://github.com/tranjog/mobx-master-demo-app/blob/main/App.tsx)
[mobx-master](https://github.com/tranjog/mobx-master-demo-app/blob/main/src/mobx-master/index.ts)

## Acknowledgement

This plugin stands on shoulders of giants, and is greatly inspired by [mobx-action-flipper](https://github.com/chvanlennep/mobx-action-flipper) and [mobx-flipper](https://github.com/khorark/mobx-flipper).
