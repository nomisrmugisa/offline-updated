import React, { useEffect, useState, useRef } from 'react';
import useFacilityStore from '../stores/useFacilityStore';

// Add Facility interface based on what's used in the component
interface Facility {
  id: string;
  name: string;
}

interface FacilitySelectProps {
  id?: string;
  name?: string;
  className?: string;
}

const FacilitySelect: React.FC<FacilitySelectProps> = ({
  id = 'facility',
  name = 'facility',
  className = 'form-select',
}) => {
  const { facilities, fetchFacilities, selectedFacility, setSelectedFacility } = useFacilityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    // Filter facilities based on search term
    if (searchTerm.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      const filtered = facilities.filter((facility) => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFacilities(filtered);
    }
  }, [searchTerm, facilities]);

  useEffect(() => {
    // Add click outside listener to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Hidden original select for form submission compatibility */}
      <select 
        id={id} 
        name={name} 
        value={selectedFacility?.id || ''} 
        className="d-none"
      >
        <option value=""></option>
        {facilities.map((facility) => (
          <option key={facility.id} value={facility.id}>
            {facility.name}
          </option>
        ))}
      </select>
      
      {/* Integrated searchable dropdown */}
      <div className={`${className} p-0 ${isOpen ? 'active' : ''}`} style={{ overflow: 'visible' }}>
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={(e) => {
              // Don't close if clicking on dropdown items
              if (!e.relatedTarget || !e.relatedTarget.classList.contains('dropdown-item')) {
                // Keep dropdown open while typing
              }
            }}
          />
        ) : (
          <div 
            className="d-flex justify-content-between align-items-center px-2 py-1"
            onClick={toggleDropdown}
            style={{ cursor: 'pointer', height: '100%', width: '200px'}}
          >
            <span>{selectedFacility?.name || 'Select Facility'}</span>
            {/* <span>▼</span> */}
          </div>
        )}
        
        {isOpen && (
          <div className="dropdown-menu show w-100 position-absolute mt-1" style={{ zIndex: 1000 }}>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredFacilities.length > 0 ? (
                filteredFacilities.map((facility) => (
                  <button
                    key={facility.id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleFacilitySelect(facility)}
                  >
                    {facility.name}
                  </button>
                ))
              ) : (
                <div className="dropdown-item text-muted">No facilities found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitySelect;