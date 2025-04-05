
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CalendarDays, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Report, 
  getReportStatusColor, 
  getReportTypeLabel 
} from '@/models/report';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  onShare?: (report: Report) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onShare }) => {
  const navigate = useNavigate();
  const viewReport = () => navigate(`/report/${report.id}`);
  
  // Determine the status icon
  const getStatusIcon = () => {
    switch (report.status) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'abnormal':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card className="card-hover overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-medical" />
            <span className="truncate">{report.title}</span>
          </div>
          <div className={cn("px-2 py-0.5 text-xs font-medium text-white rounded-full", getReportStatusColor(report.status))}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Patient:</span>
            <span className="font-medium">{report.patientName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Doctor:</span>
            <span className="font-medium">{report.doctorName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium">{getReportTypeLabel(report.reportType)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {report.date}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 p-4 pt-0">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={viewReport}
        >
          View
        </Button>
        {onShare && (
          <Button
            variant="default"
            className="flex-1 bg-patient hover:bg-patient/90"
            onClick={() => onShare(report)}
          >
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
