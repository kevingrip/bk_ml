const axios = require('axios');

import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN

// URL para buscar las órdenes
const url = `https://api.mercadolibre.com/orders/search?seller=1005868067&order.date_created.from=2025-04-15T00:00:00Z&order.date_created.to=2025-04-15T23:59:59Z`;



axios.get(url, {
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  const orders = response.data.results;

  orders.forEach((venta) =>{
    if (venta.payments[0].reason==="Alfombra Rascador Para Gatos Adhesiva - Proteccion Muebles" && venta.pack_id===2000007631042553){
      console.log("\n")
      console.log("VENTAID : ",venta.pack_id)
      console.log("ORDERID : ",venta.id)
    if (venta.order_items){
      venta.order_items.forEach(itt => {
        console.log("Titulo: ",itt.item.title)
        console.log("Cantidad: ",itt.quantity)
        console.log(itt.item.variation_attributes[0].value_name)
      });
    }
    console.log("Envio: ",venta.shipping.id)
    console.log("Usuario",venta.buyer.nickname)
    console.log("Fecha:",venta.date_created)
    }
    
  
    
  })
  
  
})
.catch(error => {
  console.error('❌ Error al obtener las órdenes:', error.response?.data || error.message);
});
