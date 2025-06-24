import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityData } from '../types/Facility';

let url = '/assets/MasterFacility.json';

interface FacilityStore {
  facilities: Facility[];
  selectedFacility: Facility | null;
  loading: boolean;
  error: string | null;
  fetchFacilities: () => Promise<void>;
  setSelectedFacility: (facility: Facility | null) => void;
}

const useFacilityStore = create<FacilityStore>()(
  persist(
    (set, get) => ({
      facilities: [],
      selectedFacility: null,
      loading: false,
      error: null,

      fetchFacilities: async () => {
        if (get().facilities.length) return; // Prevent re-fetching

        set({ loading: true, error: null });

        try {
          const response = await fetch(url);
          const data: FacilityData = await response.json();

          set({ facilities: data?.organisationUnits, loading: false });
        } catch (error) {
          console.error('Error fetching facilities:', error);
          set({ error: 'Failed to load facilities', loading: false });
        }
      },

      setSelectedFacility: (facility) => set({ selectedFacility: facility }),
    }),
    { name: 'facility-store' } // Stores selectedFacility in localStorage
  )
);

export default useFacilityStore;
