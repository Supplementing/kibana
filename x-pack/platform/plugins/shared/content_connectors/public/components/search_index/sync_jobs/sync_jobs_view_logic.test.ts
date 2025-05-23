/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import moment from 'moment';

import { ConnectorSyncJob, SyncJobType, SyncStatus, TriggerMethod } from '@kbn/search-connectors';
import { nextTick } from '@kbn/test-jest-helpers';
import { LogicMounter, mockFlashMessageHelpers } from '../../../__mocks__';

import { FetchSyncJobsApiLogic } from '../../../api/connector/fetch_sync_jobs_api_logic';

import { IndexViewLogic } from '../index_view_logic';

import { SyncJobView, SyncJobsViewLogic } from './sync_jobs_view_logic';
import { HttpError, Status } from '../../../../common/types/api';
import { httpServiceMock } from '@kbn/core-http-browser-mocks';

// We can't test fetchTimeOutId because this will get set whenever the logic is created
// And the timeoutId is non-deterministic. We use expect.object.containing throughout this test file
const DEFAULT_VALUES = {
  cancelSyncJobLoading: false,
  cancelSyncJobStatus: Status.IDLE,
  connectorId: null,
  selectedSyncJobCategory: 'content',
  syncJobToCancel: null,
  syncJobs: [],
  syncJobsData: undefined,
  syncJobsLoading: true,
  syncJobsPagination: {
    pageIndex: 0,
    pageSize: 10,
    totalItemCount: 0,
  },
  syncJobsStatus: Status.IDLE,
  syncTriggeredLocally: false,
};
const http = httpServiceMock.createSetupContract();

describe('SyncJobsViewLogic', () => {
  const { mount: indexViewLogicMount } = new LogicMounter(IndexViewLogic);
  const { mount: fetchSyncJobsMount } = new LogicMounter(FetchSyncJobsApiLogic);
  const { mount } = new LogicMounter(SyncJobsViewLogic);
  let resultSyncJobsViewLogic = SyncJobsViewLogic;

  beforeEach(() => {
    indexViewLogicMount({}, { http });
    fetchSyncJobsMount({}, { http });
    resultSyncJobsViewLogic = mount({}, { http });
  });

  it('has expected default values', () => {
    expect(resultSyncJobsViewLogic.values).toEqual(DEFAULT_VALUES);
  });

  describe('actions', () => {
    describe('CachedFetchIndexApiWrapperLogic.apiSuccess', () => {
      const syncJob: ConnectorSyncJob = {
        cancelation_requested_at: null,
        canceled_at: null,
        completed_at: '2022-09-05T15:59:39.816+00:00',
        connector: {
          configuration: {},
          filtering: null,
          id: 'we2284IBjobuR2-lAuXh',
          index_name: 'indexName',
          language: 'something',
          pipeline: null,
          service_type: '',
        },
        created_at: '2022-09-05T14:59:39.816+00:00',
        deleted_document_count: 20,
        error: null,
        id: 'id',
        indexed_document_count: 50,
        indexed_document_volume: 40,
        job_type: SyncJobType.FULL,
        last_seen: '2022-09-05T15:59:39.816+00:00',
        metadata: {},
        started_at: '2022-09-05T14:59:39.816+00:00',
        status: SyncStatus.COMPLETED,
        total_document_count: null,
        trigger_method: TriggerMethod.ON_DEMAND,
        worker_hostname: 'hostname_fake',
      };
      const syncJobView: SyncJobView = {
        ...syncJob,
        duration: moment.duration(1, 'hour'),
        lastSync: syncJob.completed_at ?? '',
        status: SyncStatus.COMPLETED,
      };
      it('should update values', async () => {
        FetchSyncJobsApiLogic.actions.apiSuccess({
          _meta: {
            page: {
              from: 40,
              has_more_hits_than_total: false,
              size: 20,
              total: 50,
            },
          },
          data: [syncJob],
        });
        await nextTick();
        expect(resultSyncJobsViewLogic.values).toEqual({
          ...DEFAULT_VALUES,
          syncJobs: [syncJobView],
          syncJobsData: {
            _meta: {
              page: {
                from: 40,
                has_more_hits_than_total: false,
                size: 20,
                total: 50,
              },
            },
            data: [syncJob],
          },
          syncJobsLoading: false,
          syncJobsPagination: {
            pageIndex: 2,
            pageSize: 20,
            totalItemCount: 50,
          },
          syncJobsStatus: Status.SUCCESS,
        });
      });
      it('should update values for incomplete job', async () => {
        FetchSyncJobsApiLogic.actions.apiSuccess({
          _meta: {
            page: {
              from: 40,
              has_more_hits_than_total: false,
              size: 20,
              total: 50,
            },
          },
          data: [
            {
              ...syncJob,
              completed_at: null,
              deleted_document_count: 0,
              status: SyncStatus.IN_PROGRESS,
            },
          ],
        });
        await nextTick();
        expect(resultSyncJobsViewLogic.values).toEqual({
          ...DEFAULT_VALUES,
          syncJobs: [
            {
              ...syncJob,
              completed_at: null,
              deleted_document_count: 0,
              duration: expect.anything(),
              lastSync: null,
              status: SyncStatus.IN_PROGRESS,
            },
          ],
          syncJobsData: {
            _meta: {
              page: {
                from: 40,
                has_more_hits_than_total: false,
                size: 20,
                total: 50,
              },
            },
            data: [
              {
                ...syncJob,
                completed_at: null,
                deleted_document_count: 0,
                status: SyncStatus.IN_PROGRESS,
              },
            ],
          },
          syncJobsLoading: false,
          syncJobsPagination: {
            pageIndex: 2,
            pageSize: 20,
            totalItemCount: 50,
          },
          syncJobsStatus: Status.SUCCESS,
        });
      });
    });
  });

  describe('listeners', () => {
    it('calls clearFlashMessages on fetchSyncJobs', async () => {
      resultSyncJobsViewLogic.actions.fetchSyncJobs({ connectorId: 'connectorId' });
      await nextTick();
      expect(mockFlashMessageHelpers.clearFlashMessages).toHaveBeenCalledTimes(1);
    });

    it('updates state on apiError', async () => {
      resultSyncJobsViewLogic.actions.fetchSyncJobsError({} as HttpError);
      await nextTick();
      expect(resultSyncJobsViewLogic.values).toEqual({
        ...DEFAULT_VALUES,
        syncJobsLoading: false,
        syncJobsStatus: Status.ERROR,
      });
    });
  });
});
