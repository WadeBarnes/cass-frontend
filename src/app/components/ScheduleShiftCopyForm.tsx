import * as React from 'react';
import {
    Field,
    InjectedFormProps
} from 'redux-form';
import {
    DateType
} from '../api/Api';
import CheckboxField from './FormElements/CheckboxField';
import Form from './FormElements/Form';

export interface ScheduleShiftCopyFormProps {
    handleSubmit?: () => void;
    onSubmitSuccess?: () => void;
    weekStartSource: DateType;
    weekStartDestination: DateType;
}

export default class ScheduleShiftForm extends
    React.Component<ScheduleShiftCopyFormProps & InjectedFormProps<{}, ScheduleShiftCopyFormProps>, {}> {
    render() {
        return (
            <Form {...this.props}>
                <h3>Import shifts from previous week?</h3>
                <Field
                    name="shouldIncludeSheriffs"
                    component={CheckboxField as any}
                    label="Include assigned staff"
                />
            </Form>
        );
    }
}