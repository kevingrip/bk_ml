import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const token = process.env.ML_ACCESS_TOKEN
const access_tokenAnis = process.env.ML_ACCESS_TOKEN_2

// Solución para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const url = (shipmentId) =>{
  return `https://api.mercadolibre.com/shipment_labels?shipment_ids=${shipmentId}&savePdf=Y`;
}


const generarEtiqueta = async(envioId,userId) =>{
  try {
    const response = await fetch(url(envioId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_tokenAnis}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    // Usa arrayBuffer() en lugar de buffer()
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    const filePath = path.join(__dirname, `${userId}.pdf`);
    fs.writeFileSync(filePath, buffer);
    console.log('Etiqueta guardada como etiqueta.pdf');
  } catch (error) {
    console.error('Error al descargar la etiqueta');
  }
}

export default generarEtiqueta