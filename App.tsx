import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {observer} from 'mobx-react';

import TodoStore from './src/stores/TodoStore';
import UserStore from './src/stores/UserStore';

import {MobxMaster} from './src/mobx-master';

if (__DEV__) {
  MobxMaster(['TodoStore', TodoStore], ['UserStore', UserStore]);
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />

      <View style={styles.sectionContainer}>
        <Text
          style={styles.sectionTitle}>{`Username: ${UserStore.userName}`}</Text>
        <Text style={styles.sectionTitle}>{`Age: ${UserStore.age}`}</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text
          style={
            styles.sectionTitle
          }>{`Todo count: ${TodoStore.countToods}`}</Text>
        <Text
          style={
            styles.sectionTitle
          }>{`Done Todos: ${TodoStore.countDoneToods}`}</Text>
      </View>
      <View>
        <ScrollView>
          {TodoStore.todos.map(todo => (
            <View key={todo.id}>
              <Text>{todo.name}</Text>
              <Text>{`Done: ${todo.done ? 'true' : 'false'}`}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
    padding: 24,
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
});

export default observer(App);
