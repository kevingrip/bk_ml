const axios = require('axios');

import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN

// URL para buscar las órdenes
const url = `https://api.mercadolibre.com/orders/search?seller=1005868067&order.date_created.from=2025-04-15T00:00:00Z`;



axios.get(url, {
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  const orders = response.data.results;

  orders.forEach(element => {
    if (element.id===2000011383587664){
        console.dir(element, { depth: null });
      }
  });  
  
        

  
})
.catch(error => {
  console.error('❌ Error al obtener las órdenes:', error.response?.data || error.message);
});
