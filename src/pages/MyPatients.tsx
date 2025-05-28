import React, { useState } from 'react';
import PatientPage from './PatientPage';
import ReportsAnalytics from './ReportsAnalytics';
import AppHeader from '@/components/AppHeader';


const MyPatients = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  return (
      <div className="flex flex-col h-screen">
        <AppHeader></AppHeader>
    <div className="flex flex-1 bg-gray-50 overflow-hidden">
      {/* Sidebar - Patient Selection (1/3 width) */}
      <div className="w-1/3 p-4 border-r border-gray-200 overflow-y-auto">
        <PatientPage 
          onSelectPatient={setSelectedPatientId} 
        />
      </div>

      {/* Main Content - Analytics (2/3 width) */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {selectedPatientId ? (
          <ReportsAnalytics patientId={selectedPatientId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Sélectionnez un patient pour voir ses statistiques</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default MyPatients;