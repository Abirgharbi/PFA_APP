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
  ArcElement // for Pie chart
);


interface ReportsAnalyticsProps {
  patientId: string;
}


const ReportsAnalytics:  React.FC<ReportsAnalyticsProps> = ({ patientId }) => {

  const [data, setData] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [champChoisi, setChampChoisi] = useState<string>(''); // champ sélectionné

  useEffect(() => {
    const loadData = async () => {
      try {
         const analytics = await fetchReportAnalytics(patientId); // Modifiez votre service
        setData(analytics);

        // Sélectionner automatiquement le premier champ
        if (analytics.resulte.length > 0) {
          setChampChoisi(analytics.resulte[0].champ);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;
  if (!data) return <p>Aucune donnée</p>;

  const resultes = data.resulte || [];
  const rapports = data.rapports || [];

  // Liste unique des champs
  const champsDisponibles = Array.from(new Set(resultes.map(r => r.champ)));

  // Données filtrées par champ sélectionné
  const filtered = resultes.filter(r => r.champ === champChoisi);
  const lineData = {
    labels: filtered.map(r => new Date(r.date.split('/').reverse().join('-'))),
    datasets: [{
      label: `${champChoisi} (${filtered[0]?.unité || ''})`,
      data: filtered.map(r => r.valeur),
      fill: false,
      borderColor: '#66BB6A',
      tension: 0.1,
    }]
  };

const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'month',
      },
      title: {
        display: true,
        text: 'Date',
      },
    },
    y: {
      title: {
        display: true,
        text: filtered[0]?.unité || 'Valeur',
      },
    },
  },
};

  const barData = {
    labels: ['Rapports'],
    datasets: [{
      label: 'Nombre de rapports',
      data: [data.totalrapport],
      backgroundColor: '#42A5F5'
    }]
  };

  // Prepare Pie chart data from rapports
  const pieLabels = rapports.map(r => r.date);
  const pieDataValues = rapports.map(r => r.number);
  const pieBackgroundColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40'
  ];

  const pieData = {
    labels: pieLabels,
    datasets: [{
      data: pieDataValues,
      backgroundColor: pieBackgroundColors.slice(0, pieLabels.length),
      hoverOffset: 30
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Répartition des rapports par date',
      },
    },
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Bar Chart Container */}
        <div style={{ flex: '1 1 250px', minWidth: 250, height: 300 }}>
          <h3>Total des rapports</h3>
          <Bar data={barData} />
        </div>

        {/* Line Chart Container */}
        <div style={{ flex: '2 1 500px', minWidth: 300, height: 300 }}>
          <h3>Évolution d’un champ</h3>
          <div style={{ marginBottom: 10 }}>
            <label>Choisir un champ : </label>
            <select value={champChoisi} onChange={(e) => setChampChoisi(e.target.value)}>
              {champsDisponibles.map((champ, idx) => (
                <option key={idx} value={champ}>{champ}</option>
              ))}
            </select>
          </div>
          {filtered.length > 0 ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <p>Aucune donnée trouvée pour le champ {champChoisi}</p>
          )}
        </div>

        {/* Pie Chart Container */}
        <div style={{ flex: '1 1 300px', minWidth: 250, height: 300 }}>
          <h3>Répartition des rapports</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
