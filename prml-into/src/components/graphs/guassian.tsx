import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getFromServer } from "../../utils";

type Point = {
  x: number | string;
  y: number;
};

type DistributionResponse = {
  kind?: "continuous" | "categorical" | "discrete";
  feature?: string;
  target?: string;
  given?: Record<string, string | number>;
  data: Point[];
  observations_used?: number;
  error?: string;
};

const API = "/api/distribution";

const numericFeatures = [
  "Rooms",
  "Price",
  "Distance",
  "Bedroom2",
  "Bathroom",
  "Car",
  "Landsize",
  "BuildingArea",
  "YearBuilt",
  "Lattitude",
  "Longtitude",
  "Propertycount",
];

const categoricalFeatures = [
  "Type",
  "Method",
  "SellerG",
  "CouncilArea",
  "Regionname",
];

const allFeatures = [
  ...numericFeatures,
  ...categoricalFeatures,
];

export default function DistributionExplorer() {
  const [marginalFeature, setMarginalFeature] =
    useState("Rooms");

  const [marginalResult, setMarginalResult] =
    useState<DistributionResponse | null>(null);

  const [target, setTarget] = useState("Price");

  const [givenFeatures, setGivenFeatures] =
    useState<string[]>(["Rooms"]);

  const [givenValues, setGivenValues] =
    useState<Record<string, string>>({
      Rooms: "4",
    });

  const [conditionalResult, setConditionalResult] =
    useState<DistributionResponse | null>(null);

  const [loadingMarginal, setLoadingMarginal] =
    useState(false);

  const [loadingConditional, setLoadingConditional] =
    useState(false);

  const [error, setError] = useState("");

  const [bandwidth, setBandwidth] = useState("0.3");
  const [points, setPoints] = useState("100");

  // Validate common graph settings before making requests.
  const validateSettings = () => {
    const bandwidthValue = Number(bandwidth);
    const pointsValue = Number(points);

    if (
      !Number.isFinite(bandwidthValue) ||
      bandwidthValue <= 0
    ) {
      throw new Error("KDE bandwidth must be greater than zero.");
    }

    if (
      !Number.isInteger(pointsValue) ||
      pointsValue < 20 ||
      pointsValue > 500
    ) {
      throw new Error(
        "Graph points must be an integer between 20 and 500."
      );
    }
  };

  // 1. Marginal distribution: P(X)
  const loadMarginal = async () => {
    setError("");
    setLoadingMarginal(true);
    setMarginalResult(null);

    try {
      validateSettings();

      const params = new URLSearchParams({
        feature: marginalFeature,
        bandwidth,
        points,
      });

      await getFromServer(
        `${API}/marginal?${params.toString()}`,
        (result: DistributionResponse) => {
          if (result.error) {
            setError(result.error);
            return;
          }

          setMarginalResult(result);
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load marginal distribution."
      );
    } finally {
      setLoadingMarginal(false);
    }
  };

  // 2. Conditional distribution: P(Target | conditions)
  const loadConditional = async () => {
    setError("");
    setLoadingConditional(true);
    setConditionalResult(null);

    try {
      validateSettings();

      if (givenFeatures.length === 0) {
        throw new Error(
          "Select at least one conditioning feature."
        );
      }

      if (givenFeatures.includes(target)) {
        throw new Error(
          "The target cannot also be a conditioning feature."
        );
      }

      const given: Record<string, string | number> = {};

      for (const feature of givenFeatures) {
        const rawValue = givenValues[feature]?.trim();

        if (!rawValue) {
          throw new Error(`Enter a value for ${feature}.`);
        }

        if (numericFeatures.includes(feature)) {
          const numericValue = Number(rawValue);

          if (!Number.isFinite(numericValue)) {
            throw new Error(
              `${feature} must have a valid numeric value.`
            );
          }

          given[feature] = numericValue;
        } else {
          given[feature] = rawValue;
        }
      }

      const params = new URLSearchParams({
        target,
        given: JSON.stringify(given),
        bandwidth,
        points,
      });

      await getFromServer(
        `${API}/conditional?${params.toString()}`,
        (result: DistributionResponse) => {
          if (result.error) {
            setError(result.error);
            return;
          }

          setConditionalResult(result);
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load conditional distribution."
      );
    } finally {
      setLoadingConditional(false);
    }
  };

  // Display discrete probabilities as bars and continuous
  // probability densities as curves.
  const renderGraph = (
    result: DistributionResponse,
    xLabel: string
  ) => {
    const isDiscrete =
      result.kind === "categorical" ||
      result.kind === "discrete";

    if (!result.data?.length) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No observations were returned for this distribution.
        </Alert>
      );
    }

    if (isDiscrete) {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={result.data}
            margin={{
              top: 10,
              right: 15,
              left: 5,
              bottom: 35,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="x"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={65}
              label={{
                value: xLabel,
                position: "insideBottom",
                offset: -20,
              }}
            />

            <YAxis
              domain={[0, 1]}
              tickFormatter={(value) =>
                `${(Number(value) * 100).toFixed(0)}%`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${(Number(value) * 100).toFixed(2)}%`,
                "Probability",
              ]}
              labelFormatter={(value) =>
                `${xLabel}: ${value}`
              }
            />

            <Line
              type="monotone"
              dataKey="y"
              name="Probability"
              stroke="#1976d2"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={result.data}
          margin={{
            top: 10,
            right: 15,
            left: 5,
            bottom: 35,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) =>
              Number(value).toLocaleString()
            }
            label={{
              value: xLabel,
              position: "insideBottom",
              offset: -20,
            }}
          />

          <YAxis
            tickFormatter={(value) =>
              Number(value).toFixed(4)
            }
          />

          <Tooltip
            formatter={(value) => [
              Number(value).toFixed(6),
              "Density",
            ]}
            labelFormatter={(value) =>
              `${xLabel}: ${Number(value).toLocaleString()}`
            }
          />

          <Line
            type="monotone"
            dataKey="y"
            name="Density"
            stroke="#1976d2"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Probability Distribution Explorer
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Explore marginal and conditional distributions from
        the Melbourne housing dataset.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Shared graph settings */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Distribution settings
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="KDE bandwidth"
              type="number"
              value={bandwidth}
              slotProps={{
                htmlInput: {
                  min: 0.01,
                  step: 0.05,
                },
              }}
              onChange={(event) =>
                setBandwidth(event.target.value)
              }
              helperText="Controls the smoothness of continuous density curves."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Graph points"
              type="number"
              value={points}
              slotProps={{
                htmlInput: {
                  min: 20,
                  max: 500,
                  step: 10,
                },
              }}
              onChange={(event) =>
                setPoints(event.target.value)
              }
              helperText="Number of points used to draw continuous curves."
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Marginal distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            sx={{ p: 3, height: "100%" }}
          >
            <Typography variant="h6" gutterBottom>
              1. Marginal distribution
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Examine one feature without fixing the values
              of other features: P(X).
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="marginal-feature-label">
                Feature
              </InputLabel>

              <Select
                labelId="marginal-feature-label"
                value={marginalFeature}
                label="Feature"
                onChange={(event) => {
                  setMarginalFeature(event.target.value);
                  setMarginalResult(null);
                }}
              >
                {allFeatures.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={loadMarginal}
              disabled={loadingMarginal}
              sx={{ mb: 3 }}
            >
              {loadingMarginal
                ? "Loading..."
                : "Plot marginal distribution"}
            </Button>

            {loadingMarginal && (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            )}

            {marginalResult && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  {marginalResult.feature ?? marginalFeature}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Observations used:{" "}
                  {marginalResult.observations_used ?? "N/A"}
                </Typography>

                {renderGraph(
                  marginalResult,
                  marginalFeature
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Conditional distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            sx={{ p: 3, height: "100%" }}
          >
            <Typography variant="h6" gutterBottom>
              2. Conditional distribution
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Examine a target feature given one or more
              selected conditions: P(X | Y).
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="target-feature-label">
                Target feature
              </InputLabel>

              <Select
                labelId="target-feature-label"
                value={target}
                label="Target feature"
                onChange={(event) => {
                  const nextTarget = event.target.value;

                  setTarget(nextTarget);
                  setGivenFeatures((previous) =>
                    previous.filter(
                      (feature) => feature !== nextTarget
                    )
                  );
                  setConditionalResult(null);
                }}
              >
                {allFeatures
                  .filter(
                    (feature) =>
                      !givenFeatures.includes(feature)
                  )
                  .map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="conditioning-features-label">
                Conditioning features
              </InputLabel>

              <Select
                labelId="conditioning-features-label"
                multiple
                value={givenFeatures}
                onChange={(event) => {
                  const value = event.target.value;

                  const selected =
                    typeof value === "string"
                      ? value.split(",")
                      : value;

                  setGivenFeatures(
                    selected.filter(
                      (feature) => feature !== target
                    )
                  );

                  setConditionalResult(null);
                }}
                input={
                  <OutlinedInput label="Conditioning features" />
                }
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {selected.map((feature) => (
                      <Chip key={feature} label={feature} />
                    ))}
                  </Box>
                )}
              >
                {allFeatures
                  .filter((feature) => feature !== target)
                  .map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {givenFeatures.map((feature) => (
              <TextField
                key={feature}
                fullWidth
                label={`${feature} value`}
                placeholder={
                  numericFeatures.includes(feature)
                    ? "Enter a number"
                    : "Enter a category"
                }
                type={
                  numericFeatures.includes(feature)
                    ? "number"
                    : "text"
                }
                value={givenValues[feature] ?? ""}
                onChange={(event) => {
                  setGivenValues((previous) => ({
                    ...previous,
                    [feature]: event.target.value,
                  }));
                  setConditionalResult(null);
                }}
                sx={{ mb: 2 }}
              />
            ))}

            <Button
              variant="contained"
              onClick={loadConditional}
              disabled={loadingConditional}
              sx={{ mb: 3 }}
            >
              {loadingConditional
                ? "Loading..."
                : "Plot conditional distribution"}
            </Button>

            {loadingConditional && (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            )}

            {conditionalResult && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  {conditionalResult.target ?? target} given{" "}
                  {Object.entries(
                    conditionalResult.given ?? {}
                  )
                    .map(
                      ([key, value]) => `${key} = ${value}`
                    )
                    .join(", ")}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Observations used:{" "}
                  {conditionalResult.observations_used ?? "N/A"}
                </Typography>

                {renderGraph(
                  conditionalResult,
                  conditionalResult.target ?? target
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}