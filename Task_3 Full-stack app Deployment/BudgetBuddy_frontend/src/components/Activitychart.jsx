import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

const ActivityChart = ({ budgets, amounts }) => {
  const chartRef = useRef(null); // Use ref to store the chart instance
  const canvasRef = useRef(null); // Ref for the canvas

  useEffect(() => {
    Chart.register(...registerables);

    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy previous chart instance before creating a new one
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: budgets, // Budgets for x-axis
        datasets: [
          {
            label: "Amount Spent",
            data: amounts, // Amounts for y-axis
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount Spent ($)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Budgets',
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Cleanup when component unmounts
      }
    };
  }, [budgets, amounts]); // Watch for changes to budgets and amounts

  return <canvas ref={canvasRef} className="h-64" id="activityChart"></canvas>;
};

export default ActivityChart;
