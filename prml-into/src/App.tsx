
import { Route, Routes } from 'react-router-dom'
import './App.css'
import HeaderPage from './components/header'
import HousePriceChart from './components/graphs/scatergraph'
import { getHouses, type MelbourneHouse } from './utils';
import { useEffect, useState } from 'react';
import PolynomialFitPage from './components/graphs/polynomialFitGraph';
import MaximumLikelihood from './components/graphs/maximumlikelihood';
import Introduction from './components/intoduction';

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
        <Route path='/' element={<Introduction/>} />
        <Route path='/scatter-graph' element={<HousePriceChart houses={houses} />} />
        <Route path = "/polynomial-fit" element={<PolynomialFitPage/>} />
        <Route path = "/maximum-likelihood" element={<MaximumLikelihood />} />
      </Routes>
      </>
  )
}

export default App
