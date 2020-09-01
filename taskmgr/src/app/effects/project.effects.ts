import {Injectable} from '@angular/core';
import {Actions, Effect, toPayload} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {go} from '@ngrx/router-store';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {ProjectService} from '../services';
import * as actions from '../actions/project.action';
import * as tasklistActions from '../actions/task-list.action';
import * as userActions from '../actions/user.action';
import * as fromRoot from '../reducers';
import {Project} from '../domain';

@Injectable()
export class ProjectEffects {

  /**
   *
   */
  @Effect()
  loadProjects$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.LOADS)
    .map(toPayload)
    .withLatestFrom(this.store$.select(fromRoot.getAuth))
    .switchMap(([_, auth]) => this.service
      .get(auth.user.id)
      .map(projects => new actions.LoadProjectsSuccessAction(projects))
      .catch(err => of(new actions.LoadProjectsFailAction(JSON.stringify(err))))
    );

  @Effect()
  addProject$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.ADD)
    .map(toPayload)
    .withLatestFrom(this.store$.select(fromRoot.getAuth))
    .switchMap(([project, auth]) => {
      const added = {...project, members: [`${auth.user.id}`]};
      return this.service
        .add(added)
        .map(returned => new actions.AddProjectSuccessAction(returned))
        .catch(err => of(new actions.AddProjectFailAction(JSON.stringify(err))));
      }
    );

  @Effect()
  updateProject$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.UPDATE)
    .map(toPayload)
    .switchMap(project => this.service
      .update(project)
      .map(returned => new actions.UpdateProjectSuccessAction(returned))
      .catch(err => of(new actions.UpdateProjectFailAction(JSON.stringify(err))))
    );

  @Effect()
  updateLists$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.UPDATE_LISTS)
    .map(toPayload)
    .switchMap(project => this.service
      .updateTaskLists(project)
      .map(returned => new actions.UpdateListsSuccessAction(returned))
      .catch(err => of(new actions.UpdateListsFailAction(JSON.stringify(err))))
    );

  @Effect()
  removeProject$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.DELETE)
    .map(toPayload)
    .switchMap(project => this.service
      .del(project)
      .map(returned => new actions.DeleteProjectSuccessAction(returned))
      .catch(err => of(new actions.DeleteProjectFailAction(JSON.stringify(err))))
    );

  @Effect()
  selectProject$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.SELECT)
    .map(toPayload)
    .map(project => go([`/tasklists/${project.id}`]));

  @Effect()
  loadTaskLists$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.SELECT)
    .map(toPayload)
    .map(project => new tasklistActions.LoadTaskListsAction(project.id));

  @Effect()
  toLoadUsersByPrj$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.SELECT)
    .map(toPayload)
    .map(project => new userActions.LoadUsersByPrjAction(project.id));

  @Effect()
  startInitTaskLists$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.ADD_SUCCESS)
    .map(toPayload)
    .map(project => new tasklistActions.InitTaskListsAction(project));

  @Effect()
  addUserPrjRef$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.ADD_SUCCESS)
    .map(toPayload)
    .map((prj: Project) => prj.id)
    .withLatestFrom(this.store$.select(fromRoot.getAuth).map(auth => auth.user), (projectId, user) => {
      return new userActions.AddUserProjectAction({user: user, projectId: projectId});
    });

  @Effect()
  delUserPrjRef$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.DELETE_SUCCESS)
    .map(toPayload)
    .map((prj: Project) => prj.id)
    .withLatestFrom(this.store$.select(fromRoot.getAuth).map(auth => auth.user), (projectId, user) => {
      return new userActions.RemoveUserProjectAction({user: user, projectId: projectId});
    });

  @Effect()
  inviteMembersRef$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.INVITE)
    .map(toPayload)
    .switchMap(({projectId, members}) =>
      this.service.inviteMembers(projectId, members)
        .map(project => new actions.InviteMembersSuccessAction(project))
        .catch(err => of(new actions.InviteMembersFailAction(err)))
    );

  @Effect()
  updateUserPrjRef$: Observable<Action> = this.actions$
    .ofType(actions.ActionTypes.INVITE_SUCCESS)
    .map(toPayload)
    .map((project: Project) => new userActions.BatchUpdateUserProjectAction(project));

  /**
   *
   * @param actions$ action 流
   * @param service  注入 ProjectService
   * @param store$ 注入 redux store
   */
  constructor(private actions$: Actions,
              private service: ProjectService,
              private store$: Store<fromRoot.State>) {}
}
