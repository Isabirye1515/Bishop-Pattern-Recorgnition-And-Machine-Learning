export interface MelbourneHouse {
  Suburb: string;
  Address: string;
  Rooms: number;
  Type: string;
  Price: number | null;
  Method: string;
  SellerG: string;
  Date: string;
  Distance: number;
  Postcode: number | null;
  Bedroom2: number | null;
  Bathroom: number | null;
  Car: number | null;
  Landsize: number | null;
  BuildingArea: number | null;
  YearBuilt: number | null;
  CouncilArea: string | null;
  Lattitude: number | null;
  Longtitude: number | null;
  Regionname: string | null;
  Propertycount: number | null;
}

const endpoint = "api/houses";

export const getHouses = async (): Promise<MelbourneHouse[]> => {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: MelbourneHouse[] = await response.json();

  return data;
};
