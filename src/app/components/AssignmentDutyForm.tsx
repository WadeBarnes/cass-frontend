import React from 'react';
import moment from 'moment';
import {
    Field,
    InjectedFormProps,
    FieldArray,
    formValues
} from 'redux-form';
import {
    IdType,
    TimeType,
    WorkSectionCode,
    AssignmentDuty,
    SheriffDuty
} from '../api';
import TimeSliderField from './FormElements/TimeSliderField';
import { getWorkSectionColour } from '../api/utils';
import {
    ListGroup,
    ListGroupItem,
    Button,
    Glyphicon,
} from 'react-bootstrap';
import Form from './FormElements/Form';
import SheriffSelector from '../containers/SheriffSelector';
import * as TimeUtils from '../infrastructure/TimeRangeUtils';
import TextArea from './FormElements/TextArea';
import { ConfirmationModal } from './ConfirmationModal';
import * as Validators from '../infrastructure/Validators';
import SelectorField from './FormElements/SelectorField';

export interface AssignmentDutyFormProps {
    handleSubmit?: () => void;
    onSubmitSuccess?: () => void;
    onRemoveSheriffDuty?: (id: string) => void;
    assignmentTitle?: string;
    assignmentId?: IdType;
    minTime?: TimeType;
    maxTime?: TimeType;
    workSectionId?: WorkSectionCode;
    isNewDuty?: boolean;
}

interface SheriffDutyFieldProps {
    id?: IdType;
    timeRange: {
        startTime: TimeType;
        endTime: TimeType;
    };
}

class SheriffDutyFieldArray extends FieldArray<SheriffDutyFieldProps | Partial<SheriffDuty>> {
}
export default class AssignmentDutyForm extends
    React.Component<AssignmentDutyFormProps & InjectedFormProps<{}, AssignmentDutyFormProps>, {}> {

    static parseAssignmentDutyFromValues(values: any): AssignmentDuty {
        const { timeRange: { startTime, endTime }, sheriffDuties, ...rest } = values;
        const assignmentDuty = { ...rest };
        assignmentDuty.startDateTime = startTime;
        assignmentDuty.endDateTime = endTime;
        assignmentDuty.sheriffDuties = sheriffDuties.map((element: any) => ({
            ...element,
            sheriffId: element.sheriffId === '' ? undefined : element.sheriffId,
            startDateTime: moment(element.timeRange.startTime).toISOString(),
            endDateTime: moment(element.timeRange.endTime).toISOString(),
        }));
        return assignmentDuty as AssignmentDuty;
    }

    static assignmentDutyToFormValues(duty: AssignmentDuty) {
        return {
            ...duty,
            timeRange: {
                startTime: moment(duty.startDateTime).toISOString(),
                endTime: moment(duty.endDateTime).toISOString()
            },
            sheriffDuties: duty.sheriffDuties.map((element: any) => ({
                ...element,
                sheriffId: element.sheriffId == undefined ? '' : element.sheriffId,
                timeRange: {
                    startTime: moment(element.startDateTime).toISOString(),
                    endTime: moment(element.endDateTime).toISOString()
                }
            }))
        };
    }

    renderSheriffDutyFieldsComponent(workSectionId: WorkSectionCode): React.ComponentClass {
        const {
            onRemoveSheriffDuty,
            minTime = TimeUtils.getDefaultTimePickerMinTime().toISOString(),
            maxTime = TimeUtils.getDefaultTimePickerMaxTime().toISOString(),
        } = this.props;
        return formValues('timeRange')((timeRangeProps: any) => {
            const {
                timeRange: {
                    startTime = TimeUtils.getDefaultStartTime().toISOString(),
                    endTime = TimeUtils.getDefaultEndTime().toISOString()
                }
            } = timeRangeProps;
            return (
                <SheriffDutyFieldArray
                    name="sheriffDuties"
                    component={(p) => {
                        const { fields } = p;
                        function handleRemoveSheriffDuty(index: number) {
                            const sdId = fields.get(index).id;
                            if (sdId) {
                                if (onRemoveSheriffDuty) {
                                    onRemoveSheriffDuty(sdId);
                                }
                            }
                            fields.remove(index);
                        }
                        const deleteConfirmMessage = (
                            <p style={{ fontSize: 14 }}>
                                <b>Permanently delete</b>?
                            </p>
                        );
                        return (
                            <ListGroup >
                                {fields.map((fieldInstanceName, index) => {
                                    return (
                                        <ListGroupItem key={`listGroupItem_${index}`}>
                                            <div className="pull-right">
                                                <ConfirmationModal
                                                    key={index}
                                                    title="Delete"
                                                    message={deleteConfirmMessage}
                                                    actionBtnLabel={<Glyphicon glyph="trash" />}
                                                    actionBtnStyle="danger"
                                                    confirmBtnLabel="Delete"
                                                    confirmBtnStyle="danger"
                                                    onConfirm={() => {
                                                        handleRemoveSheriffDuty(index);
                                                    }}
                                                />
                                            </div>
                                            <div style={{ marginTop: 20 }}>
                                                <Field
                                                    key={`${fieldInstanceName}_${index}.sheriffId`}
                                                    name={`${fieldInstanceName}.sheriffId`}
                                                    component={(p) => <SelectorField 
                                                        {...p} 
                                                        SelectorComponent={
                                                            (sp) => <SheriffSelector {...sp} />}  
                                                    />}
                                                    label="Assignee"
                                                />
                                                <Field
                                                    key={`${fieldInstanceName}_${index}.timeRange`}
                                                    name={`${fieldInstanceName}.timeRange`}
                                                    component={(p) => <TimeSliderField
                                                        {...p}
                                                        minTime={minTime}
                                                        maxTime={maxTime}
                                                        minAllowedTime={startTime}
                                                        maxAllowedTime={endTime}
                                                        timeIncrement={15}
                                                        color={getWorkSectionColour(workSectionId)}
                                                    />}
                                                />
                                            </div>
                                        </ListGroupItem>
                                    );
                                }
                                )}
                                <br />
                                <Button
                                    onClick={() => fields.push({
                                        timeRange: {
                                            startTime,
                                            endTime
                                        }
                                    })}
                                >
                                    <Glyphicon glyph="plus" />
                                </Button>
                            </ListGroup>
                        );
                    }}
                />
            );
        });
    }

    render() {
        const {
            assignmentTitle = 'Assignment',
            minTime = TimeUtils.getDefaultTimePickerMinTime().toISOString(),
            maxTime = TimeUtils.getDefaultTimePickerMaxTime().toISOString(),
            workSectionId = 'OTHER',
            isNewDuty = false
        } = this.props;
        const SheriffDutyFields = this.renderSheriffDutyFieldsComponent(workSectionId);
        return (
            <div>
                <h1 style={{ marginBottom: 20 }}>{assignmentTitle}</h1>
                <Form {...this.props}>
                    <Field
                        name="timeRange"
                        component={(p) => <TimeSliderField
                            {...p}
                            minTime={minTime}
                            maxTime={maxTime}
                            timeIncrement={15}
                            color={getWorkSectionColour(workSectionId)}
                            label={<h2 style={{ marginBottom: 5 }}>Time Range</h2>}
                        />}
                    />
                    <br />
                    {!isNewDuty && <Field
                        name="comments"
                        component={TextArea as any}
                        label="Comments"
                        validate={[Validators.maxLength200]}
                    />}
                    <div style={{ marginTop: 40 }}>
                        <h2>Assignment</h2>
                        <SheriffDutyFields />
                    </div>
                </Form>
            </div>
        );
    }
}