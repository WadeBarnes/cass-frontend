import { RootState } from '../../store';
import { IdType, AssignmentScheduleItem, DaysOfWeek } from '../../api/Api';
import * as assignmentRequests from '../assignments/requests/assignments';
import * as alternateAssignmentTypeRequests from '../assignments/requests/alternateAssignmentTypes';
import * as courtRoleRequests from '../assignments/requests/courtRoles';
import { createSelector } from 'reselect';
import * as courtroomRequests from '../assignments/requests/courtrooms';
import * as jailRoleRequests from '../assignments/requests/jailRoles';
import * as runRequests from '../assignments/requests/runs';
import mapToArray from '../../infrastructure/mapToArray';
import moment from 'moment';

export const visibleTime = (state: RootState): { visibleTimeStart: any, visibleTimeEnd: any } => {
    const { visibleTimeStart, visibleTimeEnd } = state.assignmentSchedule;
    return { visibleTimeStart, visibleTimeEnd };
};

// Assignments
export const allScheduledAssignments = createSelector(
    assignmentRequests.assignmentMapRequest.getData,
    courtroomRequests.courtroomMapRequest.getData,
    jailRoleRequests.jailRoleMapRequest.getData,
    runRequests.runMapRequest.getData,
    alternateAssignmentTypeRequests.alternateAssignmentTypeMapRequest.getData,
    courtRoleRequests.courtRoleMapRequest.getData,
    visibleTime,
    (map = {}, courtRooms = {}, jailRoles = {}, runs = {}, altAssignmentTypes = {}, courtRoles = {}, visibleTime): AssignmentScheduleItem[] => {
        let assignmentList: AssignmentScheduleItem[] = [];
        mapToArray(map).filter(item =>
            moment(item.startDateTime).startOf('day').diff(moment(visibleTime.visibleTimeStart).startOf('day'), 'days') == 0 &&
            moment(item.endDateTime).startOf('day').diff(moment(visibleTime.visibleTimeEnd).startOf('day').add(1, "day"), 'days') == 0
        ).forEach((item, assignmentIndex) => { 

            console.log(moment(item.startDateTime).startOf('day'));
            console.log(moment(visibleTime.visibleTimeStart).startOf('day').add(1, "day"));

            item.dutyRecurrences!.forEach(recurrence => {
                let startTime = moment(recurrence.startTime, 'HH:mm');
                let endTime = moment(recurrence.endTime, 'HH:mm');
                DaysOfWeek.getWeekdayNumbers(recurrence.daysBitmap).forEach((day, dayIndex) => {
                    for(let numSheriffs = 1; numSheriffs <= recurrence.sheriffsRequired; numSheriffs++) {
                        assignmentList.push({
                            assignmentId: item.id,
                            startDateTime: moment(visibleTime.visibleTimeStart).set("weekday", day).set('hour', startTime.get("hour")),
                            endDateTime: moment(visibleTime.visibleTimeStart).set("weekday", day).set('hour', endTime.get("hour")),
                            id: `${item.id}_${assignmentIndex}_${dayIndex}_${numSheriffs}`,
                            locationId: item.locationId,
                            workSectionId: item.workSectionId
                        });
                    }
                })
            })
        })
        return assignmentList;
    });

export const isSelected = (id: IdType) => (state: RootState): boolean => {
    const { selectedAssignmentIds = [] } = state.assignmentSchedule;
    return selectedAssignmentIds.indexOf(id) >= 0;
};

export const selectedAssignmentIds = (state: RootState): IdType[] => {
    const { selectedAssignmentIds = [] } = state.assignmentSchedule;
    return selectedAssignmentIds;
};