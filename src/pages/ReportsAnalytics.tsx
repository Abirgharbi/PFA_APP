import React, { useEffect, useState } from 'react';
import { fetchReportAnalytics, ReportAnalytics } from '../services/reportService';
import { Bar, Line, Pie } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportsAnalyticsProps {
  patientId: string;
}

const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ patientId }) => {
  const [data, setData] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const analytics = await fetchReportAnalytics(patientId);
        setData(analytics);

        if (analytics.resulte.length > 0) {
          setSelectedField(analytics.resulte[0].champ);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#5A5C69' }}>Chargement des données...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#E74A3B' }}>Erreur : {error}</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#5A5C69' }}>Aucune donnée disponible</div>;

  const results = data.resulte || [];
  const reports = data.rapports || [];

  const availableFields = Array.from(new Set(results.map(r => r.champ)));
  const filteredData = results.filter(r => r.champ === selectedField);

  // Line Chart Data
  const lineData = {
    labels: filteredData.map(r => new Date(r.date.split('/').reverse().join('-'))),
    datasets: [{
      label: `${selectedField} (${filteredData[0]?.unité || ''})`,
      data: filteredData.map(r => r.valeur),
      fill: false,
      borderColor: '#4E73DF',
      backgroundColor: '#4E73DF',
      tension: 0.4,
      pointBackgroundColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20,
        right: 10
      }
    },
    plugins: {
      title: {
        display: true,
        text: `Évolution de ${selectedField}`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#2E59D9',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 4,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].label);
            return date.toLocaleDateString('fr-FR');
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy'
          },
          tooltipFormat: 'dd/MM/yyyy'
        },
        grid: {
          display: false,
       
        },
        title: {
          display: true,
          text: 'Période',
          font: {
            weight: 'bold' as const
          },
          padding: { top: 7, bottom: 30 }
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        title: {
          display: true,
          text: filteredData[0]?.unité || 'Valeur',
          font: {
            weight: 'bold' as const
          },
          padding: { top: 0, bottom: 10 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',

        },
        ticks: {
          padding: 10
        }
      }
    }
  };

  // Bar Chart Data
  const barData = {
    labels: ['Total des rapports'],
    datasets: [{
      label: 'Nombre de rapports',
      data: [data.totalrapport],
      backgroundColor: '#1CC88A',
      hoverBackgroundColor: '#17A673',
      borderColor: '#1CC88A',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Total des rapports médicaux',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#36B9CC',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 4
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Pie Chart Data
  const pieData = {
    labels: reports.map(r => r.date),
    datasets: [{
      data: reports.map(r => r.number),
      backgroundColor: [
        '#4E73DF',
        '#1CC88A',
        '#36B9CC',
        '#F6C23E',
        '#E74A3B',
        '#858796'
      ],
      hoverBackgroundColor: [
        '#2E59D9',
        '#17A673',
        '#2C9FAF',
        '#DDA20A',
        '#BE2617',
        '#6C757D'
      ],
      hoverOffset: 10,
      borderWidth: 1,
      borderColor: '#FFFFFF'
    }]
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Répartition des rapports par date',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: { top: 10, bottom: 20 }
      },
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#5A5C69',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 4
      }
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#2E59D9', 
          fontSize: '28px', 
          fontWeight: 700, 
          marginBottom: '8px' 
        }}>
          Analyse des Rapports Médicaux
        </h1>
        <p style={{ color: '#6C757D', fontSize: '16px', margin: 0 }}>
          Visualisation des données médicales du patient
        </p>
      </div>

      {/* Line Chart - Full width at the top */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', 
        padding: '20px', 
        marginBottom: '24px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '400px',
          position: 'relative',
          width: '100%'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 600, color: '#5A5C69' }} htmlFor="field-select">
              Paramètre à analyser :
            </label>
            <select
              id="field-select"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #D1D3E2',
                backgroundColor: '#F8F9FC',
                fontSize: '14px',
                color: '#5A5C69',
                cursor: 'pointer',
                transition: 'border-color 0.3s'
              }}
            >
              {availableFields.map((field, idx) => (
                <option key={idx} value={field}>{field}</option>
              ))}
            </select>
          </div>
          {filteredData.length > 0 ? (
            <Line 
              data={lineData} 
              options={lineOptions} 
              style={{ 
                width: '100%', 
                height: 'calc(100% - 40px)'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#5A5C69' }}>
              Aucune donnée disponible pour {selectedField}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row - Bar and Pie charts side by side */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px'
      }}>
        {/* Bar Chart - Total Reports */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', 
          padding: '20px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <div style={{ height: '350px', position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Pie Chart - Reports Distribution */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', 
          padding: '20px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <div style={{ height: '350px', position: 'relative' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;