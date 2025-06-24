import React, { useEffect, useState } from 'react';
import { getEventData, deleteEvent } from '../stores/useEventsDB';
import { FormData } from '../types/FormData';

type EventListModalProps = {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>; 
  onDelete: () => void;
};

const EventListModal: React.FC<EventListModalProps> = ({ setFormData, onDelete }) => {
  const [events, setEvents] = useState<FormData[]>([]); // State for storing events
//   const closeRef = useRef();

//   // Function to close the modal
//   const closeModal = () => {
//     closeRef.current?.click()
//   };

useEffect(() => {
    const fetchEvents = async () => {
      const eventsFromDB = await getEventData(); // Fetch events from Dexie DB
      setEvents(eventsFromDB); // Set events into state
    };

    const modalElement = document.getElementById('eventListModal');

    const handleShowModal = () => {
      fetchEvents(); // Fetch events whenever the modal opens
    };

    // Listen for the 'show.bs.modal' event to fetch events
    modalElement?.addEventListener('show.bs.modal', handleShowModal);

    // Cleanup the event listener when component unmounts
    return () => {
      modalElement?.removeEventListener('show.bs.modal', handleShowModal);
    };
  }, []);

  // Handle editing an event
  const handleEdit = (event: FormData) => {
    setFormData(event); // Set the selected event data into the form state
    // closeModal();
  };

  const handleDelete = async (event: FormData) => {
    if (!event.id) return;
    try {
      await deleteEvent(event.id); // Delete the event from the DB
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
      onDelete?.();
      console.log('Event deleted successfully!');
      // You can also trigger the re-fetch of events here if you're using state to manage them
    } catch (error) {
      alert('Error deleting event');
    }
  };
  

  return (
    <div className="modal fade" id="eventListModal" tabIndex={-1} aria-labelledby="eventListModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="eventListModalLabel">Records of Deceased</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {/* Event List */}
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.Name}</td>
                    <td>{event.Age?.Years}</td>
                    <td>{event.Sex}</td>
                    <td>
                      <button className="btn btn-sm edit px-2" data-bs-dismiss="modal" aria-label="Edit and Close" onClick={() => handleEdit(event)}>Edit</button>
                      <button className="btn btn-sm del ms-3" onClick={() => handleDelete(event)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventListModal;
