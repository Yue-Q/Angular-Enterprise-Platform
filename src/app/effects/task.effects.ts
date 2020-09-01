import {Injectable} from '@angular/core';
import {Actions, Effect, toPayload} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {TaskService} from '../services';
import * as actions from '../actions/task.action';
import * as fromRoot from '../reducers';

@Injectable()
export class TaskEffects {

  @Effect()
  loadTasksInLists$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.LOAD_IN_LISTS)
    .map(toPayload)
    .mergeMap((taskLists) => {
      return this.service$
        .getByLists(taskLists)
        .map(tasks => new actions.LoadTasksInListsSuccessAction(tasks))
        .catch(err => of(new actions.LoadTasksInListsFailAction(JSON.stringify(err))));
      }
    );

  @Effect()
  addTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.ADD)
    .map(toPayload)
    .switchMap((task) => {
      return this.service$
        .add(task)
        .map(t => new actions.AddTaskSuccessAction(t))
        .catch(err => of(new actions.AddTaskFailAction(JSON.stringify(err))));
      }
    );

  @Effect()
  updateTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.UPDATE)
    .map(toPayload)
    .switchMap(task => this.service$
      .update(task)
      .map(t => new actions.UpdateTaskSuccessAction(t))
      .catch(err => of(new actions.UpdateTaskFailAction(JSON.stringify(err))))
    );

  @Effect()
  removeTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.DELETE)
    .map(toPayload)
    .switchMap(task => this.service$
      .del(task)
      .map(t => new actions.DeleteTaskSuccessAction(t))
      .catch(err => of(new actions.DeleteTaskFailAction(JSON.stringify(err))))
    );

  @Effect()
  completeTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.COMPLETE)
    .map(toPayload)
    .switchMap(task => this.service$
      .complete(task)
      .map(t => new actions.CompleteTaskSuccessAction(t))
      .catch(err => of(new actions.CompleteTaskFailAction(JSON.stringify(err))))
    );

  @Effect()
  moveTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.MOVE)
    .map(toPayload)
    .switchMap(({taskId, taskListId}) => this.service$
      .move(taskId, taskListId)
      .map(task => new actions.MoveTaskSuccessAction(task))
      .catch(err => of(new actions.MoveTaskFailAction(JSON.stringify(err))))
    );

  @Effect()
  moveAllTask$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.MOVE_ALL)
    .map(toPayload)
    .switchMap(({srcListId, targetListId}) => this.service$.moveAll(srcListId, targetListId)
      .map(tasks => new actions.MoveAllSuccessAction(tasks))
      .catch(err => of(new actions.MoveAllFailAction(err)))
    );

  /**
   * 任务的 Effects
   * @param actions$ 注入 action 数据流
   * @param service$ 注入任务服务
   * @param store$ 注入 redux store
   */
  constructor(private actions$: Actions,
              private service$: TaskService,
              private store$: Store<fromRoot.State>) {}
}
