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

export interface Video{
  id:number,
  title:string,
  description:string,
  url:string,
}

export const Videos:Video[] = [
  {id:1,
    description:"Understanding Maximum Likelihood",
    title:"Maximum Likelihood",
    url:"https://youtube.com/shorts/6wXNpMeeg0E?si=bYcLKVsY6ltQ5OgN"
  },
  {id:2,
    title:"Regulisation",
    description:"Understanding Regularization",
    url:"https://youtu.be/eoLXse6rvxE?si=JH19U2gNe3_fLdvd"
  },
  {id:3,
    title:"Prior And Posterior",
    description:"Understanding Prior and Posterior",
    url:"https://youtu.be/HEnJRwJ23us?si=kTi6r7STfmlxTRqY"
  },
  {
    id:4,
    title:"Conjugatte Prior",
    description:"Understanding Conjugate Prior",
    url:"https://youtu.be/mvGj4OKbDcY?si=WKGG-cmx9dKtxdHY"
  },
  {
    id:5,
    title:"Bayes theorem for gussian variables.",
    description:"Understanding Bayes theorem for gussian variables.",
    url:"https://youtu.be/ocYQhNxt8WY?si=Zb4eL7gKU6qknOI8"
  }
,
{
    id:5,
    title:"Multinomial Distribution",
    description:"Understanding Multinomial Distribution",
    url:"https://youtu.be/syVW7DgvUaY"
  },
  {id:7,
    title:"Eigenvalues and Eigenvectors",
    description:"Understanding Eigenvalues and Eigenvectors",
    url:"https://youtu.be/BWvx4wUSGdA?si=nJSVLV70yjYZWoo_"
  }


]

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
  { name: "Maximum Likelihood", number: 1.3, link: "/maximum-likelihood", description: "...", },
 ]
    
   },
   {name:"Probability Distributions",
    number:2,
    description:"Understanding Probability Distributions",
    link:"/binomial-graph",
    children:[
      { name: "Bayesian Bernoulli", number: 2.1, link: "/binomial-graph", description: "...", },
      { name: "Multinomial Distribution", number: 2.2, link: "/multinomial", description: "...", },
      { name: "Gaussian Distribution", number: 2.3, link: "/guassian", description: "...", }
    ]
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
export interface MultinomialItem {
  category: string;
  count: number;
  mle: number;
  posterior: number;
}

export interface MultinomialResponse {
  feature: string;
  n: number;
  k: number;
  prior: { alpha: number[]; alpha0: number };
  posterior: { alpha: number[]; alpha0: number };
  log_likelihood: number;
  log_multinomial_coefficient: number;
  multinomial_probability: number;
  dirichlet_pdf_at_mle: number;
  combined: MultinomialItem[];
}

export const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  Type: {
    h: "House",
    t: "Townhouse",
    u: "Unit",
  },
  Method: {
    S: "Sold",
    SP: "Sold Prior",
    PI: "Passed In",
    VB: "Vendor Bid",
    SA: "Sold After",
  },
  Regionname: {
    "Northern Metropolitan": "Northern Metropolitan",
    "Southern Metropolitan": "Southern Metropolitan",
    "Western Metropolitan": "Western Metropolitan",
    "Eastern Metropolitan": "Eastern Metropolitan",
  },
  CouncilArea: {},
};
