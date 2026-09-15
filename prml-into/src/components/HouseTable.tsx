
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import type { MelbourneHouse } from "../utils";

interface HouseTableProps {
  houses: MelbourneHouse[];
}

const HouseTable = ({ houses }: HouseTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Suburb</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Rooms</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Distance</TableCell>
            <TableCell>Bathroom</TableCell>
            <TableCell>Landsize</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {houses.map((house) => (
            <TableRow key={`${house.Address}-${house.Date}`}>
              <TableCell>{house.Suburb}</TableCell>
              <TableCell>{house.Address}</TableCell>
              <TableCell>{house.Rooms}</TableCell>
              <TableCell>{house.Type}</TableCell>

              <TableCell>
                {house.Price?.toLocaleString() ?? "N/A"}
              </TableCell>

              <TableCell>{house.Distance}</TableCell>

              <TableCell>
                {house.Bathroom ?? "N/A"}
              </TableCell>

              <TableCell>
                {house.Landsize ?? "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default HouseTable