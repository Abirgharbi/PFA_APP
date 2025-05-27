import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {  acceptSharedReport, getSharedReport } from '@/services/archiveService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Report, getReportStatusColor, getTestResultColor } from '@/models/report';
import { useAuth } from '@/contexts/AuthContext';


const SharedReportView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
   const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [report, setReport] = useState<Report | null>(location.state?.report || null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadReport = async () => {
    try {
      setIsLoading(true);
      const email = searchParams.get('email');
      
      const reportData = await getSharedReport(id!, email || undefined);
      
      if (!reportData) {
        throw new Error('Rapport vide');
      }
      
      setReport(reportData);
    } catch (error) {
      console.error('Échec du chargement:', error);
      toast.error('Impossible de charger le rapport. Vérifiez votre accès.');
      navigate('/login');
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
      await acceptSharedReport(id, user.token);
      navigate('/mes-rapports'); // Rediriger vers la liste des rapports
    } catch (error) {
      console.error('Failed to accept report:', error);
    }
  };

  const getTestResultColor = (status?: string) => {
    switch (status) {
      case 'Normal': return 'text-green-600';
      case 'Anormal': return 'text-yellow-600';
      case 'Intervalle inconnu': return 'text-blue-600';
      default: return 'text-gray-600';
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
        <p className="text-gray-500 mb-4">Vous n'avez pas accès à ce rapport ou il a été supprimé</p>
        <Button onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  console.log('État actuel:', {
  isLoading,
  report,
  searchParams: Object.fromEntries(searchParams.entries())
});

  return (

    
    <div className="container mx-auto p-4">

        
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2" /> Retour
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> {report.title || 'Rapport Médical'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Patient</p>
              <p>{report.patientId || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p>{new Date(report.date).toLocaleDateString()}</p>
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
          <Card>
            <CardContent className="p-6">
              {report.ocrResult?.parameters?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.ocrResult.parameters.map((param, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{param.champ}</td>
                          <td className={cn("px-6 py-4 whitespace-nowrap text-sm font-medium", getTestResultColor(param.état))}>
                            {param.valeur}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{param.unité || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{param.référence || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                              param.état === 'Normal' ? 'bg-green-100 text-green-800' :
                              param.état === 'Anormal' ? 'bg-yellow-100 text-yellow-800' :
                              param.état === 'Intervalle inconnu' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {param.état || 'Non spécifié'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Aucun résultat de test disponible</p>
              )}
            </CardContent>
          </Card>
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
                                    src={`http://localhost:3000/${report.imageUrl}`}
                                    alt="Original report" 
                                    className="max-w-full rounded-md border border-gray-200 shadow-sm"
                                    style={{ maxHeight: '800px' }}
                                  />
                                </div>
                              ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-md">
                                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-500">No image available for this report</p>
                                </div>
                              )}
<Button
  variant="outline"
  onClick={async () => {
    const imageUrl = `http://localhost:3000/${report.imageUrl}`;
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const link = document.createElement('a');
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