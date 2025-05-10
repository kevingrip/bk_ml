import axios from 'axios'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN


import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = express()

const url = `https://api.mercadolibre.com/orders/search?seller=1005868067&order.date_created.from=2025-05-01T00:00:00Z`;

const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }

var ventaid;

const traduccionSub = (estado)=>{
    if (estado==='printed'){
        return 'Etiqueta impresa'
    } else if (estado==='in_hub'){
        return 'Despachado'
    } else if (estado==='ready_to_print'){
        return 'Etiqueta lista para imprimir'
    }else if (estado==='waiting_for_withdrawal'){
        return 'Esperando el retiro'
    }else if (estado==='out_for_delivery'){
        return 'Envio reprogramado'
    } else{
        return estado
    }
}

const traduccionEstado = (estado)=>{
    if (estado==='ready_to_ship'){
        return 'Listo para enviar'
    } else if (estado==='delivered'){
        return 'Entregado'
    } else if (estado==='shipped'){
        return 'Enviado'
    }else{
        return estado
    }
}

const urlPay = (id) =>{
    return `https://api.mercadopago.com/v1/payments/${id}`
}

const urlShip = (id) =>{
    return `https://api.mercadolibre.com/shipments/${id}`
}


const orders = async() =>{
    try {
        const response = await axios.get(url,{headers})
        return response.data;
    } catch (error) {
        throw error
    }
}

const payments = async(id) =>{
    try {
        const response = await axios.get(urlPay(id),{headers})
        return response.data;
    } catch (error) {
        throw error
    }
}

const shipps = async (id) =>{
    try {
        const response = await axios.get(urlShip(id),{headers})
        return response.data
    } catch (error) {
        console.error('error en solicitud envio')
    }
}

const app = async() =>{
    try {
        const data = await orders()
                
        const agrupado={}

        for (const venta of data.results) {
            if (venta.order_items && venta.shipping.id){        
                if (venta.pack_id){
                    ventaid = venta.pack_id
                }else{
                    ventaid = venta.id
                }
                if (!agrupado[ventaid]){
                    const pays = await payments(venta.payments[0].id)
                    const ships = await shipps(venta.shipping.id)
                    agrupado[ventaid] = {
                        ventaid: ventaid,                                        
                        nickname: venta.buyer.nickname || null,
                        date_created: venta.date_created || null,
                        orden:[],
                        shipping: {
                            id: ships.id,
                            tipoEnvio: ships.logistic_type=== 'xd_drop_off' ? 'Punto de despacho' : 'Flex' || null,
                            substatus: traduccionSub(ships.substatus),
                            status: traduccionEstado(ships.status),
                            partido: ships.receiver_address.state.name,
                            localidad:ships.receiver_address.city.name,
                            direccion: ships.receiver_address.address_line,
                            coordenadas: `https://www.google.com/maps?q=${ships.receiver_address.latitude},${ships.receiver_address.longitude}`

                        },
                        payments: {
                            mercadopagoID: venta.payments[0].id,
                            money_release_date:pays.money_release_date, 
                            money_release_status:pays.money_release_status, 
                            total_paid_amount:pays.transaction_details.total_paid_amount, 
                            net_received_amount:pays.transaction_details.net_received_amount
                        }
                    };
                }
                venta.order_items.forEach(itt => {
        
                    const ventaOrden = {
                        orderid: venta.id,
                        titulo: itt.item.title,
                        cantidad: itt.quantity,
                        color: itt.item.variation_attributes[0]?.value_name || null,
                    }
                    agrupado[ventaid].orden.push(ventaOrden)
                  });                
            }
            console.dir(agrupado,{depth:null})
            
        };

        const filtroNotDelivered = Object.values(agrupado).filter((item)=> item.shipping.status!='delivered')
        return (agrupado)
        //return (agrupado)
        
    } catch (error) {
        throw error
    }
}

const PORT = 3000

server.use(express.static(path.join(__dirname, 'public'))); // sirve index.html desde /public


server.get('/api', async(req,res) =>{
    const data = await app()
    res.send(data)
})


server.listen(PORT,()=>{
    try {
        console.log(`Servidor corriendo en http://localhost:${PORT}/api`)
    } catch (error) {
        throw error
    }
    
})