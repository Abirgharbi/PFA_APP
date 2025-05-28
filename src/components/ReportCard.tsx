import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CalendarDays, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Share2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Report, getReportStatusColor, getReportTypeLabel } from '@/models/report';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  view?: 'grid' | 'list';
  onShare?: (report: Report) => void;
  onClick?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, view = 'grid', onShare, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/report/${report._id}`, { state: { report } });
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare(report);
  };
  const getOverallStatus = (): string => {
  if (!report?.ocrResult?.tables) return 'Inconnu';

  const allEntries = Object.values(report.ocrResult.tables).flat();

  if (allEntries.length === 0) return 'Inconnu';

  const hasAbnormal = allEntries.some(entry => entry.etat === 'anormale');
  const hasUnknown = allEntries.some(entry =>
    entry.etat === 'inconnu' || entry.etat === 'inconnu'
  );

  if (hasAbnormal) return 'anormale';
  if (hasUnknown) return 'inconnu';
  return 'Normal';
};

  const getStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'Normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Abnormal':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Unknown':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };



  if (view === 'list') {
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{report.title || 'Medical Report'}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {getOverallStatus()}
              </span>
            </div>
            {onShare && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShareClick}
                className="text-gray-500 hover:text-gray-700"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-medical" />
            <span className="truncate">{report.title || 'Medical Report'}</span>
          </div>
          <div className={cn(
            "px-2 py-0.5 text-xs font-medium text-white rounded-full",
            getOverallStatus() === 'Normal' ? 'bg-green-500' :
            getOverallStatus() === 'Abnormal' ? 'bg-yellow-500' :
            'bg-blue-500'
          )}>
            {getOverallStatus()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(report.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium">{getReportTypeLabel(report.reportType)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 p-4 pt-0">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleCardClick}
        >
          View Details
        </Button>
        {onShare && (
          <Button
            variant="default"
            className="flex-1 bg-medical hover:bg-medical/90"
            onClick={handleShareClick}
          >
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportCard;