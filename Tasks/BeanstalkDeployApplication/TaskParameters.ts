/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const applicationTypeAspNet: string = 'aspnet'
export const applicationTypeAspNetCoreForWindows: string = 'aspnetCoreWindows'
export const applicationTypeS3Archive: string = 's3'
export const applicationTypeExistingVersion: string = 'version'

export const defaultEventPollingDelaySeconds: number = 5
export const maxEventPollingDelaySeconds: number = 300

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    applicationName: string
    environmentName: string
    applicationType: string
    versionLabel: string
    webDeploymentArchive: string
    dotnetPublishPath: string
    deploymentBundleBucket: string
    deploymentBundleKey: string
    description: string
    outputVariable: string
    eventPollingDelay: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        applicationName: getInputRequired('applicationName'),
        environmentName: getInputRequired('environmentName'),
        applicationType: getInputRequired('applicationType'),
        versionLabel: '',
        webDeploymentArchive: '',
        dotnetPublishPath: '',
        deploymentBundleBucket: '',
        deploymentBundleKey: '',
        description: getInputOrEmpty('description'),
        outputVariable: getInputOrEmpty('outputVariable'),
        eventPollingDelay: defaultEventPollingDelaySeconds
    }

    console.log(tl.loc('DisplayApplicationType', parameters.applicationType))

    switch (parameters.applicationType) {
        case applicationTypeAspNet:
            parameters.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true)
            break

        case applicationTypeAspNetCoreForWindows:
            parameters.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true)
            break

        case applicationTypeS3Archive:
            parameters.deploymentBundleBucket = getInputRequired('deploymentBundleBucket')
            parameters.deploymentBundleKey = getInputRequired('deploymentBundleKey')
            break

        default:
            // version label read below
            break
    }

    if (parameters.applicationType === applicationTypeExistingVersion) {
        parameters.versionLabel = getInputRequired('versionLabel')
    } else {
        parameters.versionLabel = getInputOrEmpty('versionLabel')
    }

    const pollDelay = tl.getInput('eventPollingDelay', false)
    if (pollDelay) {
        const pollDelayValue = parseInt(pollDelay, 10)
        if (
            isNaN(pollDelayValue) ||
            pollDelayValue < defaultEventPollingDelaySeconds ||
            pollDelayValue > maxEventPollingDelaySeconds
        ) {
            console.log(
                tl.loc('InvalidEventPollDelay', pollDelay, defaultEventPollingDelaySeconds, maxEventPollingDelaySeconds)
            )
        } else {
            parameters.eventPollingDelay = pollDelayValue
        }
    }

    return parameters
}
