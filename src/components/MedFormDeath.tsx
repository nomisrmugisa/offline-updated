import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import FormHeader from './Header';
import FormFooter from './Footer';
import './MedFormDeath.css';
import FacilitySelect from './FacilitySelect';
import useFacilityStore from '../stores/useFacilityStore';
import { addEvent, getStats } from '../stores/useEventsDB';
import { FormData } from '../types/FormData';
import EventListModal from './EventListModal';
import CauseOfDeathRow from './CauseOfDeathRow';
import { refreshIndexedDB, syncDorisAndSend } from '../services/dorisSyncService';
import { getEventsMissingDoris } from '../stores/useEventsDB';
import db from '../stores/useEventsDB';  // Your IndexedDB instance

// interface DorisResponse {
//     stemCode: string;
//     stemURI: string;
//     code: string;
//     uri: string;
//     report: string;
//     reject: boolean;
//     error: string | null;
//     warning: string;
// }

interface Props {
    isOnline: boolean;
    onSyncStateChange?: (isSyncing: boolean) => void;
}

const defaultFormData: FormData = {
    MOH_National_Case_Number: '',
    Inpatient_Number: '',
    NIN: '',
    Name: '',
    Region: '',
    Occupation: '',
    District: '',
    Date_Of_Birth_Known: false,
    Date_Of_Birth_notKnown: false,
    County: '',
    Date_Of_Birth: '',
    Sub_County: '',
    Age: { Years: '', Months: '', Days: '', Hours: '', Minutes: '' },
    Village: '',
    Sex: '',
    placeOfDeath: '',
    Date_Time_Of_Death: '',
    causeOfDeath1: '',
    code1: '',
    causeOfDeathFreeText1: '',
    Time_Interval_From_Onset_To_Death1: { Time_Interval_Unit1: '', Time_Interval_Qtty1: '' },
    causeOfDeath2: '',
    code2: '',
    causeOfDeathFreeText2: '',
    Time_Interval_From_Onset_To_Death2: { Time_Interval_Unit2: '', Time_Interval_Qtty2: '' },
    causeOfDeath3: '',
    code3: '',
    causeOfDeathFreeText3: '',
    Time_Interval_From_Onset_To_Death3: { Time_Interval_Unit3: '', Time_Interval_Qtty3: '' },
    causeOfDeath4: '',
    code4: '',
    causeOfDeathFreeText4: '',
    Time_Interval_From_Onset_To_Death4: { Time_Interval_Unit4: '', Time_Interval_Qtty4: '' },

    causesOfDeath: Array.from({ length: 4 }, () => ({
        cause: '',
        code: '',
        causeFreeText: '',
        timeIntervalUnit: '',
        timeIntervalQuantity: ''
    })),

    State_Underlying_Cause: '',
    State_Underlying_Cause_Code: '',
    Doris_Underlying_Cause: '',
    dorisCode: '',
    Final_Underlying_Cause: '',
    Final_Underlying_CauseCode: '',
    lastSurgeryPerformed: '',
    dateOfSurgery: '',
    reasonForSurgery: '',
    autopsyRequested: '',
    findingsInCertification: '',
    disease: false,
    assault: false,
    notDetermined: false,
    accident: false,
    legalIntervention: false,
    pendingInvenstigation: false,
    intentionalSelfHarm: false,
    war: false,
    unknown: false,
    externalCause: false,
    dateOfInjury: '',
    describeExternalCause: '',
    occuranceOfExternalCause: '',
    multiplePregnancy: '',
    stillBorn: '',
    numberOfHrsSurvived: '',
    birthWeight: '',
    numberOfCompletedPregWeeks: '',
    ageOfMother: '',
    conditionsPerinatalDeath: '',
    wasDeceasedPreg: '',
    atWhatPoint: '',
    didPregancyContributeToDeath: '',
    parity: '',
    modeOfDelivery: '',
    placeOfDelivery: '',
    deliveredBySkilledAttendant: '',
    I_Attended_Deceased: false,
    I_Examined_Body: false,
    I_Conducted_PostMortem: false,
    Other: '',
    examinedBy: '',
    facility: '',
    syncStatus: 'pending', // Default sync status

    referencePersonName: '',
    referencePersonFirstName: '',
    referencePersonAddress: '',
    certifierService: '',
    professionalQualification: '',
    burialObstacle: '',
    deceasedArrival: '',
    assistanceDoctor: false,
    assistanceMidwife: false,
    childType: '',

    Patient_file_number: '',
    CNIB_or_passport: '',
    Surname: '',
    First_name: '',
    Place_of_birth: '',
    Nationality: '',
    Country: '',
    Province: '',
    certifierName: '',
    professionalOrderNumber: '',
    Qualification: '',
    other_Signft_Disease_States: false,
    Circumstances_of_death: '',
    Child_Born_Alive_Date: '',
    Child_Stillborn_Date: '',
    Died_giving_birth: false,
    During_work: false,
    Unknown_birth_death: false,
    Date_Of_Birth_Mother: '',
    Age_of_Mother: '',
    Number_of_prev_pregnancies: '',
    Date_Of_Last_Preg: '',
    Live_Birth: '',
    Last_preg_issue: '',
    Stillbirth: '',
    Alive_Mother: false,
    Abortion_Mother: '',
    Stillbirth_checkbx: false,
    Abortion_Moth_checkbx: false,
    Date_Of_Last_Period: '',
    Delivery: '',
    Prenatal_care_visits: '',
    assistanceOtherTrained: '',
    assistanceOther: '',
    childOnlyOne: false,
    childSecondTwin: false,
    childFirstTwin: false,
    otherMultipleBirth: '',

};

const MedFormDeath: React.FC<Props> = ({ isOnline, onSyncStateChange }) => {

    const { selectedFacility } = useFacilityStore();
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [eventStats, setEventStats] = useState({ total: 0, sent: 0, notSent: 0 });
    // const [dorisResponse] = useState<DorisResponse | null>(null);
    // const [showDorisModal, setShowDorisModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshProgress, setRefreshProgress] = useState('');
    const [syncProgress, setSyncProgress] = useState({
        current: 0,
        total: 0,
        phase: '' // 'computing' | 'sending' | 'done'
    });


    useEffect(() => {
        fetchStats(); // fetch initially when the component mounts
    }, []);

    useEffect(() => {
        if (selectedFacility) {
            // Update formData with the selected facility when the global selectedFacility changes
            setFormData((prevData) => ({
                ...prevData,
                facility: selectedFacility.id, // Set the selected facility id
            }));
        }
    }, [selectedFacility]);

    // State for form data
    const fetchStats = async () => {
        const stats = await getStats();
        setEventStats(stats);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedFormData = { ...formData, facility: selectedFacility?.id || '' };
            await addEvent(updatedFormData); // Save event data
            setFormData(defaultFormData);
            fetchStats();
            // alert('Event saved!');
            console.log('Form Data Submitted:', formData);
        } catch (error) {
            console.error('Error saving event', error);
        }
        // Add API call or further processing here
    };

    // Handle nested object changes (e.g., Age, Time_Interval_From_Onset_To_Death)
    const handleNestedChange = (parentKey: string, childKey: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [parentKey]: {
                ...(prevData[parentKey as keyof typeof prevData] as Record<string, any>), // Fix: Type assertion
                [childKey]: value,
            },
        }));
    };

    // const computeDoris = async (codes: { code1: string, code2: string, code3: string, code4: string }) => {
    //     try {
    //         console.log('Computing Doris with codes:', codes);

    //         // Only proceed if at least the primary cause is provided
    //         if (!codes.code1) {
    //             console.log('Primary cause code (code1) is empty, skipping Doris computation');
    //             setFormData(prev => ({
    //                 ...prev,
    //                 Doris_Underlying_Cause: '',
    //                 dorisCode: '',
    //                 Final_Underlying_Cause: '',
    //                 Final_Underlying_CauseCode: ''
    //             }));
    //             return;
    //         }

    //         const params = new URLSearchParams({                
    //             causeOfDeathCodeA: codes.code1 || '',
    //             causeOfDeathCodeB: codes.code2 || '',
    //             causeOfDeathCodeC: codes.code3 || '',
    //             causeOfDeathCodeD: codes.code4 || '',
    //         });

    //         console.log('Making request to:', `https://ug.sk-engine.cloud/icd-api/icd/release/11/2024-01/doris?${params.toString()}`);

    //         const response = await fetch(`https://ug.sk-engine.cloud/icd-api/icd/release/11/2024-01/doris?${params.toString()}`, {
    //             method: 'GET',
    //             headers: {
    //                 'API-Version': 'v2',
    //                 'Accept-Language': 'en'
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         console.log('Response status:', response.status);

    //         const data: DorisResponse = await response.json();
    //         console.log('Doris data:', data);
    //         setDorisResponse(data);

    //         // Update the form with the Doris response
    //         setFormData(prev => {
    //             const updated = {
    //                 ...prev,
    //                 Doris_Underlying_Cause: data.stemCode,
    //                 dorisCode: data.code,
    //                 Final_Underlying_Cause: data.stemCode,
    //                 Final_Underlying_CauseCode: data.code
    //             };
    //             console.log("Updated form data with Doris response:", updated);
    //             return updated;
    //         });

    //     } catch (error) {
    //         console.error('Error computing Doris:', error);
    //         // Optionally show error to user
    //         // alert('Error computing Doris. Please check console for details.');
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prevData => {
            const newData = {
                ...prevData,
                [name]: isCheckbox ? checked : value,
            };

            // If a code field is being changed, trigger Doris with the latest values
            if (name === 'code1' || name === 'code2' || name === 'code3' || name === 'code4') {
                // computeDoris({
                //     code1: name === 'code1' ? value : newData.code1,
                //     code2: name === 'code2' ? value : newData.code2,
                //     code3: name === 'code3' ? value : newData.code3,
                //     code4: name === 'code4' ? value : newData.code4,
                // });
            }

            return newData;
        });
    };


    const handleFullRefreshAndSync = async () => {
        if (!isOnline) {
            alert('You must be online to perform synchronization');
            return;
        }

        setIsRefreshing(true);
        setRefreshProgress('Starting refresh and sync...');
        if (onSyncStateChange) onSyncStateChange(true);
        setSyncProgress({ current: 0, total: 0, phase: 'computing' });

        try {
            setRefreshProgress('Refreshing application data...');
            await refreshIndexedDB();
            // Refresh stats before sync to get accurate counts
            await fetchStats();

            // Get all pending records needing Doris codes
            const eventsWithoutDoris = await getEventsMissingDoris();
            // Get records already with Doris codes ready to send
            const eventsReadyToSend = await db.events
                .filter((e: FormData) =>  // Typed parameter here
                    typeof e.dorisCode === 'string' &&
                    e.dorisCode.trim() !== '' &&
                    e.syncStatus === 'pending')
                .count();

            setSyncProgress(prev => ({
                ...prev,
                total: eventsWithoutDoris.length + eventsReadyToSend
            }));

            // Perform sync with progress updates
            const result = await syncDorisAndSend((progress) => {
                setSyncProgress(prev => ({
                    ...prev,
                    current: progress,
                    phase: progress <= eventsWithoutDoris.length ? 'computing' : 'sending'
                }));
            });

            // Refresh stats again after sync to update UI
            await fetchStats();

            // Handle results
            if (result.success) {
                setRefreshProgress(
                    `Success! Updated ${result.updatedCount} records, sent ${result.sentCount} to DHIS2`
                );
            } else {
                setRefreshProgress('Sync completed with no changes needed');
            }
            setSyncProgress(prev => ({ ...prev, phase: 'done' }));

        } catch (error) {
            console.error('Full refresh and sync failed:', error);
            setRefreshProgress('Refresh and sync failed. Please try again.');
            // Even on error, refresh stats to reflect any partial changes
            await fetchStats();
        } finally {
            setIsRefreshing(false);
            if (onSyncStateChange) onSyncStateChange(false);
            setTimeout(() => {
                setRefreshProgress('');
                setSyncProgress({ current: 0, total: 0, phase: '' });
            }, 5000);
        }
    };

    return (
        <>
            <FormHeader isOnline={isOnline} />
            <div className="header1">
                <h2 className="heading">MCCOD-local</h2>
                <div className="summaryTabs">
                    <span className="tab">Total Records: <p className="stat">{eventStats.total}</p></span>
                    <span className="tab">Records Sent: <p className="stat">{eventStats.sent}</p></span>
                    <span className="tab">Records NOT Sent: <p className="stat">{eventStats.notSent}</p></span>
                </div>
            </div>

            <div className="container">
                <form id="medicalCertDeath" className="main" onSubmit={handleSubmit}>
                    {/* Facility Section */}
                    <div className="row">
                        <div className="col" style={{ border: 'none' }}>
                            <label className="form-label facility" htmlFor="facility">Facility:</label>
                            <span style={{ marginTop: '-7px', marginLeft: '5px' }}><b>{selectedFacility?.name}</b></span>
                        </div>
                        <div className="col" style={{ border: 'none' }}>
                            <FacilitySelect
                                className="form-select"
                                id="facility"
                                name="facility"
                            />
                        </div>
                        <div className="col" style={{ border: 'none' }}>
                            <div className="topBtns">
                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#eventListModal">
                                    View Records
                                </button>
                                <button className="btn btn-primary update-button">Update Record</button>
                                <div className="sync-container">
                                    <button
                                        type="button"
                                        className="btn btn-primary refresh-sync-button"
                                        onClick={handleFullRefreshAndSync}
                                        disabled={isRefreshing || !isOnline}
                                    >
                                        {isRefreshing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                <span className="ms-2">Processing...</span>
                                            </>
                                        ) : (
                                            'Sync with DHIS2'
                                        )}
                                    </button>
                                    {refreshProgress && (
                                        <div className="refresh-progress">
                                            <small>{refreshProgress}</small>
                                        </div>
                                    )}
                                    {syncProgress.total > 0 && (
                                        <div className="sync-progress-container">
                                            <div className="sync-progress-header">
                                                {syncProgress.phase === 'computing' && (
                                                    <span>Computing Doris codes... ({syncProgress.current}/{syncProgress.total})</span>
                                                )}
                                                {syncProgress.phase === 'sending' && (
                                                    <span>Sending to DHIS2... ({syncProgress.current}/{syncProgress.total})</span>
                                                )}
                                                {syncProgress.phase === 'done' && (
                                                    <span className="text-success">Sync completed!</span>
                                                )}
                                            </div>
                                            <div className="progress mt-2">
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    role="progressbar"
                                                    style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                                                    aria-valuenow={syncProgress.current}
                                                    aria-valuemin={0}
                                                    aria-valuemax={syncProgress.total}
                                                >
                                                    {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    {/* Identification of deceased */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Identification of the deceased</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Patient_file_number">Patient file number:
                                <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Patient_file_number"
                                name="Patient_file_number"
                                value={formData.Patient_file_number}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Of_Birth_Known">Date of Birth (Known)?
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Date_Of_Birth_Known"
                                    name="Date_Of_Birth_Known"
                                    checked={formData.Date_Of_Birth_Known}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Date_Of_Birth_Known">Yes</label>
                            </div>
                            <div className="form-check" style={{ marginLeft: '5px' }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Date_Of_Birth_notKnown"
                                    name="Date_Of_Birth_notKnown"
                                    checked={formData.Date_Of_Birth_notKnown}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Date_Of_Birth_notKnown">No</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="CNIB_or_passport">CNIB or passport </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="CNIB_or_passport"
                                name="CNIB_or_passport"
                                value={formData.CNIB_or_passport}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Of_Birth">Date of Birth</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Date_Of_Birth"
                                name="Date_Of_Birth"
                                value={formData.Date_Of_Birth}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Surname">Surname:<span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Surname"
                                name="Surname"
                                value={formData.Surname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col" style={{ borderRight: 'none' }}>
                            <label className="form-label" htmlFor="Age.Years">Age:</label>
                            <table style={{ marginRight: '-10px' }}>
                                <tr>
                                    <th>Years:</th>
                                    <th>Months:</th>
                                </tr>
                                <tr>
                                    <td >
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Age.Years"
                                            name="Age.Years"
                                            value={formData.Age.Years}
                                            onChange={(e) => handleNestedChange('Age', 'Years', e.target.value)}

                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Age.Months"
                                            name="Age.Months"
                                            value={formData.Age.Months}
                                            onChange={(e) => handleNestedChange('Age', 'Months', e.target.value)}

                                        />
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div className="col" style={{ borderLeft: 'none' }}>
                            <table>
                                <tr>
                                    <th>Days:</th>
                                    <th>Hours:</th>
                                    <th>Minutes:</th>
                                </tr>
                                <tr>
                                    <td style={{ marginRight: '-2px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Age.Days"
                                            name="Age.Days"
                                            value={formData.Age.Days}
                                            onChange={(e) => handleNestedChange('Age', 'Days', e.target.value)}

                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Age.Hours"
                                            name="Age.Hours"
                                            value={formData.Age.Hours}
                                            onChange={(e) => handleNestedChange('Age', 'Hours', e.target.value)}

                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Age.Minutes"
                                            name="Age.Minutes"
                                            value={formData.Age.Minutes}
                                            onChange={(e) => handleNestedChange('Age', 'Minutes', e.target.value)}

                                        />
                                    </td>
                                </tr>
                            </table>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="First_name">First name: <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="First_name"
                                name="First_name"
                                value={formData.First_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Sex">Gender <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="Sex"
                                name="Sex"
                                value={formData.Sex}
                                onChange={handleInputChange}
                                required
                            >
                                <option value=""></option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Place_of_birth">Place of birth <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Place_of_birth"
                                name="Place_of_birth"
                                value={formData.Place_of_birth}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Occupation">Occupation: <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Occupation"
                                name="Occupation"
                                value={formData.Occupation}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Nationality">Nationality: <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Nationality"
                                name="Nationality"
                                value={formData.Nationality}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="placeOfDeath">Place of Death <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="placeOfDeath"
                                name="placeOfDeath"
                                value={formData.placeOfDeath}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Time_Of_Death">Date and Time of Death
                                <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="datetime-local"
                                className="form-control"
                                id="Date_Time_Of_Death"
                                name="Date_Time_Of_Death"
                                value={formData.Date_Time_Of_Death}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Residence Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Residence of deceased person</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Country">Country</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Country"
                                name="Country"
                                value={formData.Country}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Region">Region <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Region"
                                name="Region"
                                value={formData.Region}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Province">Province <span style={{ color: 'red' }}> *</span></label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Province"
                                name="Province"
                                value={formData.Province}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="District">District / Municipality
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="District"
                                name="District"
                                value={formData.District}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Village">Home (Village/Sector):
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Village"
                                name="Village"
                                value={formData.Village}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col"></div>
                        <div className="col"></div>

                    </div>

                    {/* Contact Person Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Contact person:</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="referencePersonName">Name of the reference person
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="referencePersonName"
                                name="referencePersonName"
                                value={formData.referencePersonName || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="referencePersonFirstName">First name(s) of the reference person
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="referencePersonFirstName"
                                name="referencePersonFirstName"
                                value={formData.referencePersonFirstName || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="referencePersonAddress">Address/Tel of the reference person
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="referencePersonAddress"
                                name="referencePersonAddress"
                                value={formData.referencePersonAddress || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Identification of the certifier Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Identification of the certifier</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="certifierName">Name and surname(s) of the certifier
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>

                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="certifierName"
                                name="certifierName"
                                value={formData.certifierName || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="col">
                            <label className="form-label" htmlFor="certifierService">Service
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="certifierService"
                                name="certifierService"
                                value={formData.certifierService || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="professionalOrderNumber">Professional order number
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="professionalOrderNumber"
                                name="professionalOrderNumber"
                                value={formData.professionalOrderNumber || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Qualification">Qualification
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Qualification"
                                name="Qualification"
                                value={formData.Qualification || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                    </div>

                    {/* Part 2: Comments Section - Medico-Legal Reporting */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>III. Part 2: Comments (Medico-Legal Reporting)</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label">Medico-legal obstacle to burial
                                <span style={{ color: 'red' }}> *</span>
                            </label>
                        </div>
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="burialObstacleYes"
                                    name="burialObstacle"
                                    value="Yes"
                                    checked={formData.burialObstacle === 'Yes'}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="burialObstacleYes">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="burialObstacleNo"
                                    name="burialObstacle"
                                    value="No"
                                    checked={formData.burialObstacle === 'No'}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="burialObstacleNo">No</label>
                            </div>
                        </div>
                    </div>
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Arrival deceased or deceased on arrival</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label">Deceased arrival or deceased on arrival?</label>
                        </div>
                        <div className="col">
                            <div className="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="deceasedArrivalYes"
                                    name="deceasedArrival"
                                    value="Yes"
                                    checked={formData.deceasedArrival === 'Yes'}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="deceasedArrivalYes">Yes</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="deceasedArrivalNo"
                                    name="deceasedArrival"
                                    value="No"
                                    checked={formData.deceasedArrival === 'No'}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="deceasedArrivalNo">No</label>
                            </div>
                        </div>
                    </div>

                    {/* Frame A: Medical Data Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Box A: Medical Data. Parts 1 and 2</h4>
                        </div>
                    </div>
                    <div className="row tables">
                        <table style={{ minWidth: '1424px' }}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>Cause of death</th>
                                    <th>Code</th>
                                    <th>Type of time interval from start to death</th>
                                    <th>Time interval between onset and death</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1 */}
                                <CauseOfDeathRow
                                    index={1}
                                    label="1. Indicate the disease or condition that directly caused the death on line a."
                                    rowLetter="a"
                                    causeValue={formData.causeOfDeath1}
                                    codeValue={formData.code1}
                                    // freeTextValue={formData.causeOfDeathFreeText1}
                                    timeUnitValue={formData.Time_Interval_From_Onset_To_Death1.Time_Interval_Unit1}
                                    timeQtyValue={formData.Time_Interval_From_Onset_To_Death1.Time_Interval_Qtty1}
                                    onChange={handleInputChange}
                                    onNestedChange={handleNestedChange}
                                />
                                <CauseOfDeathRow
                                    index={2}
                                    labelHtml={<th rowSpan={5}>2. Indicate the sequence of events in order (if applicable)</th>}
                                    rowLetter="b"
                                    causeValue={formData.causeOfDeath2}
                                    codeValue={formData.code2}
                                    // freeTextValue={formData.causeOfDeathFreeText2}
                                    timeUnitValue={formData.Time_Interval_From_Onset_To_Death2.Time_Interval_Unit2}
                                    timeQtyValue={formData.Time_Interval_From_Onset_To_Death2.Time_Interval_Qtty2}
                                    onChange={handleInputChange}
                                    onNestedChange={handleNestedChange}
                                />
                                <CauseOfDeathRow
                                    index={3}
                                    showLabel={false}
                                    rowLetter="c"
                                    causeValue={formData.causeOfDeath3}
                                    codeValue={formData.code3}
                                    // freeTextValue={formData.causeOfDeathFreeText3}
                                    timeUnitValue={formData.Time_Interval_From_Onset_To_Death3.Time_Interval_Unit3}
                                    timeQtyValue={formData.Time_Interval_From_Onset_To_Death3.Time_Interval_Qtty3}
                                    onChange={handleInputChange}
                                    onNestedChange={handleNestedChange}
                                />
                                <CauseOfDeathRow
                                    index={4}
                                    showLabel={false}
                                    rowLetter="d"
                                    causeValue={formData.causeOfDeath4}
                                    codeValue={formData.code4}
                                    // freeTextValue={formData.causeOfDeathFreeText4}
                                    timeUnitValue={formData.Time_Interval_From_Onset_To_Death4.Time_Interval_Unit4}
                                    timeQtyValue={formData.Time_Interval_From_Onset_To_Death4.Time_Interval_Qtty4}
                                    onChange={handleInputChange}
                                    onNestedChange={handleNestedChange}
                                />
                                <tr>
                                    <th colSpan={1}>“3. Are there any other significant disease states?”</th>
                                    <td colSpan={3}>
                                        <div className="div" style={{ display: 'flex', gap: '5px' }}>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id="other_Signft_Disease_States"
                                                    name="other_Signft_Disease_States"
                                                    checked={formData.other_Signft_Disease_States}
                                                    onChange={handleInputChange}
                                                    value="Yes"
                                                />
                                                <label className="form-check-label" htmlFor="other_Signft_Disease_States">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    className="form-check-input"
                                                    id="other_Signft_Disease_States"
                                                    name="other_Signft_Disease_States"
                                                    checked={formData.other_Signft_Disease_States}
                                                    onChange={handleInputChange}
                                                    value="No"
                                                />
                                                <label className="form-check-label" htmlFor="other_Signft_Disease_States">No</label>
                                            </div>
                                        </div>
                                    </td>

                                </tr>

                                {/* <tr>
                                    <th colSpan={1}>Indicate the inital cause on the last line</th>
                                    <td colSpan={3}>
                                        <input
                                            type="text"
                                            id="State_Underlying_Cause"
                                            name="State_Underlying_Cause"
                                            className="form-control"
                                            // value={formData.State_Underlying_Cause}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td colSpan={2}>
                                        <input
                                            type="text"
                                            id="State_Underlying_CauseCode"
                                            name="State_Underlying_Cause_Code"
                                            className="form-control"
                                            // value={formData.State_Underlying_Cause_Code}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <th colSpan={1}>The initial cause proposed by Doris</th>
                                    <td colSpan={3}>
                                        <input
                                            type="text"
                                            id="Doris_Underlying_Cause"
                                            name="Doris_Underlying_Cause"
                                            className="form-control"
                                            // value={formData.Doris_Underlying_Cause}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td colSpan={2}>
                                        <input
                                            type="text"
                                            id="dorisCode"
                                            name="dorisCode"
                                            className="form-control"
                                            // value={formData.dorisCode}
                                            onChange={handleInputChange}
                                            autoComplete="off"
                                        />
                                    </td>
                                    <td colSpan={2}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleModal"
                                        // onClick={() => setShowDorisModal(true)}
                                        // disabled={!formData.code1}
                                        >
                                            View Report
                                        </button>

                                    </td>
                                </tr>

                                <tr>
                                    <th colSpan={1}>Confirmation of the initial cause</th>
                                    <td colSpan={3}>
                                        <select id="Final_Underlying_Cause" name="Final_Underlying_CauseCode" onChange={handleInputChange} className="form-select">
                                            <option value="" disabled>Select an option</option>
                                        </select>
                                    </td>
                                    <td colSpan={2}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="Final_Underlying_CauseCode"
                                            name="Final_Underlying_CauseCode"
                                            value={formData.Final_Underlying_CauseCode}
                                            onChange={handleInputChange}

                                        />
                                    </td>
                                </tr> */}
                            </tbody>
                        </table>
                    </div>

                    {/* Frame B: Other Medical Data Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Box B: Other Medical Data</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="lastSurgeryPerformed">Has surgery been performed within the last 4 weeks?</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="lastSurgeryPerformed"
                                name="lastSurgeryPerformed"
                                value={formData.lastSurgeryPerformed}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="autopsyRequested">Was an autopsy requested?</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="autopsyRequested"
                                name="autopsyRequested"
                                value={formData.autopsyRequested}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Circumstances of death</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Circumstances_of_death">Circumstances of death</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="Circumstances_of_death"
                                name="Circumstances_of_death"
                                value={formData.Circumstances_of_death}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Disease">Disease</option>
                                <option value="Accident">Accident</option>
                                <option value="Assault">Assault</option>
                                <option value="Undetermined">Undetermined</option>
                                <option value="Investigation in Progress">Investigation in Progress</option>
                                <option value="Unknown">Unknown</option>
                                <option value="War">War</option>
                                <option value="Self-inflicted injury">Self-inflicted injury</option>
                                <option value="Intervention of Public Force">Intervention of Public Force</option>
                            </select>
                        </div>

                    </div>

                    {/* Fatal or Infant Death Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Fetal or Infant Death</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="multiplePregnancy">Multiple pregnancy</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="multiplePregnancy"
                                name="multiplePregnancy"
                                value={formData.multiplePregnancy}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="stillBorn">Stillborn?</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="stillBorn"
                                name="stillBorn"
                                value={formData.stillBorn}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    {/* Number of Hours Survived and Birth Weight Section */}
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="numberOfHrsSurvived">If death within 24 hrs, specify the number of hours survived</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="numberOfHrsSurvived"
                                name="numberOfHrsSurvived"
                                value={formData.numberOfHrsSurvived}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="birthWeight">Birth weight (in grams)</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="birthWeight"
                                name="birthWeight"
                                value={formData.birthWeight}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Number of Completed Pregnancy Weeks and Age of Mother Section */}
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="numberOfCompletedPregWeeks">Number of completed weeks of pregnancy</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="numberOfCompletedPregWeeks"
                                name="numberOfCompletedPregWeeks"
                                value={formData.numberOfCompletedPregWeeks}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="ageOfMother">Age of mother (years)</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="ageOfMother"
                                name="ageOfMother"
                                value={formData.ageOfMother}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Conditions of Perinatal Death Section */}
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="conditionsPerinatalDeath">If the death is perinatal, please indicate the conditions of the mother that affected the fetus and newborn.</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="conditionsPerinatalDeath"
                                name="conditionsPerinatalDeath"
                                value={formData.conditionsPerinatalDeath}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Additional Data */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Additional data</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Child_Born_Alive_Date">The child was born alive on</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Child_Born_Alive_Date"
                                name="Child_Born_Alive_Date"
                                value={formData.Child_Born_Alive_Date}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Child_Stillborn_Date">The child was stillborn on</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Child_Stillborn_Date"
                                name="Child_Stillborn_Date"
                                value={formData.Child_Stillborn_Date}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Died_giving_birth"
                                    name="Died_giving_birth"
                                    checked={formData.Died_giving_birth}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Died_giving_birth">Died before giving birth</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="During_work"
                                    name="During_work"
                                    checked={formData.During_work}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="During_work">During work</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Unknown_birth_death"
                                    name="Unknown_birth_death"
                                    checked={formData.Unknown_birth_death}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Unknown_birth_death">Unknown</label>
                            </div>
                        </div>
                    </div>

                    {/* For Women Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Mother</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Of_Birth_Mother">Date of Birth</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Date_Of_Birth_Mother"
                                name="Date_Of_Birth_Mother"
                                value={formData.Date_Of_Birth_Mother}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Age_of_Mother">Or Age (In years)</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Age_of_Mother"
                                name="Age_of_Mother"
                                value={formData.Age_of_Mother}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Number_of_prev_pregnancies">Number of previous pregnancies</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Number_of_prev_pregnancies"
                                name="Number_of_prev_pregnancies"
                                value={formData.Number_of_prev_pregnancies}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Of_Last_Preg">Date of Last Pregnancy</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Date_Of_Last_Preg"
                                name="Date_Of_Last_Preg"
                                value={formData.Date_Of_Last_Preg}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Live_Birth">Live Birth</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Live_Birth"
                                name="Live_Birth"
                                value={formData.Live_Birth}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Last_preg_issue">Issue of last pregnancy</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Last_preg_issue"
                                name="Last_preg_issue"
                                value={formData.Last_preg_issue}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Stillbirth">Stillbirth</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Stillbirth"
                                name="Stillbirth"
                                value={formData.Stillbirth}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Alive_Mother"
                                    name="Alive_Mother"
                                    checked={formData.Alive_Mother}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Alive_Mother">Alive</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Abortion_Mother">Abortion</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Abortion_Mother"
                                name="Abortion_Mother"
                                value={formData.Abortion_Mother}
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Stillbirth_checkbx"
                                    name="Stillbirth_checkbx"
                                    checked={formData.Stillbirth_checkbx}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Stillbirth_checkbx">Stillbirth</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Abortion_Moth_checkbx"
                                    name="Abortion_Moth_checkbx"
                                    checked={formData.Abortion_Moth_checkbx}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="Abortion_Moth_checkbx">Abortion</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Date_Of_Last_Period">Date of Last Period</label>
                        </div>
                        <div className="col date-input-container">
                            <input
                                type="date"
                                className="form-control"
                                id="Date_Of_Last_Period"
                                name="Date_Of_Last_Period"
                                value={formData.Date_Of_Last_Period}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Delivery">Delivery</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="Delivery"
                                name="Delivery"
                                value={formData.Delivery}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="GAPTA">GAPTA</option>
                                <option value="Spontaneous">Spontaneous</option>
                                <option value="Aritificial">Aritificial</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="col">
                            <label className="form-label" htmlFor="Prenatal_care_visits">Prenatal care, four or more visits:</label>
                        </div>
                        <div className="col">
                            <select
                                className="form-select"
                                id="Prenatal_care_visits"
                                name="Prenatal_care_visits"
                                value={formData.Prenatal_care_visits}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    {/* Assistance at birth Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Assistance at birth</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="assistanceDoctor"
                                    name="assistanceDoctor"
                                    checked={formData.assistanceDoctor}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="assistanceDoctor">Doctor</label>
                            </div>


                        </div>
                        <div className="col">
                            <label className="form-check-label" htmlFor="assistanceOtherTrained">Other trained personnel</label>
                            <input
                                type="text"
                                className="form-control"
                                id="assistanceOtherTrained"
                                name="assistanceOtherTrained"
                                value={formData.assistanceOtherTrained || ''}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="assistanceMidwife"
                                    name="assistanceMidwife"
                                    checked={formData.assistanceMidwife}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="assistanceMidwife">Midwife</label>
                            </div>

                        </div>
                        <div className="col">
                            <label className="form-check-label" htmlFor="assistanceOtherTrained">Other (please specify)</label>
                            <input
                                type="text"
                                className="form-control"
                                id="assistanceOtherTrained"
                                name="assistanceOtherTrained"
                                value={formData.assistanceOther || ''}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Child Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>Child</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="childOnlyOne"
                                    name="childOnlyOne"
                                    value="Only one child"
                                    checked={formData.childOnlyOne}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="childOnlyOne">Only one child</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="childSecondTwin"
                                    name="childSecondTwin"
                                    value="2nd Twin"
                                    checked={formData.childSecondTwin}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="childSecondTwin">2nd Twin</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="childFirstTwin"
                                    name="childFirstTwin"
                                    value="1st twin"
                                    checked={formData.childFirstTwin}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="childFirstTwin">1st twin</label>
                            </div>

                        </div>
                        <div className="col">
                            <label className="form-check-label" htmlFor="otherMultipleBirth">Other multiple birth (please specify)</label>
                            <input
                                type="text"
                                className="form-control"
                                id="otherMultipleBirth"
                                name="otherMultipleBirth"
                                value={formData.otherMultipleBirth || ''}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Certification Section */}
                    <div className="row rowHeader">
                        <div className="col">
                            <h4>I hereby certify that (tick as appropriate):</h4>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="I_Attended_Deceased">I assisted the deceased before death</label>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="I_Attended_Deceased"
                                    name="I_Attended_Deceased"
                                    checked={formData.I_Attended_Deceased}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="I_Attended_Deceased">Yes</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="I_Examined_Body">I examined the body after death</label>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="I_Examined_Body"
                                    name="I_Examined_Body"
                                    checked={formData.I_Examined_Body}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="I_Examined_Body">Yes</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="I_Conducted_PostMortem">I performed the autopsy on the body</label>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="I_Conducted_PostMortem"
                                    name="I_Conducted_PostMortem"
                                    checked={formData.I_Conducted_PostMortem}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="I_Conducted_PostMortem">Yes</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="Other">Other (specify)</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="Other"
                                name="Other"
                                value={formData.Other}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    {/* Examined By Section */}
                    <div className="row">
                        <div className="col">
                            <label className="form-label" htmlFor="examinedBy">Certified By</label>
                        </div>
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                id="examinedBy"
                                name="examinedBy"
                                value={formData.examinedBy}
                                onChange={handleInputChange}

                            />
                        </div>
                    </div>

                    <br />
                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
                <br />
                <br />
                <br />
                <br />
                <FormFooter />
            </div>
            {/* Doris report */}
            {/* {showDorisModal && dorisResponse && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog" style={{ maxWidth: '600px' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Doris Report</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDorisModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="report-content" style={{ whiteSpace: 'pre-line', padding: '15px' }}>
                                    <h6>Underlying Cause: {dorisResponse.code}</h6>
                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '15px',
                                        borderRadius: '5px',
                                        marginTop: '10px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        {dorisResponse.report}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDorisModal(false)}
                                    style={{ padding: '5px 15px' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
            <EventListModal setFormData={setFormData} onDelete={fetchStats} />
        </>
    );
};

export default MedFormDeath;