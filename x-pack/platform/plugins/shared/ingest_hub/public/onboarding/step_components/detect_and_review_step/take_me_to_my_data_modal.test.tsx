/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@kbn/i18n-react';

jest.mock('./installed_content/use_installed_content', () => ({
  useInstalledContent: jest.fn(),
}));

jest.mock('@kbn/kibana-react-plugin/public', () => ({
  useKibana: () => ({
    services: {
      http: {
        basePath: { prepend: (path: string) => `/base${path}` },
      },
    },
  }),
}));

import { useInstalledContent } from './installed_content/use_installed_content';
import { TakeMeToMyDataModal } from './take_me_to_my_data_modal';

const mockUseInstalledContent = useInstalledContent as jest.Mock;

const DASHBOARDS = [
  { id: 'dash-1', title: 'AWS S3 Overview', appLink: '/app/dashboards#/view/dash-1' },
  { id: 'dash-2', title: 'AWS EC2 Overview', appLink: '/app/dashboards#/view/dash-2' },
  { id: 'dash-3', title: 'AWS RDS Overview', appLink: undefined },
];

function setupMocks(dashboards = DASHBOARDS) {
  mockUseInstalledContent.mockReturnValue({
    dashboards,
    detectionRules: [],
    esAssets: [],
    isLoading: false,
  });
}

function renderModal(onClose = jest.fn()) {
  return render(
    <I18nProvider>
      <TakeMeToMyDataModal installedKibana={[]} installedEs={[]} onClose={onClose} />
    </I18nProvider>
  );
}

describe('TakeMeToMyDataModal', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('header and description', () => {
    it('renders the title and description', () => {
      setupMocks();
      renderModal();
      expect(screen.getByText('Your AWS data is ready')).toBeInTheDocument();
      expect(screen.getByText(/Select a dashboard below/)).toBeInTheDocument();
    });
  });

  describe('dashboard list', () => {
    it('renders all installed dashboards', () => {
      setupMocks();
      renderModal();
      expect(screen.getByTestId('takeMeToMyDataModal-dashboard-dash-1')).toBeInTheDocument();
      expect(screen.getByTestId('takeMeToMyDataModal-dashboard-dash-2')).toBeInTheDocument();
      expect(screen.getByTestId('takeMeToMyDataModal-dashboard-dash-3')).toBeInTheDocument();
    });

    it('renders dashboard titles', () => {
      setupMocks();
      renderModal();
      expect(screen.getByText('AWS S3 Overview')).toBeInTheDocument();
      expect(screen.getByText('AWS EC2 Overview')).toBeInTheDocument();
      expect(screen.getByText('AWS RDS Overview')).toBeInTheDocument();
    });

    it('renders a link with basePath-prepended href when appLink is present', () => {
      setupMocks();
      renderModal();
      const link = screen.getByTestId('takeMeToMyDataModal-dashboardLink-dash-1');
      expect(link).toHaveAttribute('href', '/base/app/dashboards#/view/dash-1');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders plain text (no link) when appLink is absent', () => {
      setupMocks();
      renderModal();
      // dash-3 has no appLink — should not render a link element
      expect(screen.queryByTestId('takeMeToMyDataModal-dashboardLink-dash-3')).not.toBeInTheDocument();
      expect(screen.getByText('AWS RDS Overview')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters dashboards by title (case-insensitive)', () => {
      setupMocks();
      renderModal();
      fireEvent.change(screen.getByTestId('takeMeToMyDataModal-search'), {
        target: { value: 's3' },
      });
      expect(screen.getByTestId('takeMeToMyDataModal-dashboard-dash-1')).toBeInTheDocument();
      expect(screen.queryByTestId('takeMeToMyDataModal-dashboard-dash-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('takeMeToMyDataModal-dashboard-dash-3')).not.toBeInTheDocument();
    });

    it('shows empty state when no dashboards match the search query', () => {
      setupMocks();
      renderModal();
      fireEvent.change(screen.getByTestId('takeMeToMyDataModal-search'), {
        target: { value: 'zzz-no-match' },
      });
      expect(screen.getByTestId('takeMeToMyDataModal-emptyState')).toBeInTheDocument();
      expect(screen.getByText('No dashboards match your search')).toBeInTheDocument();
    });

    it('shows empty state with a different message when there are no dashboards at all', () => {
      setupMocks([]);
      renderModal();
      expect(screen.getByTestId('takeMeToMyDataModal-emptyState')).toBeInTheDocument();
      expect(screen.getByText('No dashboards installed')).toBeInTheDocument();
    });
  });

  describe('Done button', () => {
    it('calls onClose when Done is clicked', () => {
      setupMocks();
      const onClose = jest.fn();
      renderModal(onClose);
      fireEvent.click(screen.getByTestId('takeMeToMyDataModal-doneButton'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('close (✕) button', () => {
    it('calls onClose when the modal X button is clicked', () => {
      setupMocks();
      const onClose = jest.fn();
      renderModal(onClose);
      // EuiModal renders a close button with aria-label "Closes this modal window"
      fireEvent.click(screen.getByLabelText('Closes this modal window'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
