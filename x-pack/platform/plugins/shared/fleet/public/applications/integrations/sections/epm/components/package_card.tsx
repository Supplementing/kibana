/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiToolTip,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';

import { TrackApplicationView } from '@kbn/usage-collection-plugin/public';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

import {
  DEFERRED_ASSETS_WARNING_LABEL,
  DEFERRED_ASSETS_WARNING_MSG,
} from '../screens/detail/assets/deferred_assets_warning';

import { CardIcon } from '../../../../../components/package_icon';
import type { IntegrationCardItem } from '../screens/home';

import { InlineReleaseBadge } from '../../../components';
import { useStartServices } from '../../../hooks';
import { INTEGRATIONS_BASE_PATH, INTEGRATIONS_PLUGIN_ID } from '../../../constants';

import { InstallationStatus, getLineClampStyles } from './installation_status';

export type PackageCardProps = IntegrationCardItem;

const SIGNAL_BADGE_LABELS: Record<string, string> = {
  logs: i18n.translate('xpack.fleet.packageCard.signalBadge.logs', {
    defaultMessage: 'Logs',
  }),
  metrics: i18n.translate('xpack.fleet.packageCard.signalBadge.metrics', {
    defaultMessage: 'Metrics',
  }),
  traces: i18n.translate('xpack.fleet.packageCard.signalBadge.traces', {
    defaultMessage: 'Traces',
  }),
  synthetics: i18n.translate('xpack.fleet.packageCard.signalBadge.synthetics', {
    defaultMessage: 'Synthetics',
  }),
  profiling: i18n.translate('xpack.fleet.packageCard.signalBadge.profiling', {
    defaultMessage: 'Profiling',
  }),
};

const DEPRECATED_LABEL = i18n.translate('xpack.fleet.packageCard.deprecatedLabel', {
  defaultMessage: 'Deprecated',
});

const DEPRECATED_TOOLTIP = i18n.translate('xpack.fleet.packageCard.deprecatedTooltip', {
  defaultMessage:
    'This integration is deprecated and may be removed in a future release. Consider using an alternative.',
});

export function PackageCard({
  description,
  name,
  title,
  version,
  type,
  icons,
  integration,
  url,
  release,
  id,
  fromIntegrations,
  isReauthorizationRequired,
  isUnverified,
  isUpdateAvailable,
  isDeprecated,
  showLabels = true,
  showInstallationStatus,
  showCompressedInstallationStatus,
  extraLabelsBadges,
  isQuickstart = false,
  installStatus,
  onCardClick: onClickProp = undefined,
  isCollectionCard = false,
  titleLineClamp,
  titleBadge,
  titleSize = 'xs',
  descriptionLineClamp = 2,
  maxCardHeight,
  minCardHeight,
  showDescription = true,
  showReleaseBadge = true,
  hasDataStreams,
  signalTypes,
}: PackageCardProps) {
  const theme = useEuiTheme();

  // Lifecycle badges (top right): beta, deprecated
  const lifecycleBadges: React.ReactNode[] = [];

  if (release && release !== 'ga' && showReleaseBadge) {
    lifecycleBadges.push(
      <EuiFlexItem grow={false} key="release-badge">
        <InlineReleaseBadge release={release} />
      </EuiFlexItem>
    );
  }

  if (isDeprecated) {
    lifecycleBadges.push(
      <EuiFlexItem grow={false} key="deprecated-badge">
        <EuiToolTip display="inlineBlock" content={DEPRECATED_TOOLTIP} title={DEPRECATED_LABEL}>
          <EuiBadge color="#BD271E" tabIndex={0}>
            {DEPRECATED_LABEL}
          </EuiBadge>
        </EuiToolTip>
      </EuiFlexItem>
    );
  }

  // Signal badges (bottom right): logs, metrics, etc.
  const signalBadges: React.ReactNode[] = [];
  if (signalTypes && signalTypes.length > 0) {
    signalTypes.forEach((signalType) => {
      signalBadges.push(
        <EuiFlexItem grow={false} key={`signal-${signalType}`}>
          <EuiBadge color="hollow">{SIGNAL_BADGE_LABELS[signalType] || signalType}</EuiBadge>
        </EuiFlexItem>
      );
    });
  }

  // Other status badges (kept for backward compatibility)
  let verifiedBadge: React.ReactNode | null = null;
  if (isUnverified && showLabels) {
    verifiedBadge = (
      <EuiFlexItem grow={false}>
        <EuiBadge color="warning">
          <FormattedMessage
            id="xpack.fleet.packageCard.unverifiedLabel"
            defaultMessage="Unverified"
          />
        </EuiBadge>
      </EuiFlexItem>
    );
  }

  let hasDeferredInstallationsBadge: React.ReactNode | null = null;
  if (isReauthorizationRequired && showLabels) {
    hasDeferredInstallationsBadge = (
      <EuiFlexItem grow={false}>
        <EuiToolTip
          display="inlineBlock"
          content={DEFERRED_ASSETS_WARNING_MSG}
          title={DEFERRED_ASSETS_WARNING_LABEL}
        >
          <EuiBadge color="warning" tabIndex={0}>
            {DEFERRED_ASSETS_WARNING_LABEL}
          </EuiBadge>
        </EuiToolTip>
      </EuiFlexItem>
    );
  }

  let updateAvailableBadge: React.ReactNode | null = null;
  if (isUpdateAvailable && showLabels) {
    updateAvailableBadge = (
      <EuiFlexItem grow={false}>
        <EuiBadge color="hollow" iconType="sortUp">
          <FormattedMessage
            id="xpack.fleet.packageCard.updateAvailableLabel"
            defaultMessage="Update available"
          />
        </EuiBadge>
      </EuiFlexItem>
    );
  }

  let collectionButton: React.ReactNode | null = null;
  if (isCollectionCard) {
    collectionButton = (
      <EuiFlexItem>
        <EuiButton
          color="text"
          data-test-subj="xpack.fleet.packageCard.collectionButton"
          iconType="package"
        >
          <FormattedMessage
            id="xpack.fleet.packageCard.collectionButton.copy"
            defaultMessage="View collection"
          />
        </EuiButton>
      </EuiFlexItem>
    );
  }

  let contentBadge: React.ReactNode | null = null;
  if (type === 'content') {
    contentBadge = (
      <EuiFlexItem grow={false}>
        <EuiBadge color="hollow">
          <FormattedMessage
            id="xpack.fleet.packageCard.contentPackageLabel"
            defaultMessage="Content only"
          />
        </EuiBadge>
      </EuiFlexItem>
    );
  }

  const { application } = useStartServices();

  const onCardClick = () => {
    if (url.startsWith(INTEGRATIONS_BASE_PATH)) {
      application.navigateToApp(INTEGRATIONS_PLUGIN_ID, {
        path: url.slice(INTEGRATIONS_BASE_PATH.length),
        state: { fromIntegrations },
      });
    } else if (url.startsWith('http') || url.startsWith('https')) {
      window.open(url, '_blank');
    } else {
      application.navigateToUrl(url);
    }
  };

  const testid = `integration-card:${id}`;

  // Check if we have any badges to show
  const hasSignalBadges = signalBadges.length > 0;

  return (
    <TrackApplicationView viewId={testid}>
      <EuiCard
        css={css`
          position: relative;
          min-height: ${minCardHeight ? `${minCardHeight}px` : '124px'};
          max-height: ${maxCardHeight ? `${maxCardHeight}px` : null};
          overflow: ${maxCardHeight ? 'hidden' : null};
          border-color: ${isQuickstart ? theme.euiTheme.colors.accent : null};

          /* Override default card content styling */
          [class*='euiCard__content'] {
            display: flex;
            flex-direction: column;
            block-size: 100%;
            overflow: hidden;
          }

          /* Hide the default description - we'll render our own */
          [class*='euiCard__description'] {
            display: none;
          }

          [class*='euiCard__titleButton'] {
            width: 100%;
          }
        `}
        data-test-subj={testid}
        betaBadgeProps={quickstartBadge(isQuickstart)}
        layout="horizontal"
        title={
          <CardTitle title={title} titleBadge={titleBadge} lifecycleBadges={lifecycleBadges} />
        }
        titleSize={titleSize}
        description=""
        hasBorder
        icon={
          <CardIcon
            icons={icons}
            packageName={name}
            integrationName={integration}
            version={version}
            size={showDescription ? 'xl' : 'xxl'}
          />
        }
        onClick={onClickProp ?? onCardClick}
      >
        <EuiFlexGroup
          direction="column"
          gutterSize="s"
          css={css`
            height: 100%;
          `}
        >
          {/* Description */}
          <EuiFlexItem grow>
            {showDescription && description && (
              <EuiText
                size="s"
                color="subdued"
                css={css`
                  ${getLineClampStyles(descriptionLineClamp)}
                `}
              >
                {description}
              </EuiText>
            )}
          </EuiFlexItem>

          {/* Bottom row: Status badges on left, signal badges on right */}
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween" alignItems="center">
              {/* Status badges (bottom left) */}
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="xs" wrap>
                  {showLabels && extraLabelsBadges ? extraLabelsBadges : null}
                  {verifiedBadge}
                  {updateAvailableBadge}
                  {contentBadge}
                  {hasDeferredInstallationsBadge}
                  {collectionButton}
                </EuiFlexGroup>
              </EuiFlexItem>

              {/* Signal badges (bottom right) */}
              {hasSignalBadges && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="xs" wrap={false}>
                    {signalBadges}
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <InstallationStatus
          installStatus={installStatus}
          showInstallationStatus={showInstallationStatus}
          compressed={showCompressedInstallationStatus}
          hasDataStreams={hasDataStreams}
        />
      </EuiCard>
    </TrackApplicationView>
  );
}

interface CardTitleProps extends Pick<IntegrationCardItem, 'title' | 'titleBadge'> {
  lifecycleBadges?: React.ReactNode[];
}

const CardTitle = React.memo<CardTitleProps>(({ title, titleBadge, lifecycleBadges }) => {
  const hasLifecycleBadges = lifecycleBadges && lifecycleBadges.length > 0;

  if (!titleBadge && !hasLifecycleBadges) {
    return title;
  }

  return (
    <EuiFlexGroup
      direction="row"
      alignItems="center"
      justifyContent="spaceBetween"
      gutterSize="s"
      responsive={false}
      wrap={false}
    >
      <EuiFlexItem grow={false} style={{ minWidth: 0 }}>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {title}
        </span>
      </EuiFlexItem>
      {(hasLifecycleBadges || titleBadge) && (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="xs" wrap={false} alignItems="center">
            {lifecycleBadges}
            {titleBadge && <EuiFlexItem grow={false}>{titleBadge}</EuiFlexItem>}
          </EuiFlexGroup>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
});

function quickstartBadge(isQuickstart: boolean): { label: string; color: 'accent' } | undefined {
  return isQuickstart
    ? {
        label: i18n.translate('xpack.fleet.packageCard.quickstartBadge.label', {
          defaultMessage: 'Quickstart',
        }),
        color: 'accent',
      }
    : undefined;
}
