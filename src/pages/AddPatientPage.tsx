import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPatientToDoctor } from "@/services/patientService";
import { useAuth } from "@/contexts/AuthContext";

const AddPatientPage: React.FC = () => {
  const { idoctor } = useParams<{ idoctor: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState<string>("Processing...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idoctor) {
      setMessage("Invalid doctor ID");
      setLoading(false);
      return;
    }

    const addPatient = async () => {
      try {
        const data = await addPatientToDoctor({
          idoctor: idoctor,
          token: user.token,
        });
        setMessage(data.message || "Patient added successfully.");
        console.log("Patient added successfully:", data);
      } catch (error: any) {
        setMessage(error.response?.data?.error || "Failed to add patient.");
      } finally {
        setLoading(false);
      }
    };

    addPatient();
  }, [idoctor]);

  // Redirect to dashboard after 2 seconds when done loading
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.2rem",
      }}
    >
      {message}
    </div>
  );
};

export default AddPatientPage;
