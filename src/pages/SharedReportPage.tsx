import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedReport } from "@/services/archiveService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SharedReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get("email");
        const reportData = await getSharedReport(id!, email || undefined);
        setReport(reportData);
      } catch (error) {
        navigate("/error", { state: { message: "Rapport non disponible" } });
      }
    };

    loadReport();
  }, [id, navigate]);

  if (!report) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> {report.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Patient</p>
              <p>{report.patientName || "Non spécifié"}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p>{new Date(report.date).toLocaleDateString()}</p>
            </div>
          </div>

          {report.findings && (
            <div className="mt-4">
              <p className="font-medium">Résultats</p>
              <p className="whitespace-pre-line">{report.findings}</p>
            </div>
          )}

          {report.imageUrl && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Image médicale</p>
                <a href={report.imageUrl} download>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Télécharger
                  </Button>
                </a>
              </div>
              <img
                src={report.imageUrl}
                alt="Rapport médical"
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedReportPage;
