import {observable, action, makeObservable} from 'mobx';

class UserStore {
  userName: string = 'Alice';
  age: number = 30;

  constructor() {
    makeObservable(this, {
      userName: observable,
      age: observable,
      setAge: action.bound,
      setUserName: action.bound,
    });
  }

  public setUserName(name: string) {
    this.userName = name;
  }

  public setAge = (age: number) => {
    this.age = age;
  };
}

export default new UserStore();
