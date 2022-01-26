import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';

import { Project } from 'app/models/project';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Org } from 'app/models/org';

interface GetParameters {
  getFeatures?: boolean;
  getDocuments?: boolean;
  getCurrentPeriod?: boolean;
  getDecision?: boolean;
}

@Injectable()
export class ProjectService {
  private projectList: Project[] = [];

  constructor(
    private api: ApiService,
  ) { }

  /**
   * Gets count of projects.
   *
   * @returns Observable
   */
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get all projects.
   *
   * @param pageNum
   * @param pageSize
   * @param sortBy
   * @returns
   */
  getAll(pageNum: number = 1, pageSize: number = 20, sortBy: string = null): Observable<Object> {
    return this.api.getProjects(pageNum, pageSize, sortBy)
      .map((res: any) => {
        if (res) {
          this.projectList = [];
          res[0].results.forEach(project => {
            this.projectList.push(new Project(project));
          });
          return { totalCount: res[0].total_items, data: this.projectList };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get project by ID.
   *
   * @param projId
   * @param cpStart
   * @param cpEnd
   * @returns
   */
  getById(projId: string, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    return this.api.getProject(projId, cpStart, cpEnd)
      .map(projects => {
        // Get upcoming comment period if there is one and convert it into a comment period object.
        if (projects.length > 0) {
          if (projects[0].commentPeriodForBanner && projects[0].commentPeriodForBanner.length > 0) {
            projects[0].commentPeriodForBanner = new CommentPeriod(projects[0].commentPeriodForBanner[0]);
          } else {
            projects[0].commentPeriodForBanner = null;
          }
        }
        // Return the first (only) project.
        return projects.length > 0 ? new Project(projects[0]) : null;
      })
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add a new project.
   *
   * @param item
   * @returns
   */
  add(item: Project): Observable<Project> {
    delete item._id;

    // Replace newlines with \\n (JSON format).
    if (item.description) {
      item.description = item.description.replace(/\n/g, '\\n');
    }

    return this.api.addProject(item)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Save a project.
   *
   * @param orig
   * @returns
   */
  save(orig: Project): Observable<Project> {
    // make a (deep) copy of the passed-in project so we don't change it
    const proj = _.cloneDeep(orig);

    // replace newlines with \\n (JSON format)
    if (proj.description) {
      proj.description = proj.description.replace(/\n/g, '\\n');
    }

    return this.api.saveProject(proj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete project.
   *
   * @param proj
   * @returns
   */
  delete(proj: Project): Observable<Project> {
    return this.api.deleteProject(proj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Publish a project.
   *
   * @param proj
   * @returns
   */
  publish(proj: Project): Observable<Project> {
    console.log('publishgin');
    return this.api.publishProject(proj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Unpublish a project.
   *
   * @param proj
   * @returns
   */
  unPublish(proj: Project): Observable<Project> {
    return this.api.unPublishProject(proj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add pins.
   *
   * @param proj
   * @param pins
   * @returns
   */
  addPins(proj: Project, pins: any): Observable<Project> {
    return this.api.addPinsToProject(proj, pins)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add group.
   *
   * @param proj
   * @param group
   * @returns
   */
  addGroup(proj: Project, group: any): Observable<Project> {
    return this.api.addGroupToProject(proj, group)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Save group.
   *
   * @param projectId
   * @param groupId
   * @param groupObj
   * @returns
   */
  saveGroup(projectId: any, groupId: any, groupObj: any): Observable<Project> {
    return this.api.saveGroup(projectId, groupId, groupObj)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete group.
   *
   * @param proj
   * @param group
   * @returns
   */
  deleteGroup(proj: Project, group: string): Observable<Project> {
    return this.api.deleteGroup(proj, group)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete pin.
   *
   * @param projId
   * @param pin
   * @returns
   */
  deletePin(projId: string, pin: string): Observable<Project> {
    return this.api.deletePin(projId, pin)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get pins.
   *
   * @param proj
   * @param pageNum
   * @param pageSize
   * @param sortBy
   * @returns
   */
  getPins(proj: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectPins(proj, pageNum, pageSize, sortBy)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get group members.
   *
   * @param proj
   * @param groupId
   * @param pageNum
   * @param pageSize
   * @param sortBy
   * @returns
   */
  getGroupMembers(proj: string, groupId: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectGroupMembers(proj, groupId, pageNum, pageSize, sortBy)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Add group members.
   *
   * @param proj
   * @param groupId
   * @param members
   * @returns
   */
  addGroupMembers(proj: Project, groupId: string, members: any): Observable<Project> {
    return this.api.addMembersToGroup(proj, groupId, members)
      .catch(error => this.api.handleError(error));
  }

  /**
   * Delete group members.
   *
   * @param projectId
   * @param groupId
   * @param member
   * @returns
   */
  deleteGroupMembers(projectId: string, groupId: string, member: string): Observable<Project> {
    return this.api.deleteMembersFromGroup(projectId, groupId, member)
      .catch(error => this.api.handleError(error));
  }
}
