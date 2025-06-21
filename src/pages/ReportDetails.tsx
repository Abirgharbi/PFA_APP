import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Calendar,
  Share2,
  Download,
  ArrowLeft,
  Edit,
  Trash,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { cn } from "@/lib/utils";
import {
  Report,
  getReportStatusColor,
  getTestResultColor,
} from "@/models/report";

const ReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [report, setReport] = useState<Report | null>(
    location.state?.report || null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!report) {
      // Try to find report in localStorage
      const savedReports = JSON.parse(localStorage.getItem("reports") || "[]");
      const foundReport = savedReports.find((r: Report) => r._id === id);

      if (foundReport) {
        setReport(foundReport);
      } else {
        toast.error("Report not found");
        navigate("/archive");
      }
    }
  }, [id, isAuthenticated, navigate, report]);
  console.log("Report Details:", report);
  const totalParametersCount = Object.values(report.ocrResult.tables).flat()
    .length;

  const handleShareReport = () => {
    if (!report) return;
    navigate(`/share/${report._id}`, { state: { report } });
  };

  const handleDeleteReport = () => {
    setShowDeleteDialog(false);
    navigate("/archive");
  };

  const handlePrintReport = () => {};

  const handleDownloadReport = () => {};
  const getOverallStatus = (): string => {
    if (!report?.ocrResult?.tables) return "Inconnu";

    const allEntries = Object.values(report.ocrResult.tables).flat();

    if (allEntries.length === 0) return "Inconnu";

    const hasAbnormal = allEntries.some((entry) => entry.etat === "Anormal");
    const hasUnknown = allEntries.some(
      (entry) => entry.etat === "inconnu" || entry.etat === "inconnu"
    );

    if (hasAbnormal) return "Anormal";
    if (hasUnknown) return "inconnu";
    return "Normal";
  };

  if (!report) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Report...</h2>
            <p className="text-gray-500">Please wait</p>
          </div>
        </main>
      </div>
    );
  }
  console.log(report.ocrResult.tables);
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 sm:mb-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleShareReport}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintReport}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Edit")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold mb-2">Medical Report</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Report ID: {report._id}</span>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-full text-white font-medium text-sm",
                getReportStatusColor(getOverallStatus())
              )}
            >
              {getOverallStatus()}
            </div>
          </div>

          <Tabs defaultValue="results">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="image" onClick={() => setShowImage(true)}>
                Original Image
              </TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
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
                                className="py-4 px-4 font-bold bg-gray-100 text-gray-800 text-center"
                              >
                                {tableName}
                              </td>
                            </tr>
                            {parameters.map((param, index) => (
                              <tr
                                key={index}
                                className="border-b hover:bg-gray-50"
                              >
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

            <TabsContent value="image">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Original Report Image
                </h2>

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
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4">Report Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Report Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Report ID</p>
                        <p className="font-medium">{report._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full mr-2",
                              getReportStatusColor(getOverallStatus())
                            )}
                          />
                          <p className="font-medium">{getOverallStatus()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Processing Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Processing Time</p>
                        <p className="font-medium">
                          {report.ocrResult.processing_time.toFixed(2)} seconds
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Parameters Extracted
                        </p>
                        <p className="font-medium">{totalParametersCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetails;
