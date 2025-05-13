import axios from 'axios'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import generarEtiqueta from './eti.js'

const access_token = process.env.ML_ACCESS_TOKEN
const access_tokenAnis = process.env.ML_ACCESS_TOKEN_2


const PORT = process.env.PORT

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = express()
const sellerAnis = 2385461382
const sellerYo = 1005868067


const url = `https://api.mercadolibre.com/orders/search?seller=${sellerYo}&order.date_created.from=2025-05-05T00:00:00Z`;


// const headers = {
//     Authorization: `Bearer ${access_token}`,
//     'Content-Type': 'application/json'
//   }

const headers = {
Authorization: `Bearer ${access_token}`,
'Content-Type': 'application/json'
}

var ventaid;

const traduccionSub = (estado)=>{
    if (estado==='printed'){
        return 'Etiqueta impresa'
    } else if (estado==='in_hub' || estado==='picked_up'){
        return 'Despachado'
    } else if (estado==='ready_to_print'){
        return 'Etiqueta lista para imprimir'
    }else if (estado==='waiting_for_withdrawal'){
        return 'Esperando el retiro'
    }else if (estado==='out_for_delivery'){
        return 'Envio reprogramado'
    }else if (estado==='in_packing_list'){
        return 'En camino'
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

const tipoEnvio = (env)=>{
    if (env=== 'xd_drop_off' || env=== 'drop_off'){
        return 'Punto de despacho'
    } else if (env=== 'self_service'){
        return 'Flex'
    }else{
        return env
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
        const response1 = await axios.get(url,{headers})
        //const response2 = await axios.get(url1,{headers1})
        // const combinedResults = [
        //     ...response1.data.results,
        //     ...response2.data.results
        // ];
        return response1.data
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
                            tipoEnvio: tipoEnvio(ships.logistic_type),
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

        const filtroNoEnviadas = Object.values(agrupado).filter((item)=> item.shipping.status!='Entregado' && item.shipping.status!='Enviado' && item.shipping.substatus!='Despachado' && item.shipping.substatus!='En camino')
        return (filtroNoEnviadas)
        //return (agrupado)
        
    } catch (error) {
        throw error
    }
}

server.use(express.static(path.join(__dirname, 'public'))); // sirve index.html desde /public
server.use(express.json());


server.get('/api', async(req,res) =>{
    const data = await app()
    res.send(data)
})

server.post('/generar-etiqueta', async (req, res) => {
    const { shipmentId,userId } = req.body;
  try {
    await generarEtiqueta(shipmentId,userId);
    res.json({ success: true }); // ← Esta línea está bien aquí
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


server.listen(PORT,()=>{
    try {
        console.log(`Servidor corriendo en http://localhost:${PORT}/api`)
        console.log(`Pagina corriendo en http://localhost:${PORT}/`)
    } catch (error) {
        throw error
    }
    
})