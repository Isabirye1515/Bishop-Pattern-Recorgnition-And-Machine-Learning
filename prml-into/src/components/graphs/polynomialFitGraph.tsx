import { useMemo, useState } from "react";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getFromServer } from "../../utils";


interface Point {
  x: number;
  price: number;
}


interface PolynomialResult {
  feature: string;
  degree: number;
  coefficients: number[];

  // Individual observations
  points: Point[];

  // Average price for each X value
  averagePoints: Point[];

  // Smooth polynomial curve
  curvePoints: Point[];
}


const features = [
  {
    value: "Rooms",
    label: "Rooms",
  },
  {
    value: "Distance",
    label: "Distance",
  },
  {
    value: "Bedroom2",
    label: "Bedrooms",
  },
  {
    value: "Bathroom",
    label: "Bathrooms",
  },
  {
    value: "Car",
    label: "Car spaces",
  },
  {
    value: "Landsize",
    label: "Land size",
  },
  {
    value: "BuildingArea",
    label: "Building area",
  },
  {
    value: "YearBuilt",
    label: "Year built",
  },
];

const formatPolynomial = (
  coefficients: number[]
): string => {
  if (
    !coefficients ||
    coefficients.length === 0
  ) {
    return "";
  }

  const degree = coefficients.length - 1;

  return coefficients
    .map((coefficient, index) => {
      const power = degree - index;

      const value =
        Math.abs(coefficient).toFixed(4);

      let term: string;

      if (power === 0) {
        term = value;
      } else if (power === 1) {
        term = `${value}x`;
      } else {
        term = `${value}x^${power}`;
      }

      if (index === 0) {
        return coefficient < 0
          ? `-${term}`
          : term;
      }

      return coefficient < 0
        ? `- ${term}`
        : `+ ${term}`;
    })
    .join(" ");
};


const PolynomialFitPage = () => {
  const [feature, setFeature] =
    useState("Rooms");

  const [degree, setDegree] =
    useState(1);

  const [result, setResult] =
    useState<PolynomialResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const originalPoints = useMemo(() => {
    if (!result) {
      return [];
    }

    return [...result.points].sort(
      (a, b) => a.x - b.x
    );
  }, [result]);


  const averagePoints = useMemo(() => {
    if (!result) {
      return [];
    }

    return [...result.averagePoints].sort(
      (a, b) => a.x - b.x
    );
  }, [result]);


  const handleFit = () => {
    setLoading(true);
    setError(null);

    const endpoint =
      `/api/polynomial-fit?feature=${encodeURIComponent(
        feature
      )}&degree=${degree}`;

    getFromServer(
      endpoint,
      (data: unknown) => {
        try {
          setResult(
            data as PolynomialResult
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to process polynomial result"
          );
        } finally {
          setLoading(false);
        }
      }
    );
  };


  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >


      <Typography
        variant="h4"
        gutterBottom
      >
        Polynomial Curve Fitting
      </Typography>


      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Explore the relationship between a
        feature and house price, and compare
        the observed data, average prices,
        and polynomial model.
      </Typography>


      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
        }}
      >

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >

          {/* Feature */}

          <FormControl
            sx={{ minWidth: 220 }}
          >

            <InputLabel id="feature-label">
              X-axis Feature
            </InputLabel>

            <Select
              labelId="feature-label"
              value={feature}
              label="X-axis Feature"
              onChange={(event) =>
                setFeature(
                  event.target.value
                )
              }
            >

              {features.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </MenuItem>
              ))}

            </Select>

          </FormControl>



          <FormControl
            sx={{ minWidth: 170 }}
          >

            <InputLabel id="degree-label">
              Polynomial Degree
            </InputLabel>

            <Select
              labelId="degree-label"
              value={degree}
              label="Polynomial Degree"
              onChange={(event) =>
                setDegree(
                  Number(event.target.value)
                )
              }
            >

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                (value) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    Degree {value}
                  </MenuItem>
                )
              )}

            </Select>

          </FormControl>


          <Button
            variant="contained"
            onClick={handleFit}
            disabled={loading}
            sx={{
              height: 56,
            }}
          >

            {loading ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              "Fit Polynomial"
            )}

          </Button>

        </Box>

      </Paper>


      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}


      {result && (
        <>


          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
            }}
          >

            <Typography
              variant="h6"
              gutterBottom
            >
              Polynomial Model
            </Typography>


            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "1.1rem",
              }}
            >
              Price ={" "}
              {formatPolynomial(
                result.coefficients
              )}
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Feature: {result.feature}
              {"  |  "}
              Degree: {result.degree}
            </Typography>

          </Paper>


          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
            }}
          >

            <Typography
              variant="h6"
              gutterBottom
            >
              What the graph shows
            </Typography>


            <Typography
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Individual observations:</strong>{" "}
              Each point represents one house
              in the original dataset.
            </Typography>


            <Typography
              variant="body2"
              sx={{ mb: 1 }}
            >
              <strong>Average price:</strong>{" "}
              The average house price for
              each value of the selected feature.
            </Typography>


            <Typography
              variant="body2"
            >
              <strong>Polynomial fit:</strong>{" "}
              The mathematical curve fitted
              to the original observations.
            </Typography>

          </Paper>


          <Paper
            elevation={2}
            sx={{
              p: 3,
            }}
          >

            <Typography
              variant="h6"
              gutterBottom
            >
              Data and Polynomial Model
            </Typography>


            <Box
              sx={{
                width: "100%",
                height: 600,
              }}
            >

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <ComposedChart
                  margin={{
                    top: 20,
                    right: 30,
                    left: 50,
                    bottom: 50,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />


                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[
                      "auto",
                      "auto",
                    ]}
                    label={{
                      value:
                        result.feature,
                      position:
                        "insideBottom",
                      offset: -25,
                    }}
                  />


                  <YAxis
                    type="number"
                    dataKey="price"
                    domain={[
                      "auto",
                      "auto",
                    ]}
                    label={{
                      value: "Price",
                      angle: -90,
                      position:
                        "insideLeft",
                    }}
                  />


                  <Tooltip />


                  <Legend />


                  <Scatter
                    name="Individual Observations"
                    data={originalPoints}
                  />

                  <Line
                    name="Average Price"
                    data={averagePoints}
                    dataKey="price"
                    type="linear"
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                    strokeWidth={2}
                  />

                  <Line
                    name={`Polynomial Fit (Degree ${result.degree})`}
                    data={
                      result.curvePoints
                    }
                    dataKey="price"
                    type="monotone"
                    dot={false}
                    activeDot={false}
                    strokeWidth={3}
                  />

                </ComposedChart>

              </ResponsiveContainer>

            </Box>

          </Paper>

        </>
      )}

    </Box>
  );
};


export default PolynomialFitPage;
