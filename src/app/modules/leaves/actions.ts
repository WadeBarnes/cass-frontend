import * as leaveRequests from './requests';

export const getLeaves = leaveRequests.leaveMapRequest.actionCreator;
export const createOrUpdateLeaves = leaveRequests.createOrUpdateLeavesRequest.actionCreator;
export const getLeaveSubCodes = leaveRequests.leaveTypeMapRequest.actionCreator;
export const getLeaveCancelCodes = leaveRequests.leaveCancelCodeMapRequest.actionCreator;