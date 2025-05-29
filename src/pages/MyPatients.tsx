import React, { useState } from "react";
import PatientPage from "./PatientPage";
import ReportsAnalytics from "./ReportsAnalytics";
import AppHeader from "@/components/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { createFollowUp } from "@/services/notificationService";
import { toast } from "sonner";

const MyPatients = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [details, setDetails] = useState("");
  const handleCreateFollowUp = async () => {
    if (!selectedPatientId) return;

    try {
      const response = await createFollowUp(
        selectedPatientId,
        followUpDate,
        details
      );

      toast.success("Suivi créé avec succès!");

      setFollowUpDate("");
      setDetails("");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du suivi.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <div className="flex flex-1 bg-gray-50 overflow-hidden flex-col md:flex-row">
        {/* PatientPage on top on mobile, left on desktop */}
        <div className="w-full md:w-1/3 p-4 border-b border-gray-200 md:border-b-0 md:border-r md:overflow-y-auto">
          <PatientPage onSelectPatient={setSelectedPatientId} />
        </div>

        {/* ReportsAnalytics below on mobile, right on desktop */}
        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
          {selectedPatientId ? (
            <>
              <div className="mt-6 flex justify-end">
                <Button
                  className="bg-medical hover:bg-medical-dark"
                  onClick={() => setShowModal(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Follow-Up
                </Button>
              </div>
              <ReportsAnalytics patientId={selectedPatientId} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Sélectionnez un patient pour voir ses statistiques
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Follow-Up Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Follow-Up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              placeholder="Follow-up date"
            />
            <Textarea
              placeholder="Details about the follow-up"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFollowUp}
              className="bg-medical hover:bg-medical-dark"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPatients;
