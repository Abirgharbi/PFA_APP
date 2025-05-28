import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, File, FileText, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportType } from '@/models/report';
import { uploadImageForOCR } from '@/services/ocrService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import CameraCapture from '@/components/CameraCapture';

interface OCRTestResult {
  champ: string;
  valeur_and_unite: string;
  valeur?: string;
  unité?: string;
  Valeurs_usuelles?: string;
  etat?: 'Normal' | 'Anormal' | 'inconnu';

  // Accept any number of anteriorite fields dynamically
  [key: `anteriorite ${number}`]: string | undefined;
}


interface OCRResponse {
  Edite_date: string;
  processing_time: number;
  status: string;
  patient_info: {
    name: string;
    title: string;
  };
  tables: {
    [category: string]: OCRTestResult[];
  };
}

interface FormattedOCRData {
  patientInfo: {
    name: string;
    id: string;
    dateOfBirth: string;
  };
  testResultsByCategory: {
    [category: string]: {
      name: string;
      value: string;
      unit: string;
      normalRange: string;
      etat: 'Normal' | 'Abnormal' | 'inconnu';
    }[];
  };
  diagnosis: string;
  recommendations: string;
  processingTime?: number;
}


const ScanReport: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'capture' | 'review'>('capture');
  const [reportType, setReportType] = useState<ReportType>('blood_test');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<FormattedOCRData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
const handleCapture = async () => {
  const url = URL.createObjectURL(image);
  setImageUrl(url);
  setActiveTab('review');
  setIsProcessing(true);
  try {
    // Call your OCR upload function that returns the OCRResponse interface
    const data: OCRResponse = await uploadImageForOCR(image as File,reportType);
    console.log('OCR Data:', data);
    // Validate OCR data - the OCRResponse has tables: { [category: string]: OCRTestResult[] }
if (data.status !== 'success') {
  throw new Error(`OCR échoué: ${data.status}`);
}

    // Flatten all test results from all categories into a single array
    const allTestResults: OCRTestResult[] = Object.values(data.tables).flat();

    // Format the data to your UI needs
const formattedData: FormattedOCRData = {
  patientInfo: {
    name: data.patient_info?.name || '',
    id: '',
    dateOfBirth: '',
  },
  testResultsByCategory: {},
  diagnosis: '',
  recommendations: '',
  processingTime: data.processing_time,
};
// Loop over each category and its array of test results
for (const [category, results] of Object.entries(data.tables)) {
  formattedData.testResultsByCategory[category] = results.map((test) => ({
    name: test.champ,
    value: test.valeur,
    unit: test.unité || '',
    normalRange: test.Valeurs_usuelles || '',
    status: (test.etat === 'inconnu' ? 'Anormal' : 'Normal'),
  }));
}


    setExtractedData(formattedData);
    setPatientName(formattedData.patientInfo.name);
    setPatientId(formattedData.patientInfo.id);
    setTitle(`Analyse sanguine - ${formattedData.patientInfo.name || 'Patient'}`);

    toast.success('Analyse terminée avec succès', {
      description: `Temps de traitement: ${data.processing_time.toFixed(2)} secondes`,
    });
  } catch (error) {
    console.error('Erreur OCR:', error);
    toast.error('Échec de l\'analyse', {
      description: (error as Error).message,
    });
    setExtractedData(null);
  } finally {
    setIsProcessing(false);
  }
};


  const handleSelectFile = (file: File) => {
      setImage(file);
  };
  
  const createReportFromExtractedData = (): any => {
    if (!extractedData || !imageUrl || !user) return null;

    return {
      id: `report_${Date.now()}`,
      imageUrl,
      type: reportType,
      title: title || `Rapport du ${new Date().toLocaleDateString()}`,
      doctorId: user._id,
      doctorName: user.name || 'Dr. Inconnu',
      patientId: patientId || extractedData.patientInfo.id || 'N/A',
      patientName: patientName || extractedData.patientInfo.name || 'Patient Inconnu',
      date: new Date().toISOString(),
      diagnosis: '',
      recommendations: '',
      notes,
      status: 'completed',
    };
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const newReport = createReportFromExtractedData();
      if (!newReport) {
        throw new Error('Données du rapport manquantes');
      }


      toast.success('Rapport enregistré avec succès');
      navigate(`/report/${newReport.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Échec de l\'enregistrement', {
        description: (error as Error).message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Analyse de rapport médical</CardTitle>
              <CardDescription>
                Scanner un document médical pour extraire les informations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'capture' | 'review')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="capture">Capture</TabsTrigger>
                  <TabsTrigger value="review" disabled={!imageUrl}>Vérification</TabsTrigger>
                </TabsList>
                
                <TabsContent value="capture" className="pt-4">
                  <div className="mb-6">
                    <Label htmlFor="reportType" className="mb-2 block">Type de rapport</Label>
                    <Select 
                      value={reportType} 
                      onValueChange={(value) => setReportType(value as ReportType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Analyse sanguine">Analyse sanguine</SelectItem>
                        <SelectItem value="imaging">Imagerie</SelectItem>
                        <SelectItem value="Examen clinique">Examen clinique</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-6">
                    <Label className="mb-2 block">Capturer le document</Label>
                    <CameraCapture 
                      onCapture={handleSelectFile} 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="review" className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Document scanné</Label>
                      <div className="relative border rounded-lg overflow-hidden mb-4 aspect-[4/3] bg-gray-50 flex items-center justify-center">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="Document scanné" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <FileText className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('capture')}
                        className="w-full mb-4"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Nouvelle capture
                      </Button>
                      
                      {isProcessing ? (
                        <div className="flex flex-col items-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Analyse en cours...</p>
                        </div>
                      ) : extractedData ?(
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium">Analyse réussie</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {Object.values(extractedData.testResultsByCategory).flat().length}  paramètres détectés
                          </p>
                          {extractedData.processingTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Temps de traitement: {extractedData.processingTime.toFixed(2)}s
                            </p>
                          )}
                        </div>
                      )  : (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium">Échec de l'analyse</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Veuillez réessayer avec une image plus claire
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Détails du rapport</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Titre du rapport</Label>
                          <Input 
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Analyse sanguine - Jean Dupont"
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="patientName">Nom du patient</Label>
                          <Input 
                            id="patientName"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Nom complet du patient"
                            disabled={isProcessing}
                          />
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes complémentaires</Label>
                          <Textarea 
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observations ou commentaires"
                            rows={3}
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
                            <Button 
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
  {activeTab === 'capture' ? (
    <Button
      className="bg-blue-600 hover:bg-blue-700"
  onClick={() => image && handleCapture()}
      disabled={!image}
    >
      Extraire les données
    </Button>
  ) : (
    <Button
      className="bg-blue-600 hover:bg-blue-700"
      onClick={handleSubmit}
      disabled={isProcessing || isSubmitting || !extractedData}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enregistrement...
        </>
      ) : 'Enregistrer le rapport'}
    </Button>
  )}
</CardFooter>
          </Card>
          
          {extractedData && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2">Résultats extraits</h3>
    
    {Object.entries(extractedData.testResultsByCategory).map(([category, results]) => (
      <div key={category} className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
        <h4 className="text-md font-semibold mb-2">{category}</h4>
        <table className="w-full text-sm table-auto border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 text-left">Paramètre</th>
              <th className="p-2 text-left">Valeur</th>
              <th className="p-2 text-left">Unité</th>
              <th className="p-2 text-left">Valeurs usuelles</th>
              <th className="p-2 text-left">État</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{result.name}</td>
                <td className="p-2">{result.value}</td>
                <td className="p-2">{result.unit}</td>
                <td className="p-2">{result.normalRange}</td>
                <td className="p-2">
                  <span className={result.etat === 'Anormal' ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {result.etat === 'inconnu' ? 'Anormal' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </div>
)}
        </div>
      </main>
    </div>
  );
};

export default ScanReport;