

import React from 'react';

interface CancelAppointmentModalProps {
  isModalOpen: boolean;
  appointmentToCancel: any;
  handleConfirmCancel: () => void;
  handleCloseModal: () => void;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isModalOpen,
  appointmentToCancel,
  handleConfirmCancel,
  handleCloseModal
}) => {
  if (!isModalOpen) return null; // Return nothing if the modal is not open

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Are you sure?</h2>
        <p className="text-gray-600 mb-4">
          Do you really want to cancel the appointment with{" "}
          <strong>{appointmentToCancel?.patientName}</strong>?
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleConfirmCancel}
            className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
          >
            OK
          </button>
          <button
            onClick={handleCloseModal}
            className="w-full px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
