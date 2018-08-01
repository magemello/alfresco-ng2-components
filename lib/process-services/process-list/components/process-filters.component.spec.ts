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

import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { AppsProcessService } from '@alfresco/adf-core';
import { Observable } from 'rxjs/Observable';
import { FilterProcessRepresentationModel } from '../models/filter-process.model';
import { ProcessFilterService } from '../services/process-filter.service';
import { ProcessFiltersComponent } from './process-filters.component';
import { setupTestBed } from '../../../core/testing/setupTestBed';
import { CoreModule } from '../../../core/core.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ProcessFiltersComponent', () => {

    let filterList: ProcessFiltersComponent;
    let fixture: ComponentFixture<ProcessFiltersComponent>;
    let processFilterService: ProcessFilterService;
    let appsProcessService: AppsProcessService;
    let fakeGlobalFilterPromise;
    let mockErrorFilterPromise;

    setupTestBed({
        imports: [
            NoopAnimationsModule,
            CoreModule.forRoot()
        ],
        declarations: [ProcessFiltersComponent],
        providers: [AppsProcessService, ProcessFilterService],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProcessFiltersComponent);
        filterList = fixture.componentInstance;

        fakeGlobalFilterPromise = Promise.resolve([
            new FilterProcessRepresentationModel({
                id: 10,
                name: 'FakeInvolvedTasks',
                filter: { state: 'open', assignment: 'fake-involved' }
            }),
            new FilterProcessRepresentationModel({
                id: 20,
                name: 'FakeMyTasks',
                filter: { state: 'open', assignment: 'fake-assignee' }
            }),
            new FilterProcessRepresentationModel({
                id: 30,
                name: 'Running',
                filter: { state: 'open', assignment: 'fake-running' }
            })
        ]);

        mockErrorFilterPromise = Promise.reject({
            error: 'wrong request'
        });

        processFilterService = new ProcessFilterService(null);
        appsProcessService = new AppsProcessService(null, null);
        filterList = new ProcessFiltersComponent(processFilterService, appsProcessService);
    });

    afterEach(() => {
        fixture.destroy();
    });

    fit('should return the filter task list', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));
        const appId = '1';
        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appId': change });

        filterList.success.subscribe((res) => {
            expect(res).toBeDefined();
            expect(filterList.filters).toBeDefined();
            expect(filterList.filters.length).toEqual(3);
            expect(filterList.filters[0].name).toEqual('FakeInvolvedTasks');
            expect(filterList.filters[1].name).toEqual('FakeMyTasks');
            expect(filterList.filters[2].name).toEqual('Running');
            done();
        });

        filterList.ngOnInit();
    });

    fit('should select the Running process filter', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));
        const appId = '1';
        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appId': change });

        expect(filterList.currentFilter).toBeUndefined();

        filterList.success.subscribe((res) => {
            filterList.selectRunningFilter();
            expect(filterList.currentFilter.name).toEqual('Running');
            done();
        });

        filterList.ngOnInit();
    });

    fit('should return the filter task list, filtered By Name', (done) => {
        spyOn(appsProcessService, 'getDeployedApplicationsByName').and.returnValue(Observable.fromPromise(Promise.resolve({ id: 1 })));
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));

        let change = new SimpleChange(null, 'test', true);
        filterList.ngOnChanges({ 'appName': change });

        filterList.success.subscribe((res) => {
            let deployApp: any = appsProcessService.getDeployedApplicationsByName;
            expect(deployApp.calls.count()).toEqual(1);
            expect(res).toBeDefined();
            done();
        });

        filterList.ngOnInit();
    });

    fit('should emit an error with a bad response', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(mockErrorFilterPromise));

        const appId = '1';
        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appId': change });

        filterList.error.subscribe((err) => {
            expect(err).toBeDefined();
            done();
        });

        filterList.ngOnInit();
    });

    fit('should emit an error with a bad response', (done) => {
        spyOn(appsProcessService, 'getDeployedApplicationsByName').and.returnValue(Observable.fromPromise(mockErrorFilterPromise));

        const appId = 'fake-app';
        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appName': change });

        filterList.error.subscribe((err) => {
            expect(err).toBeDefined();
            done();
        });

        filterList.ngOnInit();
    });

    fit('should emit an event when a filter is selected', (done) => {
        let currentFilter = new FilterProcessRepresentationModel({
            id: 10,
            name: 'FakeInvolvedTasks',
            filter: { state: 'open', assignment: 'fake-involved' }
        });

        filterList.filterClick.subscribe((filter: FilterProcessRepresentationModel) => {
            expect(filter).toBeDefined();
            expect(filter).toEqual(currentFilter);
            expect(filterList.currentFilter).toEqual(currentFilter);
            done();
        });

        filterList.selectFilter(currentFilter);
    });

    fit('should reload filters by appId on binding changes', () => {
        spyOn(filterList, 'getFiltersByAppId').and.stub();
        const appId = '1';

        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appId': change });

        expect(filterList.getFiltersByAppId).toHaveBeenCalledWith(appId);
    });

    fit('should reload filters by appId null on binding changes', () => {
        spyOn(filterList, 'getFiltersByAppId').and.stub();
        const appId = null;

        let change = new SimpleChange(null, appId, true);
        filterList.ngOnChanges({ 'appId': change });

        expect(filterList.getFiltersByAppId).toHaveBeenCalledWith(appId);
    });

    fit('should reload filters by app name on binding changes', () => {
        spyOn(filterList, 'getFiltersByAppName').and.stub();
        const appName = 'fake-app-name';

        let change = new SimpleChange(null, appName, true);
        filterList.ngOnChanges({ 'appName': change });

        expect(filterList.getFiltersByAppName).toHaveBeenCalledWith(appName);
    });

    fit('should return the current filter after one is selected', () => {
        let filter = new FilterProcessRepresentationModel({
            name: 'FakeMyTasks',
            filter: { state: 'open', assignment: 'fake-assignee' }
        });
        expect(filterList.currentFilter).toBeUndefined();
        filterList.selectFilter(filter);
        expect(filterList.getCurrentFilter()).toBe(filter);
    });

    fit('should select the filter passed as input by id', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));

        filterList.filterParam = new FilterProcessRepresentationModel({ id: 20 });

        const appId = 1;
        let change = new SimpleChange(null, appId, true);

        filterList.ngOnChanges({ 'appId': change });

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(filterList.filters).toBeDefined();
            expect(filterList.filters.length).toEqual(3);
            expect(filterList.currentFilter).toBeDefined();
            expect(filterList.currentFilter.name).toEqual('FakeMyTasks');
            done();
        });
    });

    fit('should select the filter passed as input by name', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));

        filterList.filterParam = new FilterProcessRepresentationModel({ name: 'FakeMyTasks' });

        const appId = 1;
        let change = new SimpleChange(null, appId, true);

        filterList.ngOnChanges({ 'appId': change });

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(filterList.filters).toBeDefined();
            expect(filterList.filters.length).toEqual(3);
            expect(filterList.currentFilter).toBeDefined();
            expect(filterList.currentFilter.name).toEqual('FakeMyTasks');
            done();
        });
    });

    fit('should select first filter if filterParam is empty', (done) => {
        spyOn(processFilterService, 'getProcessFilters').and.returnValue(Observable.fromPromise(fakeGlobalFilterPromise));

        filterList.filterParam = new FilterProcessRepresentationModel({});

        const appId = 1;
        let change = new SimpleChange(null, appId, true);

        filterList.ngOnChanges({ 'appId': change });

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(filterList.filters).toBeDefined();
            expect(filterList.filters.length).toEqual(3);
            expect(filterList.currentFilter).toBeDefined();
            expect(filterList.currentFilter.name).toEqual('FakeInvolvedTasks');
            done();
        });
    });
});
