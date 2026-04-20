"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type AdminDonutChartProps = {
  labels: string[];
  values: number[];
};

export function AdminDonutChart({ labels, values }: AdminDonutChartProps) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(139, 38, 62, 0.8)",
          "rgba(45, 90, 71, 0.8)",
          "rgba(40, 74, 104, 0.8)",
          "rgba(90, 79, 27, 0.8)",
          "rgba(109, 43, 60, 0.8)",
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            return `Value: INR ${val.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <div className="h-[280px] w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}
