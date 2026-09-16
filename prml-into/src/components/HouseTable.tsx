import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from "@mui/material"; 
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
               <TableCell>Method</TableCell> 
               <TableCell>SellerG</TableCell> 
               <TableCell>Date</TableCell> 
               <TableCell>Distance</TableCell> 
               <TableCell>Postcode</TableCell> 
               <TableCell>Bedroom2</TableCell> 
               <TableCell>Bathroom</TableCell> 
               <TableCell>Car</TableCell> 
               <TableCell>Landsize</TableCell> 
               <TableCell>BuildingArea</TableCell> 
               <TableCell>YearBuilt</TableCell> 
               <TableCell>CouncilArea</TableCell> 
               <TableCell>Lattitude</TableCell> 
               <TableCell>Longtitude</TableCell> 
               <TableCell>Regionname</TableCell> 
               <TableCell>Propertycount</TableCell> 
               </TableRow> </TableHead> 
               <TableBody> {houses.map((house) => ( 
                <TableRow key={`${house.Address}-${house.Date}`}> 
                <TableCell>{house.Suburb}</TableCell> 
                <TableCell>{house.Address}</TableCell> 
                <TableCell>{house.Rooms}</TableCell> 
                <TableCell>{house.Type}</TableCell> 
                <TableCell> {house.Price?.toLocaleString() ?? "N/A"} </TableCell>
                 <TableCell>{house.Method}</TableCell> 
                 <TableCell>{house.SellerG}</TableCell> 
                 <TableCell>{house.Date}</TableCell> 
                 <TableCell>{house.Distance}</TableCell> 
                 <TableCell> {house.Postcode ?? "N/A"} </TableCell> 
                 <TableCell> {house.Bedroom2 ?? "N/A"} </TableCell> 
                 <TableCell> {house.Bathroom ?? "N/A"} </TableCell> 
                 <TableCell> {house.Car ?? "N/A"} </TableCell> 
                 <TableCell> {house.Landsize ?? "N/A"} </TableCell> 
                 <TableCell> {house.BuildingArea ?? "N/A"} </TableCell> 
                 <TableCell> {house.YearBuilt ?? "N/A"} </TableCell> 
                 <TableCell> {house.CouncilArea ?? "N/A"} </TableCell> 
                 <TableCell> {house.Lattitude ?? "N/A"} </TableCell> 
                 <TableCell> {house.Longtitude ?? "N/A"} </TableCell> 
                 <TableCell> {house.Regionname ?? "N/A"} </TableCell> 
                 <TableCell> {house.Propertycount ?? "N/A"} </TableCell> 
                 </TableRow> ))} 
                 </TableBody> 
                 </Table> 
                 </TableContainer> 
                 ); 
                }; 
                 export default HouseTable;