import { useEffect, useMemo, useState } from "react"
import { getHouses, type MelbourneHouse } from "../../utils"
import {
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Stack,
  Box,
} from "@mui/material"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

type NumericKey =
  | "Price"
  | "Rooms"
  | "Distance"
  | "Bedroom2"
  | "Bathroom"
  | "Car"
  | "Landsize"
  | "BuildingArea"
  | "YearBuilt"

const NUMERIC_KEYS: NumericKey[] = [
  "Price",
  "Rooms",
  "Distance",
  "Bedroom2",
  "Bathroom",
  "Car",
  "Landsize",
  "BuildingArea",
  "YearBuilt",
]

const normalPdf = (x: number, mu: number, sigma2: number) => {
  const s2 = Math.max(sigma2, 1e-12)
  return (
    (1 / Math.sqrt(2 * Math.PI * s2)) *
    Math.exp(-((x - mu) ** 2) / (2 * s2))
  )
}

const gaussianMLE = (xs: number[]) => {
  const n = xs.length
  if (n === 0) return { mu: 0, sigma2: 1 }
  const mu = xs.reduce((a, b) => a + b, 0) / n
  const sigma2 = xs.reduce((a, b) => a + (b - mu) ** 2, 0) / n
  return { mu, sigma2: Math.max(sigma2, 1e-9) }
}

const avgLogLik = (xs: number[], mu: number, sigma2: number) => {
  if (xs.length === 0 || sigma2 <= 0) return -Infinity
  let s = 0
  for (const x of xs) s += Math.log(normalPdf(x, mu, sigma2))
  return s / xs.length
}

const MaximumLikelihood = () => {
  const [data, setData] = useState<MelbourneHouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feature, setFeature] = useState<NumericKey>("Price")

  const [mu, setMu] = useState(0)
  const [sigma2, setSigma2] = useState(1)

  useEffect(() => {
    const run = async () => {
      try {
        const r = await getHouses()
        if (r) setData(r)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch houses")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const values = useMemo(
    () =>
      data
        .map((h) => Number((h as any)[feature]))
        .filter((v) => Number.isFinite(v) && v > 0),
    [data, feature]
  )

  const { mu: mleMu, sigma2: mleSigma2 } = useMemo(
    () => gaussianMLE(values),
    [values]
  )

  useEffect(() => {
    if (values.length === 0) return
    setMu(mleMu)
    setSigma2(mleSigma2)
  }, [feature, values.length, mleMu, mleSigma2])

  const { xMin, xMax } = useMemo(() => {
    if (values.length === 0) return { xMin: 0, xMax: 1 }
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const pad = (hi - lo) * 0.15 || 1
    return { xMin: lo - pad, xMax: hi + pad }
  }, [values])

  const { chartData, binWidth } = useMemo(() => {
    if (values.length === 0) {
      return { chartData: [], binWidth: 1 }
    }

    const nBins = 40
    const width = (xMax - xMin) / nBins || 1
    const bins = Array.from({ length: nBins }, (_, i) => ({
      center: xMin + i * width + width / 2,
      count: 0,
    }))

    for (const v of values) {
      const idx = Math.min(
        nBins - 1,
        Math.max(0, Math.floor((v - xMin) / width))
      )
      bins[idx].count += 1
    }

    const N = values.length
    const density = bins.map((b) => b.count / (N * width))
    const chartData = bins.map((b, i) => ({
      x: Math.round(b.center),
      density: density[i],
      pdf: normalPdf(b.center, mu, sigma2),
      mlePdf: normalPdf(b.center, mleMu, mleSigma2),
    }))

    return { chartData, binWidth: width }
  }, [values, xMin, xMax, mu, sigma2, mleMu, mleSigma2])

  const userLL = useMemo(
    () => avgLogLik(values, mu, sigma2),
    [values, mu, sigma2]
  )
  const mleLL = useMemo(
    () => avgLogLik(values, mleMu, mleSigma2),
    [values, mleMu, mleSigma2]
  )

  const { muMin, muMax, varMin, varMax } = useMemo(() => {
    if (values.length === 0)
      return { muMin: 0, muMax: 1, varMin: 0.001, varMax: 10 }
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const range = hi - lo || 1
    return {
      muMin: lo - range * 0.5,
      muMax: hi + range * 0.5,
      varMin: Math.max(range * range * 1e-4, 1e-6),
      varMax: range * range * 1.0,
    }
  }, [values])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Grid container spacing={2} sx={{ p: 2, mt: 10 }}>
      <Grid >
        <Typography variant="h4">p({feature} | μ, σ²)</Typography>
        <Typography variant="body2" color="text.secondary">
          The orange curve is the Gaussian probability density for your chosen
          μ and σ². The grey dashed curve is the MLE Gaussian (the target you
          are trying to match). The bars are the empirical density of the data.
        </Typography>
      </Grid>

      <Grid >
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Feature</InputLabel>
          <Select
            value={feature}
            label="Feature"
            onChange={(e) => setFeature(e.target.value as NumericKey)}
          >
            {NUMERIC_KEYS.map((k) => (
              <MenuItem key={k} value={k}>
                {k}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid sx={{ width: "100%", height: 460 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, bottom: 40, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[xMin, xMax]}
              label={{
                value: feature,
                position: "insideBottom",
                offset: -20,
              }}
            />
            <YAxis
              label={{
                value: "probability density  p(x | μ, σ²)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(v, name) => [
                typeof v === "number" ? v.toExponential(3) : String(v ?? ""),
                String(name),
              ]}
            />
            <Legend />
            <Bar
              dataKey="density"
              name="Empirical density"
              fill="#8884d8"
              fillOpacity={0.55}
            />
            <Line
              type="monotone"
              dataKey="mlePdf"
              name="MLE Gaussian"
              stroke="#999"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pdf"
              name="p(x | μ, σ²)"
              stroke="#ff7300"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Grid>

      <Grid >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1">
                Mean μ — you: {mu.toFixed(0)} | MLE: {mleMu.toFixed(0)}
              </Typography>
              <Slider
                min={muMin}
                max={muMax}
                step={(muMax - muMin) / 500}
                value={mu}
                onChange={(_, v) => setMu(v as number)}
                valueLabelDisplay="auto"
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1">
                Variance σ² — you: {sigma2.toFixed(0)} | MLE:{" "}
                {mleSigma2.toFixed(0)} (σ ≈ {Math.sqrt(sigma2).toFixed(0)})
              </Typography>
              <Slider
                min={varMin}
                max={varMax}
                step={(varMax - varMin) / 500}
                value={sigma2}
                onChange={(_, v) => setSigma2(v as number)}
                valueLabelDisplay="auto"
              />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            Average log-likelihood per sample
          </Typography>
          <Typography variant="body1">
            Your Gaussian: <b>{userLL.toFixed(4)}</b>
          </Typography>
          <Typography variant="body1">
            MLE Gaussian: <b>{mleLL.toFixed(4)}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Because the MLE maximises the log-likelihood, your value is always
            ≤ the MLE value. Move the sliders and watch the gap shrink.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default MaximumLikelihood