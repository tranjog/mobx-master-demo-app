import {observable, action, makeObservable} from 'mobx';

class UserStore {
  @observable userName: string;
  @observable age: number;

  constructor() {
    makeObservable(this);
    this.userName = 'Alice';
    this.age = 30;
  }

  @action
  public setUserName(name: string) {
    this.userName = name;
  }

  @action
  public setAge(age: number) {
    this.age = age;
  }
}

export default new UserStore();
