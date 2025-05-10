import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const token = process.env.ML_ACCESS_TOKEN
// Solución para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shipmentId = '44805683914';


const url = `https://api.mercadolibre.com/shipment_labels?shipment_ids=${shipmentId}&savePdf=Y`;

try {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Usa arrayBuffer() en lugar de buffer()
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = path.join(__dirname, 'etiqueta.pdf');
  fs.writeFileSync(filePath, buffer);
  console.log('Etiqueta guardada como etiqueta.pdf');
} catch (error) {
  console.error('Error al descargar la etiqueta:', error.message);
}
