/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PackageInfo,
  RegistryVarsEntry,
  RegistryInput,
  RegistryStream,
  PackagePolicyConfigRecord,
  NewPackagePolicyInput,
  NewPackagePolicyInputStream,
  NewPackagePolicy,
  PackagePolicyConfigRecordEntry,
  RegistryStreamWithDataStream,
} from '../types';

import { doesPackageHaveIntegrations } from '.';
import {
  getNormalizedDataStreams,
  getNormalizedInputs,
  isIntegrationPolicyTemplate,
} from './policy_template';

type PackagePolicyStream = RegistryStream & {
  data_stream: { type: string; dataset: string };
};

export const getStreamsForInputType = (
  inputType: string,
  packageInfo: PackageInfo,
  dataStreamPaths: string[] = []
): PackagePolicyStream[] => {
  const streams: PackagePolicyStream[] = [];
  const dataStreams = getNormalizedDataStreams(packageInfo);
  const dataStreamsToSearch = dataStreamPaths.length
    ? dataStreams.filter((dataStream) => dataStreamPaths.includes(dataStream.path))
    : dataStreams;

  dataStreamsToSearch.forEach((dataStream) => {
    (dataStream.streams || []).forEach((stream) => {
      if (stream.input === inputType) {
        streams.push({
          ...stream,
          data_stream: {
            type: dataStream.type,
            dataset: dataStream.dataset,
          },
        });
      }
    });
  });

  return streams;
};

export const getRegistryStreamWithDataStreamForInputType = (
  inputType: string,
  packageInfo: PackageInfo,
  dataStreamPaths: string[] = []
): RegistryStreamWithDataStream[] => {
  const streams: RegistryStreamWithDataStream[] = [];
  const dataStreams = getNormalizedDataStreams(packageInfo);
  const dataStreamsToSearch = dataStreamPaths.length
    ? dataStreams.filter((dataStream) => dataStreamPaths.includes(dataStream.path))
    : dataStreams;

  dataStreamsToSearch.forEach((dataStream) => {
    (dataStream.streams || []).forEach((stream) => {
      if (stream.input === inputType) {
        streams.push({
          ...stream,
          data_stream: {
            ...dataStream,
          },
        });
      }
    });
  });

  return streams;
};

// Reduces registry var def into config object entry
const varsReducer = (
  configObject: PackagePolicyConfigRecord,
  registryVar: RegistryVarsEntry
): PackagePolicyConfigRecord => {
  const configEntry: PackagePolicyConfigRecordEntry = {
    value: !registryVar.default && registryVar.multi ? [] : registryVar.default,
  };
  if (registryVar.type) {
    configEntry.type = registryVar.type;
  }
  configObject![registryVar.name] = configEntry;
  return configObject;
};

/*
 * This service creates a package policy inputs definition from defaults provided in package info
 */
export const packageToPackagePolicyInputs = (
  packageInfo: PackageInfo,
  integrationToEnable?: string
): NewPackagePolicyInput[] => {
  const hasIntegrations = doesPackageHaveIntegrations(packageInfo);
  const inputs: NewPackagePolicyInput[] = [];
  const packageInputsByPolicyTemplateAndType: {
    [key: string]: RegistryInput & { data_streams?: string[]; policy_template: string };
  } = {};

  packageInfo.policy_templates?.forEach((packagePolicyTemplate) => {
    const normalizedInputs = getNormalizedInputs(packagePolicyTemplate);
    normalizedInputs?.forEach((packageInput) => {
      const inputKey = `${packagePolicyTemplate.name}-${packageInput.type}`;
      const input = {
        ...packageInput,
        ...(isIntegrationPolicyTemplate(packagePolicyTemplate) && packagePolicyTemplate.data_streams
          ? { data_streams: packagePolicyTemplate.data_streams }
          : {}),
        policy_template: packagePolicyTemplate.name,
      };
      packageInputsByPolicyTemplateAndType[inputKey] = input;
    });
  });

  Object.values(packageInputsByPolicyTemplateAndType).forEach((packageInput) => {
    const streamsForInput: NewPackagePolicyInputStream[] = [];
    let varsForInput: PackagePolicyConfigRecord = {};

    // Map each package input stream into package policy input stream
    const streams = getStreamsForInputType(
      packageInput.type,
      packageInfo,
      packageInput.data_streams
    ).map((packageStream) => {
      const stream: NewPackagePolicyInputStream = {
        enabled: packageStream.enabled === false ? false : true,
        data_stream: packageStream.data_stream,
      };
      if (packageStream.vars && packageStream.vars.length) {
        stream.vars = packageStream.vars.reduce(varsReducer, {});
      }
      return stream;
    });

    if (packageInput.vars?.length) {
      varsForInput = packageInput.vars.reduce(varsReducer, {});
    }

    streamsForInput.push(...streams);

    // Check if we should enable this input by the streams below it
    // Enable it if at least one of its streams is enabled
    let enableInput = streamsForInput.length
      ? !!streamsForInput.find((stream) => stream.enabled)
      : true;

    // If we are wanting to enabling this input, check if we only want
    // to enable specific integrations (aka `policy_template`s)
    if (
      enableInput &&
      hasIntegrations &&
      integrationToEnable &&
      integrationToEnable !== packageInput.policy_template
    ) {
      enableInput = false;
    }

    const input: NewPackagePolicyInput = {
      type: packageInput.type,
      policy_template: packageInput.policy_template,
      enabled: enableInput,
      streams: streamsForInput,
    };

    if (Object.keys(varsForInput).length) {
      input.vars = varsForInput;
    }

    inputs.push(input);
  });

  return inputs;
};

/**
 * Builds a `NewPackagePolicy` structure based on a package
 *
 * @param packageInfo
 * @param agentPolicyId
 * @param outputId
 * @param packagePolicyName
 */
export const packageToPackagePolicy = (
  packageInfo: PackageInfo,
  agentPolicyIds: string | string[],
  namespace: string = '',
  packagePolicyName?: string,
  description?: string,
  integrationToEnable?: string
): NewPackagePolicy => {
  if (!Array.isArray(agentPolicyIds)) {
    agentPolicyIds = [agentPolicyIds];
  }
  const experimentalDataStreamFeatures =
    'installationInfo' in packageInfo
      ? packageInfo.installationInfo?.experimental_data_stream_features
      : undefined;

  const packagePolicy: NewPackagePolicy = {
    name: packagePolicyName || `${packageInfo.name}-1`,
    namespace,
    description,
    package: {
      name: packageInfo.name,
      title: packageInfo.title,
      version: packageInfo.version,
      ...(experimentalDataStreamFeatures
        ? { experimental_data_stream_features: experimentalDataStreamFeatures }
        : undefined),
    },
    enabled: true,
    policy_id: agentPolicyIds[0],
    policy_ids: agentPolicyIds,
    inputs: packageToPackagePolicyInputs(packageInfo, integrationToEnable),
    vars: undefined,
  };

  if (packageInfo.vars?.length) {
    packagePolicy.vars = packageInfo.vars.reduce(varsReducer, {});
  }

  return packagePolicy;
};
