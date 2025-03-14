/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { schema } from '@kbn/config-schema';
import type { SavedObjectsType } from '@kbn/core/server';

export interface FavoritesSavedObjectAttributes {
  userId: string;
  type: string;
  favoriteIds: string[];
  favoriteMetadata?: Record<string, object>;
}

const schemaV1 = schema.object({
  userId: schema.string(),
  type: schema.string(), // object type, e.g. dashboard
  favoriteIds: schema.arrayOf(schema.string()),
});

const schemaV3 = schemaV1.extends({
  favoriteMetadata: schema.maybe(schema.object({}, { unknowns: 'allow' })),
});

export const favoritesSavedObjectName = 'favorites';

export const favoritesSavedObjectType: SavedObjectsType = {
  name: favoritesSavedObjectName,
  hidden: true,
  namespaceType: 'single',
  mappings: {
    dynamic: false,
    properties: {
      userId: { type: 'keyword' },
      type: { type: 'keyword' },
      favoriteIds: { type: 'keyword' },
      favoriteMetadata: { type: 'object', dynamic: false },
    },
  },
  modelVersions: {
    1: {
      changes: [],
      schemas: {
        // The forward compatible schema should allow any future versions of
        // this SO to be converted to this version, since we are using
        // @kbn/config-schema we opt-in to unknowns to allow the schema to
        // successfully "downgrade" future SOs to this version.
        forwardCompatibility: schemaV1.extends({}, { unknowns: 'ignore' }),
        create: schemaV1,
      },
    },
    2: {
      // the model stays the same, but we added the mappings for the snapshot telemetry needs
      changes: [
        {
          type: 'mappings_addition',
          addedMappings: {
            userId: { type: 'keyword' },
            type: { type: 'keyword' },
            favoriteIds: { type: 'keyword' },
          },
        },
      ],
      schemas: {
        forwardCompatibility: schemaV1.extends({}, { unknowns: 'ignore' }),
        create: schemaV1,
      },
    },
    3: {
      changes: [
        {
          type: 'mappings_addition',
          addedMappings: {
            favoriteMetadata: { type: 'object', dynamic: false },
          },
        },
      ],
      schemas: {
        forwardCompatibility: schemaV3.extends({}, { unknowns: 'ignore' }),
        create: schemaV3,
      },
    },
  },
};
