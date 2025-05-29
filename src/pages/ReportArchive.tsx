import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Search,
  Plus,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Report,
  ReportType,
  getReportTypeLabel,
  ReportTypes,
} from "@/models/report";
import { getReportsForUser } from "@/services/archiveService";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/AppHeader";
import ReportCard from "@/components/ReportCard";
import { toast } from "sonner";

const ReportArchive: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<
    "all" | "month" | "year"
  >("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        if (user?.token) {
          const reportsData = await getReportsForUser(user.token);
          setReports(reportsData);
          setFilteredReports(reportsData);
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (!reports.length) return;

    let filtered = [...reports];

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          (report.patientId &&
            report.patientId.toLowerCase().includes(query)) ||
          report.date.includes(query)
      );
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((report) =>
        selectedTypes.includes(report.reportType)
      );
    }

    // Apply date filter
    if (selectedDateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      if (selectedDateRange === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (selectedDateRange === "year") {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter(
        (report) => new Date(report.date) >= cutoffDate
      );
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, selectedTypes, selectedDateRange]);

  const handleShare = (report: Report) => {
    navigate(`/share/${report._id}`, { state: { report } });
  };

  const handleFilterTypeChange = (type: ReportType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedDateRange("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Report Archive
              </h1>
              <p className="text-gray-600 mt-1">
                All your medical reports in one place
              </p>
            </div>
            <div>
              <Button
                onClick={() => navigate("/scan")}
                className="bg-medical hover:bg-medical-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Report
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">Filters</span>
                      {(selectedTypes.length > 0 ||
                        selectedDateRange !== "all") && (
                        <Badge className="ml-1 bg-medical text-white">
                          {selectedTypes.length +
                            (selectedDateRange !== "all" ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 text-xs"
                        >
                          Clear all
                        </Button>
                      </div>

                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                          <h4 className="text-sm font-medium">Report Type</h4>
                          <SlidersHorizontal className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            {ReportTypes.map((type) => (
                              <div
                                key={type}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`filter-${type}`}
                                  checked={selectedTypes.includes(type)}
                                  onCheckedChange={() =>
                                    handleFilterTypeChange(type)
                                  }
                                />
                                <Label htmlFor={`filter-${type}`}>
                                  {getReportTypeLabel(type)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Date Range</h4>
                        <Select
                          value={selectedDateRange}
                          onValueChange={(value) =>
                            setSelectedDateRange(
                              value as "all" | "month" | "year"
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Tabs
                  value={view}
                  onValueChange={(v) => setView(v as "grid" | "list")}
                >
                  <TabsList>
                    <TabsTrigger value="grid" className="px-3">
                      <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                        <div className="bg-current rounded-sm" />
                        <div className="bg-current rounded-sm" />
                        <div className="bg-current rounded-sm" />
                        <div className="bg-current rounded-sm" />
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="px-3">
                      <div className="flex flex-col justify-between h-4 w-4">
                        <div className="h-0.5 w-full bg-current rounded-sm" />
                        <div className="h-0.5 w-full bg-current rounded-sm" />
                        <div className="h-0.5 w-full bg-current rounded-sm" />
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {(selectedTypes.length > 0 || selectedDateRange !== "all") && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedDateRange !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    {selectedDateRange === "month" ? "Last Month" : "Last Year"}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setSelectedDateRange("all")}
                    />
                  </Badge>
                )}

                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {getReportTypeLabel(type)}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterTypeChange(type)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            {filteredReports.length > 0 ? (
              <>
                <div
                  className={cn(
                    view === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "space-y-3"
                  )}
                >
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report._id}
                      report={report}
                      view={view}
                      onShare={handleShare}
                    />
                  ))}
                </div>

                <p className="text-gray-500 text-sm mt-6">
                  Showing {filteredReports.length} of {reports.length} reports
                </p>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {reports.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">
                      No matching reports
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your filters or search query
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                    <p className="text-gray-500 mb-4">
                      Start by scanning your first medical report
                    </p>
                    <Button
                      onClick={() => navigate("/scan")}
                      className="bg-medical hover:bg-medical-dark"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Report
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportArchive;
