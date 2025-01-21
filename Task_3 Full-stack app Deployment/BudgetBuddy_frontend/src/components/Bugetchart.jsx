import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const BudgetChart = ({ budgetData, expenseData }) => {
  // Prepare the data for the chart
  const chartData = {
    labels: budgetData.map(b => b.title), // Titles of budgets
    datasets: [
      {
        label: 'Total Amount',
        data: budgetData.map(b => b.totalAmount), // Total amounts of budgets
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Amount Spent',
        data: budgetData.map(b => b.spentAmount), // Remaining amounts of budgets
        backgroundColor: 'rgba(22, 163, 74, 0.5)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1,
      },
      {
        label: 'Remaining Amount',
        data: budgetData.map(b => b.remaining), // Spent amounts of budgets
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  useEffect(() => {
    return () => {
      // Optional cleanup if needed
    };
  }, []);

  return (
    <div id='budgetChart'>
      <h2>Budget Overview</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BudgetChart;
