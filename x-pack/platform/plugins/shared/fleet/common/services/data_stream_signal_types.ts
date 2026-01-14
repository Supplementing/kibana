/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RegistryDataStream } from '../types';

export type SignalType = 'logs' | 'metrics' | 'traces' | 'synthetics' | 'profiling';

const VALID_SIGNAL_TYPES: SignalType[] = ['logs', 'metrics', 'traces', 'synthetics', 'profiling'];

/**
 * Extracts unique signal types from data_streams array
 * Signal types are derived from data_streams[].type property from the EPR API
 *
 * @param dataStreams - Array of registry data streams from the package
 * @returns Array of unique signal types (logs, metrics, etc.)
 */
export function getSignalTypesFromDataStreams(
  dataStreams?: RegistryDataStream[]
): SignalType[] {
  if (!dataStreams || dataStreams.length === 0) {
    return [];
  }

  const signalTypes = new Set<SignalType>();

  dataStreams.forEach((dataStream) => {
    const type = dataStream.type as SignalType;
    if (VALID_SIGNAL_TYPES.includes(type)) {
      signalTypes.add(type);
    }
  });

  // Sort for consistent ordering: logs before metrics
  return Array.from(signalTypes).sort((a, b) => {
    const order = VALID_SIGNAL_TYPES;
    return order.indexOf(a) - order.indexOf(b);
  });
}
