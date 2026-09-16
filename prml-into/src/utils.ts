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

export interface Chapter{
  name:string,
  number: number,
  description:string,
  link:string
  hasChildren?:boolean,
  children?:Chapter[]

}
export const Chapters:Chapter[] = [
  {name:"Introducing Polynomial Models",
    description:"Polynonial Models and Curve fitting",
    number:1,
    link:"/intro",
    children:
[ { name: "Data Visualisation", number: 1.1, link: "/scatter-graph", description: "...", }, 
  { name: "Polynomial Fit Graph", number: 1.2, link: "/polynomial-fit", description: "...", }, 
  { name: "Maximum Likelihood", number: 1.3, link: "/maximum-likelihood", description: "...", }, ]
    
   }
]

const endpoint = "api/houses";

export const getHouses = async (): Promise<MelbourneHouse[]> => {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: MelbourneHouse[] = await response.json();

  return data;
};

export const getFromServer = async(endpoint:string,callback:Function)=>{
  try{
  const response = await fetch(endpoint)
  if(response.ok){
    let data = await response.json()
    callback(data)

  }
}catch(error){
  console.error(error)

}
}
