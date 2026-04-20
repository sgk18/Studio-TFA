"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AdminBarChartProps = {
  labels: string[];
  values: number[];
};

export function AdminBarChart({ labels, values }: AdminBarChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Sales Value",
        data: values,
        backgroundColor: "rgba(139, 38, 62, 0.7)",
        borderRadius: 8,
        hoverBackgroundColor: "rgba(139, 38, 62, 0.9)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `INR ${context.parsed.x.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "Plus Jakarta Sans" } }
      }
    }
  };

  return (
    <div className="h-[280px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
