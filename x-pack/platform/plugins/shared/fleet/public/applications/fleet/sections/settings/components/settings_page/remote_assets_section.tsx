/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiTitle, EuiSpacer, EuiText, EuiLink } from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n-react';
import type { Output } from '../../../../types';

import { RemoteAssetsBreakdown } from '../remote_assets';
export interface RemoteAssetsSectionProps {
  outputs: Output[];
}
export const RemoteAssetsSection: React.FunctionComponent<RemoteAssetsSectionProps> = ({
  outputs,
}) => {
  console.log('the outputs are ', outputs);
  return (
    <>
      <EuiTitle size="s">
        <h4 data-test-subj="remoteHeader">
          <FormattedMessage
            id="xpack.fleet.settings.remoteAssetsSectionTitle"
            defaultMessage="Remote Asset Installation"
          />
        </h4>
      </EuiTitle>

      <EuiText color="subdued" size="m">
        <FormattedMessage
          id="xpack.fleet.settings.fleetProxiesSection.subtitle"
          defaultMessage="Integrations in this Fleet have been installed in the following remote clusters. You may delete from this list. A remote Elasticsearch cluster can be added by editing the output definition."
        />
      </EuiText>
      <EuiSpacer size="m" />
      <RemoteAssetsBreakdown />
    </>
  );
};
