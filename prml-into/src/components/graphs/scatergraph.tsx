
import { useMemo, useState } from "react";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { MelbourneHouse } from "../../utils";


interface HousePriceChartProps {
  houses: MelbourneHouse[];
}

type NumericFeature =
  | "Rooms"
  | "Distance"
  | "Postcode"
  | "Bedroom2"
  | "Bathroom"
  | "Car"
  | "Landsize"
  | "BuildingArea"
  | "YearBuilt"
  | "Lattitude"
  | "Longtitude"
  | "Propertycount";

const features: { value: NumericFeature; label: string }[] = [
  { value: "Rooms", label: "Rooms" },
  { value: "Distance", label: "Distance" },
  { value: "Postcode", label: "Postcode" },
  { value: "Bedroom2", label: "Bedrooms" },
  { value: "Bathroom", label: "Bathrooms" },
  { value: "Car", label: "Car spaces" },
  { value: "Landsize", label: "Land size" },
  { value: "BuildingArea", label: "Building area" },
  { value: "YearBuilt", label: "Year built" },
  { value: "Lattitude", label: "Latitude" },
  { value: "Longtitude", label: "Longitude" },
  { value: "Propertycount", label: "Property count" },
];

const HousePriceChart = ({ houses }: HousePriceChartProps) => {
    
  const [xFeature, setXFeature] = useState<NumericFeature>("Rooms");

  const chartData = useMemo(() => {
    return houses
      .filter(
        (house) =>
          house.Price !== null &&
          house[xFeature] !== null &&
          typeof house[xFeature] === "number"
      )
      .map((house) => ({
        x: house[xFeature] as number,
        price: house.Price as number,
        house,
      }));
  }, [houses, xFeature]);

  const selectedFeature = features.find(
    (feature) => feature.value === xFeature
  );

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Feature vs House Price
      </Typography>

      <FormControl sx={{ minWidth: 250, mb: 3 }}>
        <InputLabel id="x-feature-label">X-axis feature</InputLabel>

        <Select
          labelId="x-feature-label"
          value={xFeature}
          label="X-axis feature"
          onChange={(event) =>
            setXFeature(event.target.value as NumericFeature)
          }
        >
          {features.map((feature) => (
            <MenuItem key={feature.value} value={feature.value}>
              {feature.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 40,
            left: 60,
          }}
        >
          <CartesianGrid />

          <XAxis
            type="number"
            dataKey="x"
            name={selectedFeature?.label}
            label={{
              value: selectedFeature?.label,
              position: "insideBottom",
              offset: -20,
            }}
          />

          <YAxis
            type="number"
            dataKey="price"
            name="Price"
            tickFormatter={(value) =>
              `$${Number(value).toLocaleString()}`
            }
            label={{
              value: "House Price",
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            formatter={(value, name) => {
              if (name === "Price") {
                return [`$${Number(value).toLocaleString()}`, "Price"];
              }

              return [value, selectedFeature?.label ?? "Feature"];
            }}
            labelFormatter={() => ""}
          />

          <Scatter
            name="House Price"
            data={chartData}
          />
        </ScatterChart>
      </ResponsiveContainer>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Showing {chartData.length} houses. X-axis:{" "}
        <strong>{selectedFeature?.label}</strong>. Y-axis:{" "}
        <strong>Price</strong>.
      </Typography>
    </Box>
  );
};

export default HousePriceChart;

