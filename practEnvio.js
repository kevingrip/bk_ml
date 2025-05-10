import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const access_token = process.env.ML_ACCESS_TOKEN
const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
}

const shipps = async (id) =>{
    try {
        const response = await axios.get(`https://api.mercadolibre.com/shipments/${id}`,{headers})
        return response.data
    } catch (error) {
        console.error('error en solicitud envio')
    }
}

const app = async()=>{
    try {
        const dataEnvio = await shipps(44843444681)
        console.dir(dataEnvio,{depth:null})
    } catch (error) {
        
    }
}

app()