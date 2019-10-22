import * as React from 'react';
import * as moment from 'moment';
import {
    Well,
    Image
} from 'react-bootstrap';
import SheriffScheduleDisplay from '../../containers/SheriffScheduleDisplay';
import './PublishSchedule.css';
import LocationDisplay from '../../containers/LocationDisplay';
import SchedulePublishViewControls from '../../containers/SchedulePublishViewControls';
import SchedulePublishViewSelectedWeekDisplay from '../../containers/SchedulePublishViewSelectedWeekDisplay';
import Page from '../../components/Page/Page';
import BCCrestImg from '../../assets/images/bcss-crest.png';

class DeputySchedule extends React.PureComponent {
    render() {
        return (
            <Page
                toolbar={<SchedulePublishViewControls />}
            >
                <div id="deputySchedule">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Well
                            style={{
                                display: 'flex',
                                backgroundColor: 'white',
                                flexDirection: 'column',
                                flex: '1 1'
                            }}
                        >

                            <div style={{ flex: '1' }}>
                                <div className="deputy-schedule-header">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div>
                                            <Image src={BCCrestImg} style={{ width: 80 }} />
                                        </div>
                                        <div className="deputy-schedule-header-text">
                                            <h1>B.C. Sheriff Service</h1>
                                            <span style={{ fontStyle: 'italic', fontSize: 20 }}>
                                                Honour - Integrity - Commitment
                                </span>
                                        </div>
                                    </div>
                                    <div className="deputy-schedule-header-date-box ">
                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#666666' }}>
                                            <LocationDisplay.Current /> Schedule
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                                            <SchedulePublishViewSelectedWeekDisplay />
                                        </div>
                                        <div>
                                            Summary as of: <i>{moment().format('dddd MMM D, YYYY hh:mm')}</i>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ margin: 15 }}>
                                    <SheriffScheduleDisplay />
                                </div>
                            </div>

                        </Well>
                    </div>
                </div>
            </Page>
        );
    }
}

export default DeputySchedule;