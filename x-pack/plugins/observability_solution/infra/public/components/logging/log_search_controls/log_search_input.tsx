/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFieldSearch } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import styled from '@emotion/styled';
import classNames from 'classnames';
import * as React from 'react';

interface LogSearchInputProps {
  className?: string;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onClear: () => void;
}

interface LogSearchInputState {
  query: string;
}

export const LogSearchInput = class extends React.PureComponent<
  LogSearchInputProps,
  LogSearchInputState
> {
  public static displayName = 'LogSearchInput';
  public readonly state = {
    query: '',
  };

  public handleSubmit: React.FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();

    const { query } = this.state;

    if (query === '') {
      this.props.onClear();
    } else {
      this.props.onSearch(this.state.query);
    }
  };

  public handleChangeQuery: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    this.setState({
      query: evt.target.value,
    });
  };

  public render() {
    const { className, isLoading } = this.props;
    const { query } = this.state;

    const classes = classNames('loggingSearchInput', className);

    return (
      <form onSubmit={this.handleSubmit}>
        <PlainSearchField
          aria-label={i18n.translate('xpack.infra.logs.search.searchInLogsAriaLabel', {
            defaultMessage: 'search',
          })}
          className={classes}
          fullWidth
          isLoading={isLoading}
          onChange={this.handleChangeQuery}
          placeholder={i18n.translate('xpack.infra.logs.search.searchInLogsPlaceholder', {
            defaultMessage: 'Search',
          })}
          value={query}
        />
      </form>
    );
  }
};

const PlainSearchField = styled(EuiFieldSearch)`
  background: transparent;
  box-shadow: none;

  &:focus {
    box-shadow: inset 0 -2px 0 0 ${(props) => props.theme.euiTheme.colors.primary};
  }
`;
