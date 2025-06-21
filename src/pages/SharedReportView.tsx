import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { FileText, ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { acceptSharedReport, getSharedReport } from "@/services/archiveService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Report,
  getReportStatusColor,
  getTestResultColor,
} from "@/models/report";
import { useAuth } from "@/contexts/AuthContext";

const SharedReportView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [report, setReport] = useState<Report | null>(
    location.state?.report || null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        const email = searchParams.get("email");
        console.log("Chargement du rapport avec ID:", id, "et email:", email);
        const reportData = await getSharedReport(id!, email || undefined);

        if (!reportData) {
          throw new Error("Rapport vide");
        }

        setReport(reportData);
      } catch (error) {
        console.error("Échec du chargement:", error);
        toast.error("Impossible de charger le rapport. Vérifiez votre accès.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadReport();
    }
  }, [id, navigate, searchParams]);

  const handleAccept = async () => {
    try {
      if (user.role !== "doctor") {
        toast.error("Only doctors can accept shared reports.");
        return;
      }

      await acceptSharedReport(id, user.token);
      navigate("/dashboard"); // Redirect to dashboard after accepting
    } catch (error) {
      console.error("Failed to accept report:", error);
      alert("An error occurred while accepting the report.");
    }
  };

  const getTestResultColor = (status?: string) => {
    switch (status) {
      case "Normal":
        return "text-green-600";
      case "Anormal":
        return "text-yellow-600";
      case "Intervalle inconnu":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Chargement du rapport...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileText className="h-12 w-12 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Rapport non disponible</h2>
        <p className="text-gray-500 mb-4">
          Vous n'avez pas accès à ce rapport ou il a été supprimé
        </p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    );
  }

  console.log("État actuel:", {
    isLoading,
    report,
    searchParams: Object.fromEntries(searchParams.entries()),
  });
  console.log("Report data:", report.imageUrl);
  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2" /> Retour
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> {report.title || "Rapport Médical"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Patient</p>
              <p>{report.patientName || "Non spécifié"}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Date</p>
                <p>{new Date(report.date).toLocaleDateString()}</p>
              </div>
              <Button onClick={handleAccept} className="ml-4">
                Accepter le rapport
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="results" className="w-full justify-center">
            Résultats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Test
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Value
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      unité
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Normal Range
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.ocrResult.tables).map(
                    ([tableName, parameters]) => (
                      <React.Fragment key={tableName}>
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 px-4 font-bold bg-gray-100 text-gray-800 text-left"
                          >
                            {tableName}
                          </td>
                        </tr>
                        {parameters.map((param, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{param.champ}</td>
                            <td
                              className={cn(
                                "py-3 px-4 font-medium",
                                getTestResultColor(param.etat)
                              )}
                            >
                              {param.valeur || "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {param.unité || "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {param.Valeurs_usuelles || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                  param.etat === "bonne"
                                    ? "bg-green-100 text-green-800"
                                    : param.etat === "anormale"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : param.etat === "inconnu"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {param.etat || "Non spécifié"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {report.imageUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Image Médicale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start">
              {report.imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={`http://4.233.146.155:5000/${report.imageUrl}`}
                    alt="Original report"
                    className="max-w-full rounded-md border border-gray-200 shadow-sm"
                    style={{ maxHeight: "800px" }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No image available for this report
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  const imageUrl = `http://4.233.146.155:5000/${report.imageUrl}`;
                  const response = await fetch(imageUrl);
                  const blob = await response.blob();

                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `rapport-${id}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Télécharger l'image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharedReportView;
