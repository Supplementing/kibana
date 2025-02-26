/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React, { useEffect } from 'react';

export const RemoteAssetsBreakdown: React.FunctionComponent<{}> = () => {
  const deleteIntegration = () => {
    // logic to delete the integration and refresh UI
  };
  // load the integrations from the index\
  useEffect(() => {}, []);

  const columns: Array<EuiBasicTableColumn<any>> = [
    {
      field: 'dateOfBirth',
      name: 'Integration ',
      dataType: 'date',
      render: () => {
        return 'something1';
      },
    },
    {
      width: '68px',
      render: () => {
        return (
          <EuiFlexGroup gutterSize="s" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                color="text"
                iconType="trash"
                onClick={() => deleteIntegration()}
                title={i18n.translate('xpack.fleet.settings.outputSection.deleteButtonTitle', {
                  defaultMessage: 'Delete',
                })}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        );
      },
      name: i18n.translate('xpack.fleet.settings.outputSection.actionsColumnTitle', {
        defaultMessage: 'Actions',
      }),
    },
  ];

  return (
    <>
      <EuiBasicTable
        tableCaption="remote Cluster"
        items={['ye', 'haw']}
        rowHeader="firstName"
        columns={columns}
      />
    </>
  );
};
