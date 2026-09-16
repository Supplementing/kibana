/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import type { CoreStart } from '@kbn/core/public';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import type { KibanaAssetReference, EsAssetReference } from '@kbn/fleet-plugin/common';
import { useInstalledContent } from './installed_content/use_installed_content';

interface TakeMeToMyDataModalProps {
  installedKibana: KibanaAssetReference[];
  installedEs: EsAssetReference[];
  /** Called when the user closes or dismisses the modal (Done button or ✕). */
  onClose: () => void;
}

/**
 * Modal shown when the user clicks "Take me to my data" on the Detect & Review step.
 * Presents a filterable list of all installed dashboards so the user can navigate
 * directly to the data relevant to their deployment.
 */
export function TakeMeToMyDataModal({
  installedKibana,
  installedEs,
  onClose,
}: TakeMeToMyDataModalProps) {
  const { services } = useKibana<CoreStart>();
  const [search, setSearch] = useState('');

  const { dashboards } = useInstalledContent({ installedKibana, installedEs });

  const q = search.toLowerCase();
  const filteredDashboards = dashboards.filter((d) => d.title.toLowerCase().includes(q));

  return (
    <EuiModal
      onClose={onClose}
      aria-labelledby="takeMeToMyDataModalTitle"
      data-test-subj="takeMeToMyDataModal"
      style={{ minWidth: 520 }}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="takeMeToMyDataModalTitle">
          <FormattedMessage
            id="xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.title"
            defaultMessage="Your AWS data is ready"
          />
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiText size="s" color="subdued">
          <p>
            <FormattedMessage
              id="xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.description"
              defaultMessage="Select a dashboard below to start exploring your data. Dashboards open in a new tab."
            />
          </p>
        </EuiText>
        <EuiSpacer size="m" />

        <EuiFieldSearch
          placeholder={i18n.translate(
            'xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.searchPlaceholder',
            { defaultMessage: 'Search dashboards' }
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          data-test-subj="takeMeToMyDataModal-search"
        />
        <EuiSpacer size="m" />

        {filteredDashboards.length === 0 ? (
          <EuiEmptyPrompt
            icon={<EuiIcon type="dashboardApp" size="xl" color="subdued" aria-hidden={true} />}
            title={
              <h3>
                {search
                  ? i18n.translate(
                      'xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.noResults',
                      { defaultMessage: 'No dashboards match your search' }
                    )
                  : i18n.translate(
                      'xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.noDashboards',
                      { defaultMessage: 'No dashboards installed' }
                    )}
              </h3>
            }
            data-test-subj="takeMeToMyDataModal-emptyState"
          />
        ) : (
          filteredDashboards.map((dashboard) => {
            const href = dashboard.appLink
              ? services.http.basePath.prepend(dashboard.appLink)
              : undefined;

            return (
              <React.Fragment key={dashboard.id}>
                <EuiPanel
                  paddingSize="s"
                  hasBorder
                  hasShadow={false}
                  data-test-subj={`takeMeToMyDataModal-dashboard-${dashboard.id}`}
                >
                  <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                    <EuiFlexItem grow={false}>
                      <EuiIcon type="dashboardApp" size="m" color="subdued" aria-hidden />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      {href ? (
                        <EuiLink
                          href={href}
                          target="_blank"
                          data-test-subj={`takeMeToMyDataModal-dashboardLink-${dashboard.id}`}
                        >
                          {dashboard.title}
                        </EuiLink>
                      ) : (
                        <EuiText size="s">{dashboard.title}</EuiText>
                      )}
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>
                <EuiSpacer size="xs" />
              </React.Fragment>
            );
          })
        )}
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton fill onClick={onClose} data-test-subj="takeMeToMyDataModal-doneButton">
          <FormattedMessage
            id="xpack.ingestHub.detectAndReviewStep.takeMeToMyDataModal.doneButton"
            defaultMessage="Done"
          />
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
