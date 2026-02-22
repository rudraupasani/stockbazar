import React from "react";
import { Line } from "react-chartjs-2";

const MarketMiniChart = ({ chartData }) => {
  return (
    <div className="bg-[#151922] p-6 rounded-2xl border border-[#1F2937]">
      <h2 className="text-xl font-semibold mb-4">Market Chart</h2>

      <Line
        data={chartData}
        options={{
          responsive: true,
          elements: { point: { radius: 0 } },
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
      />
    </div>
  );
};

export default MarketMiniChart;
