
import { Route, Routes } from 'react-router-dom'
import './App.css'
import HeaderPage from './components/header'
import HousePriceChart from './components/graphs/scatergraph'
import { getHouses, type MelbourneHouse } from './utils';
import { useEffect, useState } from 'react';

function App() {
   const [houses, setHouses] = useState<MelbourneHouse[]>([]);
     useEffect(() => {
       const fetchHouses = async () => {
         try {
           const data = await getHouses();
           setHouses(data);
         } catch (error) {
           console.error("Failed to fetch houses:", error);
         }
       };
   
       fetchHouses();
     }, []);

  return (
      <>
      <HeaderPage />
      <Routes>
        <Route path='/scatter-graph' element={<HousePriceChart houses={houses} />} />
      </Routes>
      </>
  )
}

export default App
