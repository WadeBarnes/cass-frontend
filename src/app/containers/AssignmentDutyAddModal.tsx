import * as React from 'react';
import { default as AssignmentDutyCreateForm } from './AssignmentDutyCreateForm';
import {
    Button,
    Glyphicon
} from 'react-bootstrap';
import ModalWrapper from './ModalWrapper/ModalWrapper';
import { IdType } from '../api';

export interface AssignmentDutyAddModalProps {
    assignmentId: IdType;
}
export default class AssignmentDutyAddModal extends React.Component<AssignmentDutyAddModalProps> {
    render() {
        const { assignmentId } = this.props;
        return (
            <ModalWrapper
                title="Add an Assignment"
                showButton={({ handleShow }) => (
                    <Button bsStyle="primary" bsSize="xsmall" onClick={() => handleShow()}>
                        <Glyphicon glyph="plus" />
                    </Button>
                )}
                body={({ handleClose }) => (
                    <AssignmentDutyCreateForm 
                        onSubmitSuccess={handleClose} 
                        assignmentId={assignmentId}
                    />
                )}
                footerComponent={(
                    <AssignmentDutyCreateForm.SubmitButton>
                        Save
                    </AssignmentDutyCreateForm.SubmitButton>
                )}
            />
        );
    }
}