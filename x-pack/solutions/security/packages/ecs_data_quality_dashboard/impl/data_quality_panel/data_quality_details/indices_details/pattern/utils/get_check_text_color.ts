/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const getCheckTextColor = (incompatible: number | undefined): string => {
  if (incompatible == null) {
    return 'ghost';
  } else if (incompatible === 0) {
    return '#6dcbb1';
  } else {
    return 'danger';
  }
};
