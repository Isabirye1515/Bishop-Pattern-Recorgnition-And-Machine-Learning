import { useEffect, useState } from "react";
import { getHouses } from "../utils";
import type { MelbourneHouse } from "../utils";
import HouseTable from "./HouseTable";

const Houses = () => {
  const [houses, setHouses] = useState<MelbourneHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const data = await getHouses();
        setHouses(data);
      } catch (error) {
        console.error("Failed to fetch houses:", error);
        setError("Failed to load houses.");
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  if (loading) {
    return <p>Loading houses...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Melbourne Houses</h1>

      <p>Total houses: {houses.length}</p>

      <HouseTable houses={houses} />
    </div>
  );
};

export default Houses;

