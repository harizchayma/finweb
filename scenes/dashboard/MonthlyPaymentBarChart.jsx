import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

const MonthlyPaymentBarChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [monthlyData, setMonthlyData] = useState([]);
  const monthOrder = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];

  const fetchMonthlyPaymentData = async () => {
    try {
      const response = await fetch("http://localhost:7001/avance"); // Changed endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (!Array.isArray(result)) {
        console.error("Data is not an array:", result);
        return;
      }

      // Process the data to aggregate by month and payment method
      const monthlyTotals = {};
      result.forEach(avance => {
        const date = new Date(avance.date);
        const month = date.toLocaleString('default', { month: 'long' });

        if (!monthlyTotals[month]) {
          monthlyTotals[month] = {
            month,
            cheque: 0,
            espace: 0,
            virement: 0,
          };
        }

        // Sum up the payment amounts for each category.  Handles nulls.
        monthlyTotals[month].cheque += (avance.montant_cheque1 || 0) + (avance.montant_cheque2 || 0);
        monthlyTotals[month].espace += avance.montant_espace || 0;
        monthlyTotals[month].virement += avance.montant_virement || 0;
      });

      // Convert the monthlyTotals object into an array, preserving month order
      const monthlyDataArray = monthOrder.map(month => monthlyTotals[month] || { month, cheque: 0, espace: 0, virement: 0 });


      setMonthlyData(monthlyDataArray);
    } catch (error) {
      console.error("Error fetching monthly payment data:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyPaymentData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={monthlyData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cheque" fill={colors.blue[500]} name="Chèque" />
        <Bar dataKey="espace" fill={colors.green[500]} name="Espèce" />
        <Bar dataKey="virement" fill={colors.red[500]} name="Virement" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyPaymentBarChart;
