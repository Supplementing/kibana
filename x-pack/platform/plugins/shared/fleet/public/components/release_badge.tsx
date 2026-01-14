/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiBadge, EuiToolTip } from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';

import type { IntegrationCardReleaseLabel } from '../../common/types';

const RELEASE_BADGE_LABEL: { [key in Exclude<IntegrationCardReleaseLabel, 'ga'>]: string } = {
  beta: i18n.translate('xpack.fleet.epm.releaseBadge.betaLabel', {
    defaultMessage: 'Beta',
  }),
  preview: i18n.translate('xpack.fleet.epm.releaseBadge.technicalPreviewLabel', {
    defaultMessage: 'Technical preview',
  }),
  rc: i18n.translate('xpack.fleet.epm.releaseBadge.releaseCandidateLabel', {
    defaultMessage: 'Release Candidate',
  }),
};

const RELEASE_BADGE_DESCRIPTION: { [key in Exclude<IntegrationCardReleaseLabel, 'ga'>]: string } = {
  beta: i18n.translate('xpack.fleet.epm.releaseBadge.betaDescription', {
    defaultMessage: 'This integration is not recommended for use in production environments.',
  }),
  preview: i18n.translate('xpack.fleet.epm.releaseBadge.technicalPreviewDescription', {
    defaultMessage:
      'This functionality is in technical preview and may be changed or removed completely in a future release. Elastic will work to fix any issues, but features in technical preview are not subject to the support SLA of official GA features.',
  }),
  rc: i18n.translate('xpack.fleet.epm.releaseBadge.releaseCandidateDescription', {
    defaultMessage: 'This integration is not recommended for use in production environments.',
  }),
};

// Colors for lifecycle badges - background and contrasting text colors
const RELEASE_BADGE_STYLES: {
  [key in Exclude<IntegrationCardReleaseLabel, 'ga'>]: { background: string; text: string };
} = {
  beta: { background: '#F5A700', text: '#FFFFFF' }, // Yellow/amber with white text
  preview: { background: '#6092C0', text: '#FFFFFF' }, // Blue with white text
  rc: { background: '#54B399', text: '#FFFFFF' }, // Green with white text
};

export const HeaderReleaseBadge: React.FC<{ release: IntegrationCardReleaseLabel }> = ({
  release,
}) => {
  if (release === 'ga') return null;

  const releaseLabel = RELEASE_BADGE_LABEL[release];
  return (
    <EuiToolTip position="bottom" content={RELEASE_BADGE_DESCRIPTION[release]} title={releaseLabel}>
      <EuiBadge tabIndex={0}>{releaseLabel}</EuiBadge>
    </EuiToolTip>
  );
};

// Pill-shaped badge styles
const pillBadgeStyles = css`
  border-radius: 12px;
  padding: 0 8px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
`;

export const InlineReleaseBadge: React.FC<{
  release: IntegrationCardReleaseLabel;
  colored?: boolean;
}> = ({ release, colored = true }) => {
  if (release === 'ga') return null;

  const releaseLabel = RELEASE_BADGE_LABEL[release];
  const styles = RELEASE_BADGE_STYLES[release];

  return (
    <EuiToolTip
      display="inlineBlock"
      content={RELEASE_BADGE_DESCRIPTION[release]}
      title={releaseLabel}
    >
      <EuiBadge
        color={colored ? styles.background : 'hollow'}
        css={
          colored
            ? css`
                ${pillBadgeStyles}
                color: ${styles.text} !important;
              `
            : pillBadgeStyles
        }
        tabIndex={0}
      >
        {releaseLabel}
      </EuiBadge>
    </EuiToolTip>
  );
};
