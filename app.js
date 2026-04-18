const express = require('express')
const axios = require('axios')
const app = express()
app.use(express.json())

const TOKEN = process.env.VERIFY_TOKEN
const JWT = process.env.JWT_TOKEN
const NUMBER_ID = process.env.NUMBER_ID

const estado = {}

async function enviar(telefono, mensaje) {
  try {
    const url = `https://graph.facebook.com/v19.0/${NUMBER_ID}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      to: telefono,
      type: 'text',
      text: { body: mensaje }
    }
    console.log('Enviando a:', telefono)
    console.log('NUMBER_ID:', NUMBER_ID)
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json'
      }
    })
    console.log('Enviado OK:', JSON.stringify(response.data))
  } catch (e) {
    console.error('Error detallado:', JSON.stringify(e.response?.data))
    console.error('Status:', e.response?.status)
  }
}

async function procesar(telefono, mensaje) {
  const s = estado[telefono] || { paso: 'inicio' }
  const r = mensaje.trim()

  if (s.paso === 'inicio') {
    estado[telefono] = { paso: 'menu' }
    await enviar(telefono,
      '¡Hola! 👋 Bienvenido/a al consultorio del *Dr. Puma Choque Rolando*.\n' +
      'Soy el asistente virtual y estoy acá para ayudarte.\n\n' +
      '¿Qué síntoma o problema querés evaluar?\n\n' +
      '1️⃣ Reflujo / acidez / ardor\n' +
      '2️⃣ Dificultad para tragar\n' +
      '3️⃣ Dolor abdominal / vesícula\n' +
      '4️⃣ Ya tengo un diagnóstico\n' +
      '5️⃣ Quiero una segunda opinión\n' +
      '6️⃣ Información general (turnos, honorarios)'
    )
    return
  }

  if (s.paso === 'menu') {
    if (r === '1') {
      estado[telefono] = { paso: 'turno' }
      await enviar(telefono,
        'Entiendo. El reflujo, la acidez y la hernia hiatal son consultas muy frecuentes.\n\n' +
        'El Dr. Puma Choque Rolando está especializado en:\n' +
        '• Evaluación y tratamiento del reflujo gastroesofágico\n' +
        '• Diagnóstico y cirugía de hernia hiatal\n' +
        '• Cirugía antirreflujo (funduplicatura laparoscópica)\n\n' +
        '¿Querés coordinar una consulta? Decime tu nombre completo para empezar.'
      )
    } else if (r === '2') {
      estado[telefono] = { paso: 'turno' }
      await enviar(telefono,
        'La dificultad para tragar puede tener diferentes causas.\n\n' +
        'El Dr. Puma Choque Rolando se especializa en:\n' +
        '• Diagnóstico y tratamiento de acalasia\n' +
        '• Trastornos motores esofágicos\n' +
        '• Miotomía de Heller laparoscópica\n\n' +
        'Es importante evaluarte a tiempo. ¿Cuál es tu nombre completo?'
      )
    } else if (r === '3') {
      estado[telefono] = { paso: 'turno' }
      await enviar(telefono,
        'El dolor abdominal relacionado a la vesícula es muy frecuente.\n\n' +
        'El Dr. Puma Choque Rolando realiza:\n' +
        '• Colecistectomía laparoscópica\n' +
        '• Evaluación de cólicos biliares\n' +
        '• Cirugía mínimamente invasiva\n\n' +
        '¿Querés coordinar una consulta? Decime tu nombre completo.'
      )
    } else if (r === '4') {
      estado[telefono] = { paso: 'turno' }
      await enviar(telefono,
        'Perfecto, lo mejor es una consulta directa para revisar tu situación en detalle.\n\n' +
        '¿Cuál es tu nombre completo?'
      )
    } else if (r === '5') {
      estado[telefono] = { paso: 'turno' }
      await enviar(telefono,
        'Una segunda opinión es siempre una decisión inteligente antes de una cirugía.\n\n' +
        'El Dr. Puma Choque Rolando recibe consultas de segunda opinión presenciales y por teleconsulta.\n\n' +
        '¿Cuál es tu nombre completo?'
      )
    } else if (r === '6') {
      estado[telefono] = { paso: 'menu' }
      await enviar(telefono,
        'Con gusto te cuento:\n\n' +
        '📅 *Turnos:* Con turno programado. Horarios variables según agenda.\n' +
        '💻 *Teleconsultas:* Disponibles para pacientes particulares.\n' +
        '🏥 *Cirugías:* Programadas en instituciones asociadas.\n' +
        '💳 *Obras sociales:* Trabajamos con obras sociales y particulares.\n' +
        '💰 *Honorarios:* Varían según consulta o procedimiento.\n\n' +
        'Para información personalizada escribí *turno* y te ayudamos a coordinar.'
      )
    } else {
      await enviar(telefono,
        'Disculpá, no entendí. Por favor respondé con el número de la opción:\n\n' +
        '1️⃣ Reflujo / acidez\n' +
        '2️⃣ Dificultad para tragar\n' +
        '3️⃣ Dolor abdominal / vesícula\n' +
        '4️⃣ Ya tengo diagnóstico\n' +
        '5️⃣ Segunda opinión\n' +
        '6️⃣ Información general'
      )
    }
    return
  }

  if (s.paso === 'turno') {
    estado[telefono] = { paso: 'horario', nombre: r }
    await enviar(telefono, `Gracias, ${r}. ¿Cuál es el mejor horario para contactarte? (ej: mañanas, tardes, cualquiera)`)
    return
  }

  if (s.paso === 'horario') {
    estado[telefono] = { ...s, paso: 'cobertura', horario: r }
    await enviar(telefono, '¿Tenés obra social o sos paciente particular?')
    return
  }

  if (s.paso === 'cobertura') {
    const datos = { ...s, cobertura: r }
    estado[telefono] = { paso: 'menu' }
    await enviar(telefono,
      `¡Perfecto, ${datos.nombre}! 🙌\n\n` +
      `Recibimos tu solicitud:\n` +
      `• Horario preferido: ${datos.horario}\n` +
      `• Cobertura: ${datos.cobertura}\n\n` +
      `El Dr. Puma Choque Rolando o su equipo te contactarán a la brevedad.\n\n` +
      `¡Muchas gracias! 😊`
    )
    return
  }
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && token === TOKEN) {
    console.log('Webhook verificado ✅')
    res.status(200).send(challenge)
  } else {
    res.sendStatus(403)
  }
})

app.post('/webhook', async (req, res) => {
  res.sendStatus(200)
  try {
    const entry = req.body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const msg = value?.messages?.[0]
    if (!msg) return
    let telefono = msg.from
if (telefono.startsWith('549')) {
  telefono = '54' + telefono.slice(3)
}
    const texto = msg.text?.body || ''
    console.log('Mensaje recibido de:', telefono, '→', texto)
    await procesar(telefono, texto)
  } catch (e) {
    console.error('Error webhook:', JSON.stringify(e.response?.data || e.message))
  }
})

app.get('/', (req, res) => res.send('Bot activo ✅'))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT} ✅`))
