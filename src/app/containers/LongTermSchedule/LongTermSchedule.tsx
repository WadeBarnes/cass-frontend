import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { RootState } from '../../store';
import { allShifts } from '../../modules/shifts/selectors';
import { getFullDayLeaves, getPartialDayLeaves } from '../../modules/leaves/selectors';
import {
    getShifts,
    unlinkShift,
    linkShift,
} from '../../modules/shifts/actions';
import { getLeaves } from '../../modules/leaves/actions';
import {
    default as ShiftSchedule,
    ShiftScheduleProps
} from '../../components/ShiftSchedule';
import {
    Shift,
    IdType,
    Leave,
    DateType
} from '../../api';
import './LongTermSchedule.css';
import ShiftCard from '../../components/ShiftCard';
import SheriffDropTarget from '../SheriffDropTarget';
import SheriffDisplay from '../SheriffDisplay';
import {
    visibleTime,
    selectedShiftIds
} from '../../modules/schedule/selectors';
import {
    selectShift as selectShiftAction,
    unselectShift as unselectShiftAction
} from '../../modules/schedule/actions';
import { sheriffLoanMap, sheriffs } from '../../modules/sheriffs/selectors';
import { MapType, WorkSection, Sheriff, Assignment } from '../../api/Api';
import PartialLeavePopover from '../../components/PartialLeavePopover';
import { allAssignments } from '../../modules/assignments/selectors';

interface LongTermScheduleProps extends Partial<ShiftScheduleProps> {
    sideBarWidth?: number;
    allowTimeDrag?: boolean;
    sheriffs?: Sheriff[];
    assignments?: Assignment[];
}

interface LongTermScheduleDispatchProps {
    fetchShifts: () => void;
    assignShift: (link: { sheriffId: IdType, shiftId: IdType }) => void;
    unassignShift: (link: { sheriffId: IdType, shiftId: IdType }) => void;
    fetchLeaves: () => void;
    selectShift: (shiftId: IdType) => void;
    unselectShift: (shiftId: IdType) => void;
}

interface LongTermScheduleStateProps {
    shifts: Shift[];
    fullDayLeaves: Leave[];
    partialDayLeaves: Leave[];
    visibleTimeStart: any;
    visibleTimeEnd: any;
    selectedShifts: IdType[];
    loanMap?: MapType<{ isLoanedIn: boolean, isLoanedOut: boolean }>;
}

class LongTermSchedule extends React.Component<LongTermScheduleProps
    & LongTermScheduleStateProps
    & LongTermScheduleDispatchProps> {

    componentWillMount() {
        const {
            fetchShifts,
            fetchLeaves
        } = this.props;

        fetchShifts();
        fetchLeaves();
    }

    isSheriffOnFullDayLeave(sheriffId: IdType, shift: Shift): boolean {
        const { fullDayLeaves } = this.props;
        let leavesForSheriff = fullDayLeaves.filter(l => l.sheriffId === sheriffId);
        let dateFilteredLeaves = leavesForSheriff.filter(l =>
            (moment(shift.startDateTime).isBetween(moment(l.startDate), moment(l.endDate), 'days', '[]'))
            && !l.cancelReasonCode);
        return dateFilteredLeaves.length > 0;
    }

    sheriffsPartialDayLeave(shift: Shift): Leave | undefined {
        const { partialDayLeaves } = this.props;
        let leavesForSheriff = partialDayLeaves.filter(l => l.sheriffId === shift.sheriffId);
        let dateFilteredLeaves = leavesForSheriff.filter(l =>
            (moment(l.startDate).isSame(moment(shift.startDateTime), 'days'))
            && !l.cancelReasonCode);

        return dateFilteredLeaves.length > 0 ? dateFilteredLeaves[0] : undefined;
    }

    isSheriffScheduledForDay(sheriffId: IdType, shiftStart: DateType): boolean {
        const { shifts } = this.props;
        let shiftsForSheriff = shifts.filter(s => s.sheriffId === sheriffId);
        let dateFilteredShifts = shiftsForSheriff.filter(s =>
            moment(s.startDateTime).isSame(shiftStart, 'day'));

        return dateFilteredShifts.length > 0;
    }

    isSheriffLoanedOut(sheriffId: IdType): boolean {
        const { loanMap = {} } = this.props;
        return loanMap[sheriffId].isLoanedOut;
    }

    private isShiftSelected(shiftId: IdType): boolean {
        const { selectedShifts = [] } = this.props;
        return selectedShifts.indexOf(shiftId) >= 0;
    }

    private toggleShiftSelect(shiftId: IdType) {
        const { selectShift, unselectShift } = this.props;
        if (this.isShiftSelected(shiftId)) {
            unselectShift(shiftId);
        } else {
            selectShift(shiftId);
        }
    }

    private shiftCompareString(shift: Shift) {
        const {
            sheriffs = [],
            assignments = []
        } = this.props;
        const sheriff = sheriffs.find(s => s.id == shift.sheriffId);
        const assignment = assignments.find(a => a.id == shift.assignmentId);
        return (        
            `${WorkSection.getWorkSectionSortCode(shift.workSectionId)}:${assignment ? assignment.title : 'z'}:${shift.startDateTime}${sheriff ? sheriff.lastName : 'z'}`
        );
    }
    
    render() {
        const {
            shifts = [],
            assignShift,
            visibleTimeStart,
            visibleTimeEnd,
        } = this.props;

        
        return (
            <div className="scheduling-timeline">
                <ShiftSchedule
                    shifts={shifts.sort((a, b) => this.shiftCompareString(a).localeCompare(this.shiftCompareString(b)))}
                    visibleTimeEnd={visibleTimeEnd}
                    visibleTimeStart={visibleTimeStart}
                    itemRenderer={(shift) => {
                        const partialLeave = this.sheriffsPartialDayLeave(shift);
                        return (
                            <SheriffDropTarget
                                style={{
                                    height: '100%',
                                    display: 'flex'
                                }}
                                onDropItem={(sheriff) => { assignShift({ sheriffId: sheriff.id, shiftId: shift.id }); }}
                                canDropItem={(sheriff) =>
                                    !this.isSheriffLoanedOut(sheriff.id)
                                    && !this.isSheriffOnFullDayLeave(sheriff.id, shift)
                                    && !this.isSheriffScheduledForDay(sheriff.id, moment(shift.startDateTime))
                                }
                                className="shift-card"
                                onClick={() => this.toggleShiftSelect(shift.id)}
                            >
                                <ShiftCard
                                    shift={shift}
                                    isSelected={this.isShiftSelected(shift.id)}
                                    isAssigned={shift.sheriffId != undefined}
                                >
                                    {partialLeave !== undefined &&
                                        <div style={{ position: 'absolute', top: 0, margin: 5 }}>
                                            <PartialLeavePopover leave={partialLeave} />
                                        </div>}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            flex: 1,
                                            paddingTop: 5
                                        }}
                                    >
                                        <SheriffDisplay sheriffId={shift.sheriffId} />
                                        <div>{shift.title}</div>
                                    </div>
                                </ShiftCard>
                            </SheriffDropTarget>
                        );
                    }}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState, props: LongTermScheduleProps) => {
    const currentVisibleTime = visibleTime(state);
    return {
        sheriffs: sheriffs(state),
        assignments: allAssignments(state),
        shifts: allShifts(state),
        fullDayLeaves: getFullDayLeaves(state),
        partialDayLeaves: getPartialDayLeaves(state),
        ...currentVisibleTime,
        selectedShifts: selectedShiftIds(state),
        loanMap: sheriffLoanMap(state)
    };
};

const mapDispatchToProps = {
    fetchShifts: getShifts,
    assignShift: linkShift,
    unassignShift: unlinkShift,
    fetchLeaves: getLeaves,
    selectShift: selectShiftAction,
    unselectShift: unselectShiftAction
};

export default connect<LongTermScheduleStateProps, LongTermScheduleDispatchProps, LongTermScheduleProps>(
    mapStateToProps, mapDispatchToProps)(LongTermSchedule);