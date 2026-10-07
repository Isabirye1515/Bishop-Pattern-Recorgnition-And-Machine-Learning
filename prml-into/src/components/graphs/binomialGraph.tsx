import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFromServer } from "../../utils";


interface DistributionItem {
  value: number;
  count: number;
  probability: number;
}

interface BernoulliPoint {
  theta: number;
  prior: number;
  likelihood: number;
  posterior: number;
}

interface BernoulliResponse {
  threshold: number;
  n: number;
  k: number;
  n_minus_k: number;
  mle: number;
  prior: { alpha: number; beta: number };
  posterior: { alpha: number; beta: number };
  combined: BernoulliPoint[];
}


/* ------------------------------------------------------------------ */
/*                       DISCRETE DISTRIBUTION                         */
/* ------------------------------------------------------------------ */

const DistributionGraph = () => {

  const [feature, setFeature] = useState("Rooms");
  const [chartData, setChartData] = useState<DistributionItem[]>([]);

  useEffect(() => {
    getFromServer(
      `/api/distribution?feature=${feature}`,
      (data: DistributionItem[]) => {
        setChartData(data);
      }
    );
  }, [feature]);

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 5, maxWidth: 800, mx: "auto" }}>

      <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
        Discrete Distribution
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Feature</InputLabel>
        <Select
          value={feature}
          label="Select Feature"
          onChange={(event) => setFeature(event.target.value)}
        >
          <MenuItem value="Rooms">Rooms</MenuItem>
          <MenuItem value="Bathroom">Bathroom</MenuItem>
          <MenuItem value="Car">Car</MenuItem>
          <MenuItem value="Bedroom2">Bedroom2</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        Distribution of {feature}
      </Typography>

      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="value"
              label={{ value: feature, position: "insideBottom", offset: -15 }}
            />
            <YAxis
              label={{ value: "Probability", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </Paper>
  );
};



const BernoulliBayesGraph = () => {

  const [priorAlpha, setPriorAlpha] = useState(2);
  const [priorBeta, setPriorBeta] = useState(2);
  const [priceFeature, setPriceFeature] = useState("Price");
  const [points, setPoints] = useState(150);

  const [chartData, setChartData] = useState<BernoulliPoint[]>([]);
  const [meta, setMeta] = useState<BernoulliResponse | null>(null);

  useEffect(() => {

    if (priorAlpha <= 0 || priorBeta <= 0) return;

    const url =
      `/api/bernoulli-bayes` +
      `?prior_alpha=${priorAlpha}` +
      `&prior_beta=${priorBeta}` +
      `&price_feature=${priceFeature}` +
      `&points=${points}`;

    getFromServer(url, (data: BernoulliResponse) => {
      if (!data || (data as any).error) return;
      setChartData(data.combined);
      setMeta(data);
    });

  }, [priorAlpha, priorBeta, priceFeature, points]);

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 5, maxWidth: 800, mx: "auto" }}>

      <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
        Bayesian Bernoulli
      </Typography>

      {/* PRIOR CONTROLS */}

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>

        <TextField
          label="Prior α"
          type="number"
          value={priorAlpha}
          onChange={(e) => setPriorAlpha(Number(e.target.value))}
         
          sx={{ flex: 1, minWidth: 120 }}
        />

        <TextField
          label="Prior β"
          type="number"
          value={priorBeta}
          onChange={(e) => setPriorBeta(Number(e.target.value))}
          
          sx={{ flex: 1, minWidth: 120 }}
        />

        <TextField
          label="Grid points"
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
         
          sx={{ flex: 1, minWidth: 120 }}
        />

        <FormControl sx={{ flex: 1, minWidth: 160 }}>
          <InputLabel>Price feature</InputLabel>
          <Select
            value={priceFeature}
            label="Price feature"
            onChange={(e) => setPriceFeature(e.target.value)}
          >
            <MenuItem value="Price">Price</MenuItem>
            <MenuItem value="Landsize">Landsize</MenuItem>
            <MenuItem value="BuildingArea">BuildingArea</MenuItem>
          </Select>
        </FormControl>

      </Box>

      {/* SUMMARY */}

      {meta && (
        <Typography
          variant="body2"
          sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
        >
          Threshold (mean) = {meta.threshold.toFixed(2)} &nbsp;|&nbsp;
          n = {meta.n} &nbsp;|&nbsp;
          k = {meta.k} &nbsp;|&nbsp;
          MLE = {meta.mle.toFixed(3)} &nbsp;|&nbsp;
          Prior Beta({meta.prior.alpha}, {meta.prior.beta}) →{" "}
          Posterior Beta({meta.posterior.alpha}, {meta.posterior.beta})
        </Typography>
      )}

      {/* GRAPH */}

      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="theta"
              type="number"
              domain={[0, 1]}
              tickFormatter={(v) => Number(v).toFixed(2)}
              label={{ value: "θ", position: "insideBottom", offset: -15 }}
            />
            <YAxis
              label={{ value: "Density", angle: -90, position: "insideLeft" }}
            />
            <Tooltip/>
            <Legend />
            <Line
              type="monotone"
              dataKey="prior"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="likelihood"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="posterior"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </Paper>
  );
};


const StatsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <DistributionGraph />
      <BernoulliBayesGraph />
    </Box>
  );
};

export default StatsPage;