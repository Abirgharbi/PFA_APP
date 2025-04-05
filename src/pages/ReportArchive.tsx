
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Plus, 
  SlidersHorizontal,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Report, 
  ReportType, 
  ReportStatus, 
  getReportsForUser,
  getReportTypeLabel
} from '@/models/report';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import ReportCard from '@/components/ReportCard';

const ReportArchive: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'month' | 'year'>('all');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load reports if user is authenticated
    if (user) {
      const userReports = getReportsForUser(user.id, user.role);
      setReports(userReports);
      setFilteredReports(userReports);
    }
  }, [user, isAuthenticated, navigate]);
  
  useEffect(() => {
    if (!reports.length) return;
    
    let filtered = [...reports];
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => (
        report.title.toLowerCase().includes(query) || 
        report.patientName.toLowerCase().includes(query) ||
        report.doctorName.toLowerCase().includes(query)
      ));
    }
    
    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(report => selectedTypes.includes(report.reportType));
    }
    
    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(report => selectedStatuses.includes(report.status));
    }
    
    // Apply date filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      if (selectedDateRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (selectedDateRange === 'year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(report => new Date(report.date) >= cutoffDate);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchQuery, selectedTypes, selectedStatuses, selectedDateRange]);
  
  const handleShare = (report: Report) => {
    navigate(`/share/${report.id}`);
  };
  
  const handleFilterTypeChange = (type: ReportType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const handleFilterStatusChange = (status: ReportStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedDateRange('all');
    setSearchQuery('');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Report Archive</h1>
              <p className="text-gray-600 mt-1">
                All your medical reports in one place
              </p>
            </div>
            <div>
              <Button 
                onClick={() => navigate('/scan')}
                className="bg-medical hover:bg-medical-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Report
              </Button>
            </div>
          </div>
          
          {/* Search and filter section */}
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
                      {(selectedTypes.length > 0 || selectedStatuses.length > 0 || selectedDateRange !== 'all') && (
                        <Badge className="ml-1 bg-medical text-white">{selectedTypes.length + selectedStatuses.length + (selectedDateRange !== 'all' ? 1 : 0)}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Filters</h3>
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                          Clear all
                        </Button>
                      </div>
                      
                      {/* Type filters */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                          <h4 className="text-sm font-medium">Report Type</h4>
                          <SlidersHorizontal className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-blood-test"
                                checked={selectedTypes.includes('blood_test')}
                                onCheckedChange={() => handleFilterTypeChange('blood_test')}
                              />
                              <Label htmlFor="filter-blood-test">Blood Tests</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-imaging"
                                checked={selectedTypes.includes('imaging')}
                                onCheckedChange={() => handleFilterTypeChange('imaging')}
                              />
                              <Label htmlFor="filter-imaging">Imaging</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-physical-exam"
                                checked={selectedTypes.includes('physical_exam')}
                                onCheckedChange={() => handleFilterTypeChange('physical_exam')}
                              />
                              <Label htmlFor="filter-physical-exam">Physical Examinations</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-pathology"
                                checked={selectedTypes.includes('pathology')}
                                onCheckedChange={() => handleFilterTypeChange('pathology')}
                              />
                              <Label htmlFor="filter-pathology">Pathology</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-other"
                                checked={selectedTypes.includes('other')}
                                onCheckedChange={() => handleFilterTypeChange('other')}
                              />
                              <Label htmlFor="filter-other">Other</Label>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Status filters */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                          <h4 className="text-sm font-medium">Status</h4>
                          <SlidersHorizontal className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-normal"
                                checked={selectedStatuses.includes('normal')}
                                onCheckedChange={() => handleFilterStatusChange('normal')}
                              />
                              <Label htmlFor="filter-normal" className="flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                Normal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-abnormal"
                                checked={selectedStatuses.includes('abnormal')}
                                onCheckedChange={() => handleFilterStatusChange('abnormal')}
                              />
                              <Label htmlFor="filter-abnormal" className="flex items-center">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                Abnormal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-critical"
                                checked={selectedStatuses.includes('critical')}
                                onCheckedChange={() => handleFilterStatusChange('critical')}
                              />
                              <Label htmlFor="filter-critical" className="flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                Critical
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="filter-pending"
                                checked={selectedStatuses.includes('pending')}
                                onCheckedChange={() => handleFilterStatusChange('pending')}
                              />
                              <Label htmlFor="filter-pending" className="flex items-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                Pending
                              </Label>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      
                      {/* Date range filters */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Date Range</h4>
                        <Select
                          value={selectedDateRange}
                          onValueChange={(value) => setSelectedDateRange(value as 'all' | 'month' | 'year')}
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
                
                <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
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
            
            {/* Active filters display */}
            {(selectedTypes.length > 0 || selectedStatuses.length > 0 || selectedDateRange !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedDateRange !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedDateRange === 'month' ? 'Last Month' : 'Last Year'}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setSelectedDateRange('all')}
                    />
                  </Badge>
                )}
                
                {selectedTypes.map(type => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {getReportTypeLabel(type)}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterTypeChange(type)}
                    />
                  </Badge>
                ))}
                
                {selectedStatuses.map(status => (
                  <Badge key={status} variant="secondary" className="flex items-center gap-1">
                    <span 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        status === 'normal' ? "bg-green-500" :
                        status === 'abnormal' ? "bg-yellow-500" :
                        status === 'critical' ? "bg-red-500" :
                        "bg-blue-500"
                      )}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleFilterStatusChange(status)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Reports grid */}
          <div className="mb-8">
            {filteredReports.length > 0 ? (
              <>
                <div className={cn(
                  view === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-3"
                )}>
                  {filteredReports.map((report) => (
                    view === 'grid' ? (
                      <ReportCard 
                        key={report.id} 
                        report={report} 
                        onShare={handleShare}
                      />
                    ) : (
                      <div 
                        key={report.id}
                        className="flex bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/report/${report.id}`)}
                      >
                        <div className="mr-4 flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            {report.imageUrl ? (
                              <img 
                                src={report.imageUrl} 
                                alt={report.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{report.title}</h3>
                            <div className={cn(
                              "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                              report.status === 'normal' ? "bg-green-500" :
                              report.status === 'abnormal' ? "bg-yellow-500" :
                              report.status === 'critical' ? "bg-red-500" :
                              "bg-blue-500"
                            )}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{report.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm">
                              <span className="text-gray-500">Patient: </span>
                              <span className="font-medium">{report.patientName}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {getReportTypeLabel(report.reportType)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                
                {/* Show count of reports */}
                <p className="text-gray-500 text-sm mt-6">
                  Showing {filteredReports.length} of {reports.length} reports
                </p>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {reports.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No matching reports</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                    <p className="text-gray-500 mb-4">Start by scanning or uploading your first medical report</p>
                    <Button 
                      onClick={() => navigate('/scan')}
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
