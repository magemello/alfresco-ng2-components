/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailsModel } from '../models/task-details.model';
import { ChecklistComponent } from './checklist.component';
import { setupTestBed } from '@alfresco/adf-core';
import { ProcessTestingModule } from '../../testing/process.testing.module';
import { TaskListService } from './../services/tasklist.service';
import { of } from 'rxjs';

describe('ChecklistComponent', () => {

    let checklistComponent: ChecklistComponent;
    let fixture: ComponentFixture<ChecklistComponent>;
    let element: HTMLElement;
    let showChecklistDialog;
    let service: TaskListService;

    setupTestBed({
        imports: [ProcessTestingModule]
    });

    beforeEach(async(() => {
        service = TestBed.get(TaskListService);
        spyOn(service, 'getTaskChecklist').and.returnValue(of([{
            id: 'fake-check-changed-id',
            name: 'fake-check-changed-name'
        }]));

        fixture = TestBed.createComponent(ChecklistComponent);
        checklistComponent = fixture.componentInstance;
        element = fixture.nativeElement;

        fixture.detectChanges();
    }));

    it('should show checklist component title', () => {
        expect(element.querySelector('#checklist-label')).toBeDefined();
        expect(element.querySelector('#checklist-label')).not.toBeNull();
    });

    it('should show no checklist message', () => {
        expect(element.querySelector('#checklist-none-message')).not.toBeNull();
        expect(element.querySelector('#checklist-none-message').textContent).toContain('ADF_TASK_LIST.DETAILS.CHECKLIST.NONE');
    });

    describe('when is readonly mode', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            checklistComponent.readOnly = true;

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
        });

        it('should NOT show add checklist button', () => {
            expect(element.querySelector('#add-checklist')).toBeNull();
        });

        it('should NOT show cancel checklist button', () => {
            expect(element.querySelector('#remove-fake-check-id')).toBeNull();
        });
    });

    describe('when is not in readonly mode', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.readOnly = false;
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
        });

        it('should show add checklist button', () => {
            expect(element.querySelector('#add-checklist')).not.toBeNull();
        });

        it('should show cancel checklist button', () => {
            expect(element.querySelector('#remove-fake-check-id')).not.toBeNull();
        });
    });

    describe('when interact with checklist dialog', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist = [];

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
        });

        it('should show dialog when clicked on add', () => {
            expect(showChecklistDialog).not.toBeNull();
            showChecklistDialog.click();

            expect(window.document.querySelector('#checklist-dialog')).not.toBeNull();
            expect(window.document.querySelector('#add-checklist-title')).not.toBeNull();
            expect(window.document.querySelector('#add-checklist-title').textContent).toContain('New Check');
        });
    });

    describe('when there are task checklist', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist = [];
            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
        });

        afterEach(() => {
            const overlayContainers = <any> window.document.querySelectorAll('.cdk-overlay-container');
            overlayContainers.forEach((overlayContainer) => {
                overlayContainer.innerHTML = '';
            });
        });

        it('should show task checklist', () => {
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            fixture.detectChanges();
            expect(element.querySelector('#check-fake-check-id')).not.toBeNull();
            expect(element.querySelector('#check-fake-check-id').textContent).toContain('fake-check-name');
        });

        it('should not show delete icon when checklist task is completed', () => {
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-completed-id',
                name: 'fake-completed-name',
                endDate: '2018-05-23T11:25:14.552+0000'
            }));
            fixture.detectChanges();
            expect(element.querySelector('#remove-fake-check-id')).not.toBeNull();
            expect(element.querySelector('#check-fake-completed-id')).not.toBeNull();
            expect(element.querySelector('#check-fake-completed-id')).toBeDefined();
            expect(element.querySelector('#remove-fake-completed-id')).toBeNull();
        });

        it('should add checklist', async(() => {
            spyOn(service, 'addTask').and.returnValue(of({
                id: 'fake-check-added-id', name: 'fake-check-added-name'
            }));

            showChecklistDialog.click();
            let addButtonDialog = <HTMLElement> window.document.querySelector('#add-check');
            addButtonDialog.click();

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#check-fake-check-added-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-added-id').textContent).toContain('fake-check-added-name');
            });
        }));

        it('should remove a checklist element', async(() => {
            spyOn(service, 'deleteTask').and.returnValue(of(''));

            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            fixture.detectChanges();
            let checklistElementRemove = <HTMLElement> element.querySelector('#remove-fake-check-id');
            expect(checklistElementRemove).toBeDefined();
            expect(checklistElementRemove).not.toBeNull();
            checklistElementRemove.click();

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#fake-check-id')).toBeNull();
            });
        }));

        it('should send an event when the checklist is deleted', (done) => {
            spyOn(service, 'deleteTask').and.returnValue(of(''));
            let disposableDelete = checklistComponent.checklistTaskDeleted.subscribe(() => {
                expect(element.querySelector('#fake-check-id')).toBeNull();
                disposableDelete.unsubscribe();
                done();
            });

            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            fixture.detectChanges();
            let checklistElementRemove = <HTMLElement> element.querySelector('#remove-fake-check-id');
            expect(checklistElementRemove).toBeDefined();
            expect(checklistElementRemove).not.toBeNull();
            checklistElementRemove.click();
        });

        it('should show load task checklist on change', async(() => {

            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            fixture.detectChanges();
            let change = new SimpleChange(null, 'new-fake-task-id', true);
            checklistComponent.ngOnChanges({
                taskId: change
            });

            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#check-fake-check-changed-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-changed-id').textContent).toContain('fake-check-changed-name');
            });
        }));

        it('should show empty checklist when task id is null', async(() => {
            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(new TaskDetailsModel({
                id: 'fake-check-id',
                name: 'fake-check-name'
            }));
            fixture.detectChanges();
            checklistComponent.taskId = null;
            let change = new SimpleChange(null, 'new-fake-task-id', true);
            checklistComponent.ngOnChanges({
                taskId: change
            });
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#checklist-none-message')).not.toBeNull();
                expect(element.querySelector('#checklist-none-message').textContent).toContain('ADF_TASK_LIST.DETAILS.CHECKLIST.NONE');
            });
        }));

        it('should emit checklist task created event when the checklist is successfully added', (done) => {
            spyOn(service, 'addTask').and.returnValue(of({ id: 'fake-check-added-id', name: 'fake-check-added-name' }));

            let disposableCreated = checklistComponent.checklistTaskCreated.subscribe((taskAdded: TaskDetailsModel) => {
                fixture.detectChanges();
                expect(taskAdded.id).toEqual('fake-check-added-id');
                expect(taskAdded.name).toEqual('fake-check-added-name');
                expect(element.querySelector('#check-fake-check-added-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-added-id').textContent).toContain('fake-check-added-name');
                disposableCreated.unsubscribe();
                done();
            });
            showChecklistDialog.click();
            let addButtonDialog = <HTMLElement> window.document.querySelector('#add-check');
            addButtonDialog.click();
        });
    });

});
