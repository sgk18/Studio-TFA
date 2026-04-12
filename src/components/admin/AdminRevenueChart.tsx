"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type AdminRevenueChartProps = {
  labels: string[];
  values: number[];
};

export function AdminRevenueChart({ labels, values }: AdminRevenueChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
        borderColor: "rgba(139, 38, 62, 0.95)",
        backgroundColor: "rgba(209, 116, 132, 0.22)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const parsedY = typeof context.parsed.y === "number" ? context.parsed.y : 0;
            return `Revenue: INR ${Math.round(parsedY).toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (tick) => `INR ${Number(tick).toLocaleString("en-IN")}`,
        },
        grid: {
          color: "rgba(31, 36, 48, 0.08)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-[320px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}
