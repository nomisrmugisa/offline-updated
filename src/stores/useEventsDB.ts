import Dexie from 'dexie';
import { FormData } from '../types/FormData';

// Define the structure of the event DB
class EventDB extends Dexie {
  events: Dexie.Table<FormData, number>;

  constructor() {
    super('EventDB');
    this.version(1).stores({
      events: '++id, MOH_National_Case_Number, Name, syncStatus, facility',
    });
    this.events = this.table('events');
  }
}

const db = new EventDB();

// Enhanced version with better debugging
export const getEventsMissingDoris = async (): Promise<FormData[]> => {
  try {
    console.log('[EventsDB] Starting search for events missing Doris codes');
    
    // First, get all events to see what's in the database
    const allEvents = await db.events.toArray();
    console.log(`[EventsDB] Total events in database: ${allEvents.length}`);
    
    // Log a summary of all events for debugging
    allEvents.forEach(event => {
      console.log(`[EventsDB] Event ${event.id}: dorisCode=${event.dorisCode || 'empty'}, ` +
                  `codes=[${event.code1 || ''}, ${event.code2 || ''}, ${event.code3 || ''}, ${event.code4 || ''}], ` +
                  `syncStatus=${event.syncStatus}`);
    });

    // Now get only events missing Doris that need processing
    const filteredEvents = await db.events
      .filter(event => {
        // Check for empty or missing dorisCode
        const hasNoDorisCode = !event.dorisCode || event.dorisCode.trim() === '';
        
        // Check if at least one ICD code exists
        const hasAtLeastOneCode = Boolean(event.code1 || event.code2 || event.code3 || event.code4);
        
        // Check if event is pending sync
        const isPending = event.syncStatus === 'pending';
        
        // Log the filter result for each event
        console.log(`[EventsDB] Filter check for event ${event.id}: ` +
                    `hasNoDorisCode=${hasNoDorisCode}, ` +
                    `hasAtLeastOneCode=${hasAtLeastOneCode}, ` +
                    `isPending=${isPending}, ` +
                    `matching=${hasNoDorisCode && hasAtLeastOneCode && isPending}`);
        
        return hasNoDorisCode && hasAtLeastOneCode && isPending;
      })
      .toArray();
    
    console.log(`[EventsDB] Found ${filteredEvents.length} events missing Doris codes that need processing`);
    return filteredEvents;
  } catch (error) {
    console.error('[EventsDB] Failed to fetch events without Doris:', error);
    return [];
  }
};

export const addEvent = async (data: FormData) => {
  try {
    const eventWithSyncStatus: FormData = { ...data, syncStatus: 'pending' };
    const id = await db.events.add(eventWithSyncStatus);
    console.log(`[EventsDB] Added new event with id ${id}`);
    return id;
  } catch (error) {
    console.error('[EventsDB] Failed to add event data:', error);
    throw error;
  }
};

export const updateSyncStatus = async (id: number, status: 'pending' | 'synced') => {
  try {
    console.log(`[EventsDB] Updating sync status for event ${id} to ${status}`);
    await db.events.update(id, { syncStatus: status });
    
    // Verify the update
    const updated = await db.events.get(id);
    console.log(`[EventsDB] Verification - Event ${id} syncStatus after update: ${updated?.syncStatus}`);
  } catch (error) {
    console.error(`[EventsDB] Failed to update sync status for event ${id}:`, error);
    throw error;
  }
};

// Other functions remain unchanged
export const deleteEvent = async (id: number) => {
  try {
    await db.events.delete(id);
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
};

export const getEventData = async () => {
  try {
    return await db.events.toArray();
  } catch (error) {
    console.error('Failed to get event data:', error);
    throw error;
  }
};

export const clearEventData = async () => {
  try {
    await db.events.clear();
  } catch (error) {
    console.error('Failed to clear event data:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const events = await db.events.toArray();
    const total = events.length;
    const sent = events.filter((event) => event.syncStatus === 'synced').length;
    const notSent = events.filter((event) => event.syncStatus === 'pending').length;

    return { total, sent, notSent };
  } catch (error) {
    console.error('Failed to get stats:', error);
    throw error;
  }
};

export default db;