/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ComponentProps } from 'react';
import { AbstractStorybookMock } from '@kbn/shared-ux-storybook-mock';

import { TabbedModal } from '..';

type TabbedModalProps = ComponentProps<typeof TabbedModal>;
type TabbedModalServiceArguments = Record<string, unknown>;

type Arguments = TabbedModalProps & TabbedModalServiceArguments;

/**
 * Storybook parameters provided from the controls addon.
 */
export type Params = Record<keyof Arguments, any>;

export class StorybookMock extends AbstractStorybookMock<
  TabbedModalProps,
  TabbedModalServiceArguments,
  TabbedModalProps,
  TabbedModalServiceArguments
> {
  propArguments = {
    tabs: {
      control: {
        control: 'array',
      },
      defaultValue: [],
    },
    defaultSelectedTabId: {
      control: {
        control: 'array',
      },
      defaultValue: [],
    },
    onClose: {
      control: {
        control: 'array',
      },
      defaultValue: [],
    },
  };

  serviceArguments = {};

  dependencies = [];

  getProps(params?: Params): TabbedModalProps {
    return {
      tabs: this.getArgumentValue('tabs', params),
      onClose: this.getArgumentValue('onClose', params),
      defaultSelectedTabId: this.getArgumentValue('defaultSelectedTabId', params),
    };
  }

  getServices(params: Params): TabbedModalServiceArguments {
    return {};
  }
}
