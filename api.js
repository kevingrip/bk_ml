import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN

// URL para buscar las órdenes
const url = `https://api.mercadolibre.com/orders/search?seller=1005868067&order.date_created.from=2025-04-06T00:00:00Z`;

var ventaid;

const headers = {
  Authorization: `Bearer ${access_token}`,
  'Content-Type': 'application/json'
}

axios.get(url, {
  headers
})
.then(async response => {
  const orders = response.data.results;
  const agrupado ={}
  

  orders.forEach((venta) =>{
    if (venta.payments[0].reason==="Alfombra Rascador Para Gatos Adhesiva - Proteccion Muebles" && venta.id===2000011244603096){
    if (venta.order_items){        
        if (venta.pack_id){
            ventaid = venta.pack_id
        }else{
            ventaid = venta.id
        }
        if (!agrupado[ventaid]){
            agrupado[ventaid] = {
                ventaid: ventaid,
                mercadopagoID: venta.payments[0].id,                
                nickname: venta.buyer.nickname || null,
                date_created: venta.date_created || null,
                orden:[],
                shipping: {id: venta.shipping.id || null}
            };
        }
        venta.order_items.forEach(itt => {

            const ventaOrden = {
                orderid: venta.id,
                titulo: itt.item.title,
                cantidad: itt.quantity,
                color: itt.item.variation_attributes[0].value_name,
                precioTotal: itt.full_unit_price,
                precioReal: itt.unit_price,
                comision: itt.sale_fee
            }
            agrupado[ventaid].orden.push(ventaOrden)
          });
        }
    }
    
  
    
  })


  const allVentas = Object.values(agrupado)
  await Promise.all(
    allVentas.map( async (venta)=>{
      try {
        const apiEnvios = await axios.get(`https://api.mercadolibre.com/shipments/${venta.shipping.id}`, { headers });
        const envio = apiEnvios.data.logistic_type === 'xd_drop_off' ? 'Despacho' : 'Flex'
        agrupado[venta.ventaid].shipping.tipoEnvio = envio
        agrupado[venta.ventaid].shipping.status = apiEnvios.data.status
      } catch (error) {
        console.error('error envio');
      }
    })
  )
  
  console.dir(allVentas, { depth: null });
  
})
.catch(error => {
  console.error('❌ Error al obtener las órdenes:', error.response?.data || error.message);
});