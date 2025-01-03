/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import expect from '@kbn/expect';
import { VisualizeConstants } from '@kbn/visualizations-plugin/common/constants';
import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const retry = getService('retry');
  const { dashboard, header, visualize } = getPageObjects(['dashboard', 'header', 'visualize']);
  const browser = getService('browser');
  const kibanaServer = getService('kibanaServer');
  const dashboardAddPanel = getService('dashboardAddPanel');

  describe('create and add embeddables', () => {
    before(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
      await kibanaServer.importExport.load(
        'test/functional/fixtures/kbn_archiver/dashboard/current/kibana'
      );
      await kibanaServer.uiSettings.replace({
        defaultIndex: '0bf35f60-3dc9-11e8-8660-4d65aa086b3c',
      });
    });

    after(async () => {
      await kibanaServer.savedObjects.cleanStandardList();
    });

    it('ensure toolbar popover closes on add', async () => {
      await dashboard.navigateToApp();
      await dashboard.clickNewDashboard();
      await dashboard.switchToEditMode();
      await dashboardAddPanel.clickEditorMenuButton();
      await dashboardAddPanel.clickAddNewPanelFromUIActionLink('Monitors stats');
      await dashboardAddPanel.expectEditorMenuClosed();
    });

    describe('add new visualization link', () => {
      before(async () => {
        await dashboard.navigateToApp();
        await dashboard.preserveCrossAppState();
        await dashboard.loadSavedDashboard('few panels');
      });

      it('adds new visualization via the top nav link', async () => {
        const originalPanelCount = await dashboard.getPanelCount();
        await dashboard.switchToEditMode();
        await dashboardAddPanel.clickEditorMenuButton();
        await dashboardAddPanel.clickAggBasedVisualizations();
        await visualize.clickAreaChart();
        await visualize.clickNewSearch();
        await visualize.saveVisualizationExpectSuccess('visualization from top nav add new panel', {
          redirectToOrigin: true,
        });
        await retry.try(async () => {
          const panelCount = await dashboard.getPanelCount();
          expect(panelCount).to.eql(originalPanelCount + 1);
        });
        await dashboard.waitForRenderComplete();
      });

      it('adds a new visualization', async () => {
        const originalPanelCount = await dashboard.getPanelCount();
        await dashboardAddPanel.clickEditorMenuButton();
        await dashboardAddPanel.clickAggBasedVisualizations();
        await visualize.clickAreaChart();
        await visualize.clickNewSearch();
        await visualize.saveVisualizationExpectSuccess('visualization from add new link', {
          redirectToOrigin: true,
        });

        await retry.try(async () => {
          const panelCount = await dashboard.getPanelCount();
          expect(panelCount).to.eql(originalPanelCount + 1);
        });
        await dashboard.waitForRenderComplete();
      });

      it('adds a new timelion visualization', async () => {
        // adding this case, as the timelion agg-based viz doesn't need the `clickNewSearch()` step
        const originalPanelCount = await dashboard.getPanelCount();
        await dashboardAddPanel.clickEditorMenuButton();
        await dashboardAddPanel.clickAggBasedVisualizations();
        await visualize.clickTimelion();
        await visualize.saveVisualizationExpectSuccess('timelion visualization from add new link', {
          redirectToOrigin: true,
        });

        await retry.try(async () => {
          const panelCount = await dashboard.getPanelCount();
          expect(panelCount).to.eql(originalPanelCount + 1);
        });
        await dashboard.waitForRenderComplete();
      });

      it('saves the listing page instead of the visualization to the app link', async () => {
        await header.clickVisualize(true);
        const currentUrl = await browser.getCurrentUrl();
        expect(currentUrl).not.to.contain(VisualizeConstants.EDIT_PATH);
      });

      after(async () => {
        await header.clickDashboard();
      });
    });
  });
}
