import {observable, action, computed, makeObservable} from 'mobx';

type Todo = {
  id: string;
  name: string;
  done: boolean;
};

class TodoStore {
  @observable todos: Todo[];

  constructor() {
    makeObservable(this);
    this.todos = [];
  }

  @action
  public addTodo(todo: Todo) {
    this.todos.push(todo);
  }

  @action
  public removeTodo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }

  @action
  public markTodoAsDone(id: string) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? {...todo, done: true} : todo,
    );
  }

  @computed
  get countToods(): number {
    return this.todos.length;
  }
  @computed
  get countDoneToods(): number {
    return this.todos.filter(todo => todo.done).length;
  }
}

export default new TodoStore();
