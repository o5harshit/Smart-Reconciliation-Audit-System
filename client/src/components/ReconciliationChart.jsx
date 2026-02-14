import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CHART_COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#4b5563"];

export default function ReconciliationChart({ chartData }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
          >
            {chartData?.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
