import api from "../api";

export const plans = [
  {
    id: 1,
    title: "FREE",
    price: "",
    btn_title: "Free plan",
    btn_color: "#1eee",
    d_1: "20 transformations per month",
    d_2: "Standart file size (Max 3Mb file/webpage size)",
    d_3: "Standart URLs processing (3 URLs per batch)",
  },
 
  {
    id: 2,
    title: "PLUS",
    price: "USD $19/mo",
    btn_title: "Subscribe",
    btn_color: "#1eee",
    d_1: "100 transformations per month",
    d_2: "Extended file size (Max 10Mb file/webpage size)",
    d_3: "Extended URLs processing (10 URLs per batch, autopagination and autoscrolling)",
  },
  {
    id: 3,
    title: "ENTERPRISE",
    price: "",
    btn_title: "Contact Us",
    btn_color: "#1eee",
    d_1: "More transformations, larger files/webpages",
    d_2: "Full website transformation (scan and scrape from entire Website)",
    d_3: "API, Scheduler, More Integrations",
  },
  {
    id: 4,
    title: "TRIAL",
    price: "",
    btn_title: "Free plan",
    btn_color: "#1eee",
    d_1: "25 transformations per month",
    d_2: "Standart file size (Max 10Mb file/webpage size)",
    d_3: "Standart URLs processing (5 URLs per batch)",
  },
];


export const getSubscriptionsPlans = async () => {
  try {
    let response = await api.get('/subscription/plans')  
    // console.log(response,"responseasfasfa")
    const filteredData = response?.data.filter(res => res.name);
    return getConvertedPlans(filteredData);
  } catch (err) {
    console.log('Error', err);
  }
}

export const getConvertedPlans = (plans) => {
  // console.log(plans,"plans")
  return plans?.map((data) => (   
    {  
    id: data['_id'],
    title: data['name'],   
    price: data['price'] === 0 
    ? '' 
    : `${data['price']} ${data['durationMonths'] === 1 ? '/month' : '/year'}`,
    btn_title: data.name != 'FREE' ? 'Subscribe' : `${data['name']} plan`,
    btn_color: "#1eee",
    durationMonths: data['durationMonths'],    
    d_1: `${data['conversionsPerMonth']} transformations per month`,
    d_2: `Standart file size (Max ${data['maxFileSizeMb']}Mb file/webpage size)`,
    d_3: `Standart URLs processing (${data['urlsPerBatch']} URLs per batch)`,    
  }))
}
