import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["#2dd4bf", "#5eead4", "#9d7bf0", "#c4b0f5", "#e8a13c", "#71809a"];

export default function AlgorithmChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }} barCategoryGap={26}>
        <CartesianGrid strokeDasharray="3 6" stroke="#1c2635" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#71809a", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "#1c2635" }} tickLine={false} />
        <YAxis tick={{ fill: "#71809a", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{ background: "#0d121a", border: "1px solid #28354a", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#eef2f7" }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
