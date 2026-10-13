import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getFromServer,
  CATEGORY_LABELS,
  type MultinomialItem,
  type MultinomialResponse,
} from "../../utils";


const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ff7300",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#a4de6c",
  "#d0ed57",
];


const FEATURES = [
  { value: "Type", label: "A House And Which Type Of A House" },
  { value: "Method", label: " Method Of Selling It / Sale Status" },
  { value: "Regionname", label: "Region Name" },
  { value: "CouncilArea", label: "Council Area" },
];


interface MultinomialChartProps {
  feature: string;
  label: string;
}


const MultinomialChart = ({ feature, label }: MultinomialChartProps) => {
  const [chartData, setChartData] = useState<MultinomialItem[]>([]);
  const [meta, setMeta] = useState<MultinomialResponse | null>(null);

  useEffect(() => {
    getFromServer(
      `/api/multinomial?feature=${feature}`,
      (data: MultinomialResponse) => {
        if (!data || (data as any).error) return;
        setChartData(data.combined);
        setMeta(data);
      }
    );
  }, [feature]);

  const translatedData = chartData.map((item) => ({
    ...item,
    category:
      CATEGORY_LABELS[feature]?.[item.category] ?? item.category,
  }));

  const chartHeight = Math.max(320, translatedData.length * 24);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
        {label}
      </Typography>

      {meta && (
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
        >
          N = {meta.n} &nbsp;|&nbsp; K = {meta.k} categories &nbsp;|&nbsp;
          Prior α₀ = {meta.prior.alpha0} &nbsp;→&nbsp; posterior α₀ ={" "}
          {meta.posterior.alpha0.toFixed(0)}
        </Typography>
      )}

      <Box sx={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={translatedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 90 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              label={{
                value: feature,
                position: "insideBottom",
                offset: -60,
              }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              label={{
                value: "Probability",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number"
                  ? value.toFixed(4)
                  : String(value ?? "")
              }
            />
            <Legend />
            <Bar
              dataKey="mle"
              name="MLE"
              shape={(props: any) => (
                <rect
                  x={props.x}
                  y={props.y}
                  width={props.width}
                  height={props.height}
                  fill={COLORS[props.index % COLORS.length]}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {meta && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Log-likelihood: {meta.log_likelihood.toFixed(4)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log multinomial coefficient:{" "}
            {meta.log_multinomial_coefficient.toFixed(4)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dirichlet PDF at MLE: {meta.dirichlet_pdf_at_mle.toFixed(4)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};


const MultinomialGraph = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" sx={{ textAlign: "center", mb: 1 }}>
        Multinomial Distribution
      </Typography>

      <Typography
        variant="body1"
        sx={{ textAlign: "center", mb: 4, color: "text.secondary" }}
      >
        This multinomial distribution describes the probability of observing
  each category when drawing from a fixed set of options. here,we apply
  it to the Melbourne housing data from our melb_data.csv. lets just consider how houses are distributed
  across type, sale status, region, and council area. Each bar represents
  the empirical probability of that category, computed directly from our
  dataset thanks.
      </Typography>

      {FEATURES.map((f) => (
        <MultinomialChart
          key={f.value}
          feature={f.value}
          label={f.label}
        />
      ))}
    </Box>
  );
};


export default MultinomialGraph;