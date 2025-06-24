import { CauseOfDeath } from "./CauseOfDeath";

// Define the types and interfaces for the form data
export interface FormData {
    id?: number;
    MOH_National_Case_Number: string;
    Inpatient_Number: string;
    NIN: string;
    Name: string;
    Region: string;
    Occupation: string;
    District: string;
    Date_Of_Birth_Known: boolean;
    Date_Of_Birth_notKnown: boolean;
    County: string;
    Date_Of_Birth: string;
    Sub_County: string;
    Age: { Years: string; Months: string; Days: string; Hours: string; Minutes: string };
    Village: string;
    Sex: string;
    placeOfDeath: string;
    Date_Time_Of_Death: string;
    
    causeOfDeath1: string;
    code1: string;
    causeOfDeathFreeText1: string;
    Time_Interval_From_Onset_To_Death1: { Time_Interval_Unit1: string; Time_Interval_Qtty1: string };
    
    causeOfDeath2: string;
    code2: string;
    causeOfDeathFreeText2: string;
    Time_Interval_From_Onset_To_Death2: { Time_Interval_Unit2: string; Time_Interval_Qtty2: string };
    
    causeOfDeath3: string;
    code3: string;
    causeOfDeathFreeText3: string;
    Time_Interval_From_Onset_To_Death3: { Time_Interval_Unit3: string; Time_Interval_Qtty3: string };
    
    causeOfDeath4: string;
    code4: string;
    causeOfDeathFreeText4: string;
    Time_Interval_From_Onset_To_Death4: { Time_Interval_Unit4: string; Time_Interval_Qtty4: string };
    
    causesOfDeath: CauseOfDeath[];

    State_Underlying_Cause: string;
    State_Underlying_Cause_Code: string;

    Doris_Underlying_Cause: string;
    dorisCode: string;

    Final_Underlying_Cause: string;
    Final_Underlying_CauseCode: string;

    lastSurgeryPerformed: string;
    dateOfSurgery: string;
    reasonForSurgery: string;
    autopsyRequested: string;
    findingsInCertification: string;
    disease: boolean;
    assault: boolean;
    notDetermined: boolean;
    accident: boolean;
    legalIntervention: boolean;
    pendingInvenstigation: boolean;
    intentionalSelfHarm: boolean;
    war: boolean;
    unknown: boolean;
    externalCause: boolean;
    dateOfInjury: string;
    describeExternalCause: string;
    occuranceOfExternalCause: string;
    multiplePregnancy: string;
    stillBorn: string;
    numberOfHrsSurvived: string;
    birthWeight: string;
    numberOfCompletedPregWeeks: string;
    ageOfMother: string;
    conditionsPerinatalDeath: string;
    wasDeceasedPreg: string;
    atWhatPoint: string;
    didPregancyContributeToDeath: string;
    parity: string;
    modeOfDelivery: string;
    placeOfDelivery: string;
    deliveredBySkilledAttendant: string;
    I_Attended_Deceased: boolean;
    I_Examined_Body: boolean;
    I_Conducted_PostMortem: boolean;
    Other: string;
    examinedBy: string;
    facility: string; // Added facility
    syncStatus: 'pending' | 'synced'; // Added sync status

    referencePersonName: string;
    referencePersonFirstName: string;
    referencePersonAddress: string;
    // certifierDS: string;
    certifierService: string;
    professionalQualification: string;
    burialObstacle: string;
    deceasedArrival: string;
    assistanceDoctor: boolean;
    assistanceMidwife: boolean;
    childType: string;

    Patient_file_number: string,
    CNIB_or_passport:  string,
    Surname: string,
    First_name: string,
    Place_of_birth: string,
    Nationality: string,
    Country: string,
    Province: string,
    certifierName: string,
    professionalOrderNumber: string,
    Qualification: string,
    other_Signft_Disease_States: boolean,
    Circumstances_of_death: string,
    Child_Born_Alive_Date: string,
    Child_Stillborn_Date: string,
    Died_giving_birth: boolean,
    During_work: boolean,
    Unknown_birth_death: boolean,
    Date_Of_Birth_Mother: string,
    Age_of_Mother: string,
    Number_of_prev_pregnancies: string,
    Date_Of_Last_Preg: string,
    Live_Birth: string,
    Last_preg_issue: string,
    Stillbirth: string,
    Alive_Mother: boolean,
    Abortion_Mother: string,
    Stillbirth_checkbx: boolean,
    Abortion_Moth_checkbx: boolean,
    Date_Of_Last_Period: string,
    Delivery: string,
    Prenatal_care_visits: string,
    assistanceOtherTrained: string,
    assistanceOther: string,
    childOnlyOne: boolean,
    childSecondTwin: boolean,
    childFirstTwin: boolean,
    otherMultipleBirth: string,

  }
  