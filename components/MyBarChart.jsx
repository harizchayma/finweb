import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const MyBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <p>Aucune donnée disponible pour le graphique.</p>;
    }

    return (
        <BarChart width={1100} height={350} data={data}>
           
            <XAxis dataKey="month" interval={0} tick={<CustomTick />} />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="cheque" fill="#7b76db" name="Chèque" />
            <Bar dataKey="espace" fill="#82ca9d" name="Espace" />
            <Bar dataKey="virement" fill="#ffc658" name="Virement" />
        </BarChart>
    );
};

const CustomTick = ({ x, y, payload }) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={12} textAnchor="end" fill="#666" transform="rotate(0) ">
                {payload.value}
            </text>
        </g>
    );
};

export default MyBarChart;