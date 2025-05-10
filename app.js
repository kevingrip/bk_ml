import axios from 'axios'

import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN

const orderUrl = 'https://api.mercadolibre.com/orders/search?seller=1005868067&order.date_created.from=2025-05-01T00:00:00Z'

const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
}

const consulta = async () => {
    try {
        const response = await axios.get(orderUrl, {headers});
        return response
    } catch (error) {
        console.error('Error al consultar órdenes:', error.response?.data || error.message);
    }
}

consulta().then(data=>{
    console.log(data)
})