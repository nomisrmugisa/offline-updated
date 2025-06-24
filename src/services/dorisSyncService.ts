import { getEventsMissingDoris, updateSyncStatus } from '../stores/useEventsDB';
import db from '../stores/useEventsDB';
import { FormData } from '../types/FormData';
import { computeDoris } from '../utils/dorisUtils';
import { isInternetAvailable } from '../utils/connectivity';

// For dynamic server configuration
let currentServerIp = 'localhost';
let useDhis2Direct = false;
let authHeader: string | null = null;

export const setServerIp = (ip: string) => {
    currentServerIp = ip;
};

export const setDhis2DirectMode = (isDirect: boolean) => {
    useDhis2Direct = isDirect;
};

export const setAuthHeader = (header: string | null) => {
    authHeader = header;
};

interface SyncResult {
    success: boolean;
    updatedCount: number;
    sentCount: number;
    failedCount: number;
}

// In dorisSyncService.ts

/**
 * Forces a refresh of the IndexedDB connection
 */
export const refreshIndexedDB = async (): Promise<void> => {
    console.log('[Refresh] Refreshing IndexedDB connection...');
    try {
        await db.close();
        await db.open();
        console.log('[Refresh] IndexedDB connection refreshed successfully');
    } catch (error) {
        console.error('[Refresh] Failed to refresh IndexedDB:', error);
        throw new Error('Failed to refresh IndexedDB');
    }
};

/**
 * Performs a full application refresh
 */
export const refreshApplication = (): Promise<void> => {
    return new Promise((resolve) => {
        console.log('[Refresh] Refreshing application...');
        // This will be handled by the UI component
        resolve();
    });
};

/**
 * Combined refresh and sync operation
 */
export const fullRefreshAndSync = async (): Promise<SyncResult> => {
    try {
        // Step 1: Refresh application (UI will handle this)
        // Step 2: Refresh IndexedDB
        await refreshIndexedDB();
        // Step 3: Perform sync
        const result = await syncDorisAndSend();

        console.log('[FullRefresh] Refresh and sync completed:', result);
        return result;
    } catch (error) {
        console.error('[FullRefresh] Refresh and sync failed:', error);
        throw error;
    }
};

const generateEventId = (): string => {
    // Characters to use in the ID (excluding similar looking characters like 0, O, 1, I, l)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36
    let result = '';

    // Generate random characters to fill the remaining length
    for (let i = 0; i < 11 - timestamp.length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Combine timestamp and random characters
    return (timestamp + result).slice(0, 11).toUpperCase();
};

// send data to dhis2
const sendToDHIS2 = async (event: FormData) => {
    try {
        // First verify the record hasn't already been synced
        const existingEvent = await db.events.get(event.id as number);
        if (existingEvent?.syncStatus === 'synced') {
            console.log(`[DHIS2] Event ${event.id} already synced - skipping`);
            return { alreadySynced: true };
        }

        const payload = createDHIS2Payload(event);
        console.log('[DHIS2] Sending payload:', payload);

        const dhis2Url = useDhis2Direct 
            ? '/dhis2-direct/api/32/events'  // Use Vite proxy to DHIS2 directly
            : `http://${currentServerIp}:5001/api/32/events`; // Use your FastAPI proxy
            
        console.log(`[DHIS2] Using ${useDhis2Direct ? 'direct' : 'proxy'} mode:`, dhis2Url);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add authorization header for direct mode
        if (useDhis2Direct && authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(dhis2Url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DHIS2 API error:', errorData);
            throw new Error(`DHIS2 API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();
        console.log(`[DHIS2] Successfully sent event ${event.id}. Response:`, responseData);

        // Only mark as synced if API call succeeded
        await updateSyncStatus(event.id as number, 'synced');
        return responseData;
    } catch (error) {
        console.error(`[DHIS2] Failed to send event ${event.id}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
};

const createDHIS2Payload = (event: FormData) => {
    const eventId = generateEventId();

    return {
        attributeCategoryOptions: "l4UMmqvSBe5",
        event: eventId,
        program: "vf8dN49jprI",
        programStage: "aKclf7Yl1PE",
        orgUnit: event.facility,
        eventDate: event.Date_Time_Of_Death,
        dataValues: [
            // Identification of the deceased
            { dataElement: "RQZQMq1hat8", value: event.Patient_file_number },
            { dataElement: "roxn33dtLLx", value: event.Date_Of_Birth_Known },
            { dataElement: "MOstDqSY0gO", value: event.CNIB_or_passport },
            { dataElement: "RbrUuKFSqkZ", value: event.Date_Of_Birth },
            { dataElement: "Xw2cbAyh4qx", value: event.Surname },
            { dataElement: "q7e7FOXKnOf", value: event.Age?.Years },
            { dataElement: "ZYKmQ9GPOaF", value: event.First_name },
            { dataElement: "e96GB4CXyd3", value: event.Sex },
            { dataElement: "NlN15CHERmu", value: event.Place_of_birth },
            { dataElement: "b70okb06FWa", value: event.Occupation },
            { dataElement: "m9RiCoXVy6i", value: event.Nationality },
            { dataElement: "xNCSFrgdUgi", value: event.placeOfDeath },
            { dataElement: "i8rrl8YWxLF", value: event.Date_Time_Of_Death },

            // Residence of deceased person
            { dataElement: "se3wRj1bYPo", value: event.Country },
            { dataElement: "zwKo51BEayZ", value: event.Region },
            { dataElement: "t5nTEmlScSt", value: event.Province },
            { dataElement: "u44XP9fZweA", value: event.District },
            { dataElement: "dsiwvNQLe5n", value: event.Village },

            // Contact Person
            { dataElement: "RHlo2ydAm3g", value: event.referencePersonName },
            { dataElement: "DOM1qoPjK9p", value: event.referencePersonFirstName },
            { dataElement: "f3nd8ydHU6K", value: event.referencePersonAddress },

            // Identification of the certifier
            { dataElement: "bNtOacqHziT", value: event.certifierName },
            { dataElement: "BlQ0xVxY4xg", value: event.professionalOrderNumber },
            { dataElement: "hxSaoqC5Uk7", value: event.Qualification },
            { dataElement: "FkwAS4gwdIg", value: event.certifierService },

            // III. Part 2: Comments (Medico-Legal Reporting)
            { dataElement: "clTs5F3Y6Ku", value: event.burialObstacle },

            // Arrival deceased or deceased on arrival
            { dataElement: "MzAarwh2H6n", value: event.deceasedArrival },

            // Box A: Medical Data. Parts 1 and 2
            { dataElement: "sfpqAeqKeyQ", value: event.causeOfDeath1 },
            { dataElement: "zD0E77W4rFs", value: event.code1 },
            { dataElement: "Ylht9kCLSRW", value: event.Time_Interval_From_Onset_To_Death1.Time_Interval_Unit1 },
            { dataElement: "WkXxkKEJLsg", value: event.Time_Interval_From_Onset_To_Death1.Time_Interval_Qtty1 },
            { dataElement: "zb7uTuBCPrN", value: event.causeOfDeath2 },
            { dataElement: "tuMMQsGtE69", value: event.code2 },
            { dataElement: "myydnkmLfhp", value: event.Time_Interval_From_Onset_To_Death2.Time_Interval_Unit2 },
            { dataElement: "fleGy9CvHYh", value: event.Time_Interval_From_Onset_To_Death2.Time_Interval_Qtty2 },
            { dataElement: "QGFYJK00ES7", value: event.causeOfDeath3 },
            { dataElement: "C8n6hBilwsX", value: event.code3 },
            { dataElement: "aC64sB86ThG", value: event.Time_Interval_From_Onset_To_Death3.Time_Interval_Unit3 },
            { dataElement: "hO8No9fHVd2", value: event.Time_Interval_From_Onset_To_Death3.Time_Interval_Qtty3 },
            { dataElement: "CnPGhOcERFF", value: event.causeOfDeath4 },
            { dataElement: "IeS8V8Yf40N", value: event.code4 },
            { dataElement: "cmZrrHfTxW3", value: event.Time_Interval_From_Onset_To_Death4.Time_Interval_Unit4 },
            { dataElement: "eCVDO6lt4go", value: event.Time_Interval_From_Onset_To_Death4.Time_Interval_Qtty4 },
            { dataElement: "SHUNdXa2PLo", value: event.other_Signft_Disease_States },
            // Doris
            { dataElement: "tKezaEs8Ez5", value: event.Doris_Underlying_Cause },
            { dataElement: "LAvyxs29laJ", value: event.dorisCode },

            // Box B: Other Medical Data
            { dataElement: "Kk0hmrJPR90", value: event.lastSurgeryPerformed },
            { dataElement: "jY3K6Bv4o9Q", value: event.autopsyRequested },

            // Circumstances of death
            { dataElement: "qY059elJYzc", value: event.Circumstances_of_death },

            // Fetal or Infant Death
            { dataElement: "V4rE1tsj5Rb", value: event.multiplePregnancy },
            { dataElement: "ivnHp4M4hFF", value: event.stillBorn },
            { dataElement: "jf9TogeSZpk", value: event.numberOfHrsSurvived },
            { dataElement: "xAWYJtQsg8M", value: event.birthWeight },
            { dataElement: "lQ1Byr04JTx", value: event.numberOfCompletedPregWeeks },
            { dataElement: "DdfDMFW4EJ9", value: event.ageOfMother },
            { dataElement: "GFVhltTCG8b", value: event.conditionsPerinatalDeath },

            // Additional data
            { dataElement: "jI9I0Sfs7Rr", value: event.Child_Born_Alive_Date },
            { dataElement: "Vy8EcUEEKPw", value: event.Child_Stillborn_Date },
            { dataElement: "swJ2PfjEj6L", value: event.Died_giving_birth },
            { dataElement: "jZ2AaewaLAz", value: event.During_work },
            { dataElement: "aya1XW1zIjr", value: event.Unknown_birth_death },

            // Mother 
            { dataElement: "HtT9ChwW8gD", value: event.Date_Of_Birth_Mother },
            { dataElement: "ZhyyJjlmxDO", value: event.Age_of_Mother },
            { dataElement: "rYF3ydwwlxv", value: event.Number_of_prev_pregnancies },
            { dataElement: "Uh0SCXJC1NQ", value: event.Date_Of_Last_Preg },
            { dataElement: "NSw5RqUq6iA", value: event.Live_Birth },
            { dataElement: "mHysvZSoXY7", value: event.Last_preg_issue },
            { dataElement: "AcEUmY63LuN", value: event.Stillbirth },
            { dataElement: "Dr19FvZSxxV", value: event.Alive_Mother },
            { dataElement: "QKJzqnRqg8K", value: event.Abortion_Mother },
            { dataElement: "v0ClgmieSt6", value: event.Stillbirth_checkbx },
            { dataElement: "Y45szE0O36U", value: event.Abortion_Moth_checkbx },
            { dataElement: "WFAvlIXDd79", value: event.Date_Of_Last_Period },
            { dataElement: "xqX9NfHOFLF", value: event.Delivery },
            { dataElement: "HxryIuXhs5b", value: event.Prenatal_care_visits },

            // Assistance at birth
            { dataElement: "tf2G3wqzn4r", value: event.assistanceDoctor },
            { dataElement: "jOJn5Wiuzve", value: event.assistanceOtherTrained },
            { dataElement: "utuCR4s7ENL", value: event.assistanceMidwife },
            { dataElement: "cpReKAH9BfR", value: event.assistanceOther },

            // Child
            { dataElement: "BUdW2wB3LJC", value: event.childOnlyOne },
            { dataElement: "iFghd8bXRJp", value: event.childSecondTwin },
            { dataElement: "O1WxBXgmHrh", value: event.childFirstTwin },
            { dataElement: "Yi4JfhwlLOz", value: event.otherMultipleBirth },

            // I hereby certify
            { dataElement: "u9tYUv6AM51", value: event.I_Attended_Deceased },
            { dataElement: "ZXZZfzBpu8a", value: event.I_Examined_Body },
            { dataElement: "cp5xzqVU2Vw", value: event.I_Conducted_PostMortem },
            { dataElement: "lu9BiHPxNqH", value: event.Other },
            { dataElement: "PaoRZbokFWJ", value: event.examinedBy }
            
        ]
    }
};

/**
 * Synchronizes Doris codes for pending events and sends them to the server
 * 1. Checks if the device is online
 * 2. Finds events without a Doris code in local IndexedDB
 * 3. Computes Doris codes for them using the remote API
 * 4. Updates each event with the computed Doris code
 * 5. Sends events with Doris codes to the remote server
 * 6. Marks sent events as 'synced' in IndexedDB
 */

export const syncDorisAndSend = async (progressCallback?: (progress: number) => void): Promise<SyncResult> => {
    console.log('[DorisSync] Starting sync process...');

    // Verify internet connectivity with explicit logging
    const online = await isInternetAvailable();
    console.log(`[DorisSync] Online status: ${online}`);

    if (!online) {
        console.log('[DorisSync] Offline - skipping sync.');
        return {
            success: false,
            updatedCount: 0,
            sentCount: 0,
            failedCount: 0
        };
    }

    let updatedCount = 0;
    let failedCount = 0;
    let sentCount = 0;
    let sendFailCount = 0;

    // Step 1: Fetch events missing Doris codes
    console.log('[DorisSync] Fetching events missing Doris codes...');
    const eventsWithoutDoris = await getEventsMissingDoris();
    console.log(`[DorisSync] Found ${eventsWithoutDoris.length} events needing Doris codes`);

    // refresh 1: Refresh IndexedDB before computing Doris codes
    await refreshIndexedDB();
    // Process events needing Doris codes
    for (const event of eventsWithoutDoris) {
        try {
            const { id, code1, code2, code3, code4 } = event;
            
            if (!code1 && !code2 && !code3 && !code4) {
                console.log(`[DorisSync] Skipping event ${id}: No codes provided`);
                continue;
            }

            console.log(`[DorisSync] Calling computeDoris API for event ${id}...`);
            const doris = await computeDoris({
                code1: code1 || '',
                code2: code2 || '',
                code3: code3 || '',
                code4: code4 || ''
            });

            if (doris?.code) {
                console.log(`[DorisSync] Updating event ${id} with Doris code: ${doris.code}`);
                await db.events.update(id as number, {
                    Doris_Underlying_Cause: doris.stemCode || '',
                    dorisCode: doris.code,
                    Final_Underlying_Cause: doris.stemCode || '',
                    Final_Underlying_CauseCode: doris.code
                });
                updatedCount++;
                if (progressCallback) progressCallback(updatedCount + failedCount);
            } else {
                console.log(`[DorisSync] No Doris code returned for event ${id}`);
                failedCount++;
            }
        } catch (error) {
            console.error(`[DorisSync] Failed to compute Doris for event ${event.id}:`, error);
            failedCount++;
        }
    }

    // Critical refresh after Doris computation but before sending
    await refreshIndexedDB();
    // Step 2: Find and send events ready for DHIS2 (regardless of whether we just updated any)
    console.log('[DorisSync] Finding events ready to send to server...');
    const eventsReadyToSend = await db.events
        .filter((e): e is FormData => 
            typeof e.dorisCode === 'string' && 
            e.dorisCode.trim() !== '' && 
            e.syncStatus === 'pending')
        .toArray();

    // Send to DHIS2 in controlled batches
    const batchSize = 3; // Conservative starting point
    
    for (let i = 0; i < eventsReadyToSend.length; i += batchSize) {
        const batch = eventsReadyToSend.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map(event => sendToDHIS2(event)));
        
        results.forEach(result => {
            if (result.status === 'fulfilled') sentCount++;
            else sendFailCount++;
        });

        if (progressCallback) progressCallback(i + batch.length);
    }

    console.log(`[DorisSync] Sync process completed: 
        ${updatedCount} updated, 
        ${sentCount} sent, 
        ${failedCount + sendFailCount} failed`);

    return {
        success: (updatedCount > 0 || sentCount > 0),
        updatedCount,
        sentCount,
        failedCount: failedCount + sendFailCount
    };
};