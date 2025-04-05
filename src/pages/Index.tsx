
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Camera, 
  Share2, 
  Bell, 
  Shield,
  Database, 
  Check
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-1 px-4 py-8">
        {/* Hero section */}
        <section className="max-w-6xl mx-auto py-12 md:py-24 flex flex-col md:flex-row items-center">
          <div className="flex-1 mr-0 md:mr-8 mb-8 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Medical Report Archive Hub
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Digitize, analyze, and share medical reports with powerful OCR technology. Keep your medical data organized and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                className="bg-medical hover:bg-medical-dark text-white px-8 py-6 text-lg"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-medical text-medical hover:bg-medical/10 px-8 py-6 text-lg"
                onClick={() => navigate('/register')}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="w-full h-full bg-gradient-to-br from-medical/20 to-patient/20 rounded-xl absolute top-0 left-0"></div>
              <img 
                src="https://i.imgur.com/LcFBSiy.jpg" 
                alt="Medical Reports" 
                className="rounded-xl shadow-xl relative z-10 max-w-full transform -rotate-2"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg z-20 transform rotate-3">
                <div className="flex items-center text-sm text-green-600 font-semibold">
                  <Check className="w-4 h-4 mr-1" />
                  <span>Analyzed with OCR</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="max-w-6xl mx-auto py-12 md:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Camera className="h-8 w-8 text-medical" />}
              title="Scan Medical Reports"
              description="Easily scan physical medical reports with your device's camera and convert them to digital format using OCR technology."
            />
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-medical" />}
              title="Extract Key Information"
              description="Automatically extract patient information, test results, diagnoses, and recommendations from scanned documents."
            />
            <FeatureCard 
              icon={<Database className="h-8 w-8 text-medical" />}
              title="Organized Archive"
              description="Keep all your medical reports organized in one secure location, categorized by type, date, and patient."
            />
            <FeatureCard 
              icon={<Share2 className="h-8 w-8 text-medical" />}
              title="Secure Sharing"
              description="Securely share reports with other doctors or patients when needed, with full control over who has access."
            />
            <FeatureCard 
              icon={<Bell className="h-8 w-8 text-medical" />}
              title="Follow-up Reminders"
              description="Get notifications for follow-up appointments and tests based on recommendations in your reports."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-medical" />}
              title="Privacy & Security"
              description="Your medical data is protected with industry-standard security practices and encryption."
            />
          </div>
        </section>
        
        {/* User types section */}
        <section className="max-w-6xl mx-auto py-12 md:py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Who Can Benefit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-medical/10 rounded-2xl p-8 border border-medical/20">
              <h3 className="text-2xl font-bold text-medical-dark mb-4">For Doctors</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <Check className="h-6 w-6 text-medical mr-2 flex-shrink-0" />
                  <span>Maintain a digital archive of patient reports</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-medical mr-2 flex-shrink-0" />
                  <span>Easily share reports with colleagues for consultations</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-medical mr-2 flex-shrink-0" />
                  <span>Track patient history and test results over time</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-medical mr-2 flex-shrink-0" />
                  <span>Set follow-up reminders for patients</span>
                </li>
              </ul>
            </div>
            <div className="bg-patient/10 rounded-2xl p-8 border border-patient/20">
              <h3 className="text-2xl font-bold text-patient mb-4">For Patients</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <Check className="h-6 w-6 text-patient mr-2 flex-shrink-0" />
                  <span>Keep all your medical reports in one place</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-patient mr-2 flex-shrink-0" />
                  <span>Receive notifications for upcoming tests and follow-ups</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-patient mr-2 flex-shrink-0" />
                  <span>Share your reports with your doctors</span>
                </li>
                <li className="flex">
                  <Check className="h-6 w-6 text-patient mr-2 flex-shrink-0" />
                  <span>Track your health metrics over time</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="bg-gradient-to-r from-medical to-patient/80 text-white py-12 md:py-20 mt-12 md:mt-20 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start organizing your medical reports?</h2>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Join thousands of doctors and patients who are already using our platform to manage their medical reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-white text-medical hover:bg-gray-100 px-8"
              >
                Create an Account
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/login')}
                className="border-white text-white hover:bg-white/20 px-8"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-medical text-white mr-2">
                <span className="font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-semibold text-medical-dark">MediArchive</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MediArchive. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
