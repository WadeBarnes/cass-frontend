import React from 'react';
import { connect } from 'react-redux';
import { RootState } from './store';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';
import {
  DragDropContext
} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Navigation from './components/Navigation';
import DutyRoster from './pages/DutyRoster';
import ManageSheriffs from './pages/ManageSheriffs';
import DefaultAssignments from './pages/DefaultAssignments';
import Scheduling from './pages/Scheduling';
import AssignmentDutyEditModal from './containers/AssignmentDutyEditModal';
import LocationSelector from './containers/LocationSelector';
import { Well, Alert, Button } from 'react-bootstrap';
import SheriffProfileModal from './containers/SheriffProfileModal';
import ScheduleShiftCopyModal from './containers/ScheduleShiftCopyModal';
import ScheduleShiftAddModal from './containers/ScheduleShiftAddModal';
import AssignmentSheriffDutyReassignmentModal from './containers/AssignmentSheriffDutyReassignmentModal';
import PublishSchedule from './pages/PublishSchedule/PublishSchedule';
import Footer from './components/Footer/Footer';
import {
  isLocationSet as isCurrentLocationSet,
  isLoggedIn as isUserLoggedIn,
  isLoadingToken as isLoadingUserToken,
  loadingTokenError
} from './modules/user/selectors';
import ToastManager from './components/ToastManager/ToastManager';
import ConnectedConfirmationModal from './containers/ConfirmationModal';
import SheriffProfileCreateModal from './containers/SheriffProfileCreateModal';
import resolveAppUrl from './infrastructure/resolveAppUrl';
import CustomDragLayer from './infrastructure/DragDrop/CustomDragLayer';
import ScheduleShiftMultiEditModal from './containers/ScheduleMultiShiftEditModal';
import DutyRosterToolsModal from './containers/DutyRosterToolsModal';
import AssignmentPage from './pages/Assignments';
import AssignmentScheduleAddModal from './containers/AssignmentScheduleAddModal';
import AssignmentScheduleEditModal from './containers/AssignmentScheduleEditModal';

export interface LayoutStateProps {
  isLocationSet?: boolean;
  isLoggedIn?: boolean;
  isLoadingToken?: boolean;
  tokenLoadingError?: any;
}

export interface LayoutDispatchProps {
}
class Layout extends React.Component<LayoutStateProps & LayoutDispatchProps> {

  componentWillReceiveProps(nextProps: LayoutStateProps) {
    const { isLoadingToken: wasLoadingToken } = nextProps;
    const { isLoadingToken = true, isLoggedIn = false, tokenLoadingError } = this.props;
    if (wasLoadingToken && !isLoadingToken && isLoggedIn && tokenLoadingError == undefined) {
      window.location.reload();
    }
  }

  render() {
    const {
      isLocationSet = false,
      tokenLoadingError,
      isLoggedIn,
      isLoadingToken = true
    } = this.props;
    if (isLoadingToken) {
      return null;
    }
    if (!isLoggedIn && tokenLoadingError) {
      return (
        <div style={{ width: 300, margin: 'auto', marginTop: 200, position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }}>
          <Alert bsStyle="danger">
            Looks like your session may have expired, please reload the page.
            <br/>
            <Button style={{marginTop:10}} onClick={() => window.location.reload()} >Click to reload</Button>
          </Alert>
        </div>
      );
    }
    return (
      <Router basename={resolveAppUrl('')}>
        <div className="App">
          <CustomDragLayer/>
          <ToastManager />
          <div className="headerArea">
            <Navigation />
          </div>
          {!isLocationSet && (
            <div className="mainArea">
              <Well
                style={{
                  backgroundColor: 'white',
                  maxWidth: '80%',
                  minWidth: 800,
                  height: '100%',
                  margin: 'auto'
                }}
              >
                <div style={{ paddingTop: 10 }}>
                  <h1>Select your Location</h1>
                  <LocationSelector.Current />
                </div>
              </Well>
            </div>
          )}

          {isLocationSet && (
            <div className="mainArea">
              <Route exact={true} path={Navigation.Routes.dutyRoster.timeline.path} component={DutyRoster} />
              <Route path={Navigation.Routes.schedule.manage.path} component={Scheduling} />
              <Route path={Navigation.Routes.team.path} component={ManageSheriffs} />
              <Route path={Navigation.Routes.dutyRoster.setup.path} component={DefaultAssignments} />
              <Route path={Navigation.Routes.assignment.path} component={AssignmentPage} />
              <Route path={Navigation.Routes.schedule.distribute.path} component={PublishSchedule} />
              <DutyRosterToolsModal />
              <AssignmentDutyEditModal />
              <SheriffProfileModal />
              <SheriffProfileCreateModal />
              <ScheduleShiftCopyModal />
              <ScheduleShiftAddModal />
              <AssignmentScheduleAddModal />
              <AssignmentScheduleEditModal />
              <ConnectedConfirmationModal />
              <AssignmentSheriffDutyReassignmentModal />
              <ScheduleShiftMultiEditModal /> 
            </div>
          )}
          <div className="footerArea">
            <Footer />
          </div>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLocationSet: isCurrentLocationSet(state),
    isLoggedIn: isUserLoggedIn(state),
    isLoadingToken: isLoadingUserToken(state),
    tokenLoadingError: loadingTokenError(state)
  };
};

const mapDispatchToProps = {};

const connectedLayout = connect<LayoutStateProps, LayoutDispatchProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
// Make our Layout the root of the Drag Drop Context
export default DragDropContext(HTML5Backend)(connectedLayout);
