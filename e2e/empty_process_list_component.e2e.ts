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

import TestConfig = require('./test.config');
import resources = require('./util/resources');
import LoginPage = require('./pages/adf/loginPage');
import NavigationBarPage = require('./pages/adf/navigationBarPage');
import ProcessServicesPage = require('./pages/adf/process_services/processServicesPage');
import ProcessFiltersPage = require('./pages/adf/process_services/processFiltersPage');
import ProcessDetailsPage = require('./pages/adf/process_services/processDetailsPage');
import ProcessListPage = require('./pages/adf/process_services/processListPage');

import AlfrescoApi = require('alfresco-js-api-node');
import { AppsActions } from './actions/APS/apps.actions';
import { UsersActions } from './actions/users.actions';

describe('Empty Process List Test', () => {

    let loginPage = new LoginPage();
    let navigationBarPage = new NavigationBarPage();
    let processServicesPage = new ProcessServicesPage();
    let processFiltersPage = new ProcessFiltersPage();
    let processDetailsPage = new ProcessDetailsPage();
    let processListPage = new ProcessListPage();

    let appA = resources.Files.APP_WITH_PROCESSES;
    let appB = resources.Files.SIMPLE_APP_WITH_USER_FORM;

    let user;

    beforeAll(async (done) => {
        let apps = new AppsActions();
        let users = new UsersActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        user = await users.createTenantAndUser(this.alfrescoJsApi);

        await this.alfrescoJsApi.login(user.email, user.password);

        await apps.importPublishDeployApp(this.alfrescoJsApi, appA.file_location);
        await apps.importPublishDeployApp(this.alfrescoJsApi, appB.file_location);

        done();
    });

    it('[C260494] Should add process to list when a process is created', () => {
        loginPage.loginToProcessServicesUsingUserModel(user);
        navigationBarPage.clickProcessServicesButton();
        processServicesPage.checkApsContainer();
        processServicesPage.goToApp(appA.title).clickProcessButton();
        expect(processListPage.checkProcessListTitleIsDisplayed()).toEqual('No Processes Found');
        expect(processListPage.checkProcessDetailsMessagee()).toEqual('No process details found');

        processFiltersPage.clickCreateProcessButton();
        processFiltersPage.clickNewProcessDropdown();
        processListPage.openProcessDropdown();
        processListPage.selectProcessDropdown(1);
        processListPage.startProcess();
        expect(processFiltersPage.numberOfProcessRows()).toEqual(1);

        processDetailsPage.checkProcessDetailsCard();
        navigationBarPage.clickProcessServicesButton();
        processServicesPage.checkApsContainer();
        processServicesPage.goToApp(appB.title).clickProcessButton();
        expect(processListPage.checkProcessListTitleIsDisplayed()).toEqual('No Processes Found');
        expect(processListPage.checkProcessDetailsMessagee()).toEqual('No process details found');

        processFiltersPage.clickCreateProcessButton();
        processFiltersPage.clickNewProcessDropdown();
        processListPage.openProcessDropdown();
        processListPage.selectProcessDropdown(0);
        processListPage.startProcess();
        expect(processFiltersPage.numberOfProcessRows()).toEqual(1);
        processDetailsPage.checkProcessDetailsCard();
    });

});
