import React from 'react';
import moment from 'moment';
import {
    Field,
    InjectedFormProps,
    formValues
} from 'redux-form';
import {
    TimeType,
    WorkSectionCode,
    SheriffDuty
} from '../api';
import TimePickerField from './FormElements/TimePickerField';
import Form from './FormElements/Form';
import * as TimeUtils from '../infrastructure/TimeRangeUtils';
import toTitleCase from '../infrastructure/toTitleCase';
import { getWorkSectionColour } from '../api/utils';
import { Glyphicon } from 'react-bootstrap';

export type DutyReassignmentDetails = {
    workSectionId?: WorkSectionCode;
    title?: string;
    sheriffFirstName?: string;
    sheriffLastName?: string;
};
export interface SheriffDutyReassignmentFormProps {
    handleSubmit?: () => void;
    onSubmitSuccess?: () => void;
    minTime?: TimeType;
    maxTime?: TimeType;
    sourceDuty: SheriffDuty;
    targetDuty: SheriffDuty;
    sourceReassignmentDetails?: DutyReassignmentDetails;
    targetReassignmentDetails?: DutyReassignmentDetails;
    overlappingDuties: SheriffDuty[];
}

export default class SheriffDutyReassignmentForm extends
    React.Component<SheriffDutyReassignmentFormProps & InjectedFormProps<{}, SheriffDutyReassignmentFormProps>, {}> {

    static reassignmentDetailsFormValues(sourceDuty: SheriffDuty, targetDuty: SheriffDuty) {
        const isCurrentTimeDuringSourceDuty =
            moment().isBetween(moment(sourceDuty.startDateTime), moment(sourceDuty.endDateTime));
        const isCurrentTimeDuringTargetDuty =
            moment().isBetween(moment(targetDuty.startDateTime), moment(targetDuty.endDateTime));
        const roundedCurrentTime = TimeUtils.roundTimeToNearestQuarterHour(moment()).toISOString();

        return {
            sourceDutyEndTime: isCurrentTimeDuringSourceDuty
                ? roundedCurrentTime : moment(sourceDuty.startDateTime).toISOString(),
            targetDutyStartTime: isCurrentTimeDuringTargetDuty
                ? roundedCurrentTime : moment(targetDuty.startDateTime).toISOString()
        };
    }

    renderSourceTimePicker(minTime: TimeType, maxTime: TimeType): React.ComponentClass {
        return formValues('sourceDutyEndTime')((sourceTimeProps: any) => {
            const { sourceDutyEndTime } = sourceTimeProps;
            const { sourceReassignmentDetails = {}, sourceDuty } = this.props;
            const timeDisplay = moment(sourceDutyEndTime).format('hh:mm tt');
            return (
                <Field
                    name="sourceDutyEndTime"
                    component={(p) => <TimePickerField
                        {...p}
                        minTime={minTime}
                        maxTime={maxTime}
                        minAllowedTime={moment(sourceDuty.startDateTime).toISOString()}
                        maxAllowedTime={moment(sourceDuty.endDateTime).toISOString()}
                        timeIncrement={15}
                        color={getWorkSectionColour(sourceReassignmentDetails.workSectionId)}
                        label={
                            <h2 style={{ marginBottom: 5 }}>
                                From <b>{sourceReassignmentDetails.title}</b> at {timeDisplay}
                            </h2>}
                    />}
                />
            );
        });
    }

    renderTargetTimePicker(minTime: TimeType, maxTime: TimeType): React.ComponentClass {
        return formValues('targetDutyStartTime')((targetTimeProps: any) => {
            const { targetDutyStartTime } = targetTimeProps;
            const { targetReassignmentDetails = {}, targetDuty } = this.props;
            const timeDisplay = moment(targetDutyStartTime).format('hh:mm tt');
            return (
                <Field
                    name="targetDutyStartTime"
                    component={(p) => <TimePickerField
                        {...p}
                        minTime={minTime}
                        maxTime={maxTime}
                        minAllowedTime={moment(targetDuty.startDateTime).toISOString()}
                        maxAllowedTime={moment(targetDuty.endDateTime).toISOString()}
                        timeIncrement={15}
                        color={getWorkSectionColour(targetReassignmentDetails.workSectionId)}
                        label={
                            <h2 style={{ marginBottom: 5, fontSize: 21 }}>
                                To <b>{targetReassignmentDetails.title}</b> at {timeDisplay}
                            </h2>}
                    />}
                />
            );
        });
    }

    render() {
        const {
            sourceReassignmentDetails = {},
            targetReassignmentDetails = {},
            overlappingDuties = [],
            minTime = TimeUtils.getDefaultTimePickerMinTime().toISOString(),
            maxTime = TimeUtils.getDefaultTimePickerMaxTime().toISOString(),
            sourceDuty
        } = this.props;
        const SourceTimeField = this.renderSourceTimePicker(minTime, maxTime);
        const TargetTimeField = this.renderTargetTimePicker(minTime, maxTime);
        
        let showWarningForSourceDuty = false;
        let showWarningForTargetDuty = false;
        const overlappingDutiesIncludeSourceDuty = overlappingDuties.some(od => od.id === sourceDuty.id);
        const overlappingDutiesLength = overlappingDuties.length;
        if (overlappingDutiesLength === 1 && overlappingDutiesIncludeSourceDuty) {
            showWarningForSourceDuty = true;
            showWarningForTargetDuty = false;
        } else if (overlappingDutiesLength >= 1 && !overlappingDutiesIncludeSourceDuty) {
            showWarningForSourceDuty = false;
            showWarningForTargetDuty = true;
        } else if (overlappingDutiesLength > 1 && overlappingDutiesIncludeSourceDuty) {
            showWarningForSourceDuty = true;
            showWarningForTargetDuty = true;
        }
        // tslint:disable-next-line:max-line-length
        const sheriffName = `${toTitleCase(sourceReassignmentDetails.sheriffFirstName)} ${toTitleCase(sourceReassignmentDetails.sheriffLastName)}`;
        return (
            <div>
                <div style={{ fontSize: 24 }}> Move <b>{sheriffName}</b> </div>
                {showWarningForSourceDuty &&
                    <div className="warning-message" style={{ marginTop: 10, marginBottom: 5 }}>
                        <Glyphicon glyph="alert" style={{ marginRight: 7, fontSize: 18 }} />
                        The selected duties overlap. To prevent double booking adjust the times below.
                    </div>}

                <br />
                <Form {...this.props}>
                    <SourceTimeField />
                    <br /><br /><br />
                    <TargetTimeField />
                    {showWarningForTargetDuty &&
                    <div className="warning-message" style={{ marginTop: 55 }}>
                        <Glyphicon glyph="alert" style={{ marginRight: 7, fontSize: 18 }} />
                        {targetReassignmentDetails.title} overlaps with another duty to which {sheriffName} is assigned.
                    </div>}
                </Form>

            </div>
        );
    }
}
