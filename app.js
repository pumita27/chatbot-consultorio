const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@builderbot/bot')
const { MetaProvider } = require('@builderbot/provider-meta')
const { JsonFileDB } = require('@builderbot/database-json')

// ─── FLUJO: BIENVENIDA ───────────────────────────────────────────
const flowBienvenida = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    `¡Hola! 👋 Bienvenido/a al consultorio del *Dr. Puma Choque Rolando*.\n` +
    `Soy el asistente virtual y estoy acá para ayudarte.\n\n` +
    `¿Qué síntoma o problema querés evaluar?\n\n` +
    `1️⃣ Reflujo / acidez / ardor\n` +
    `2️⃣ Dificultad para tragar\n` +
    `3️⃣ Dolor abdominal / vesícula\n` +
    `4️⃣ Ya tengo un diagnóstico\n` +
    `5️⃣ Quiero una segunda opinión\n` +
    `6️⃣ Información general (turnos, honorarios)`,
    { capture: true },
    async (ctx, { gotoFlow }) => {
      const resp = ctx.body.trim()
      if (resp === '1') return gotoFlow(flowReflujo)
      if (resp === '2') return gotoFlow(flowDisfagia)
      if (resp === '3') return gotoFlow(flowVesicula)
      if (resp === '4') return gotoFlow(flowDiagnostico)
      if (resp === '5') return gotoFlow(flowSegundaOpinion)
      if (resp === '6') return gotoFlow(flowInfo)
      return gotoFlow(flowNoEntendido)
    }
  )

// ─── FLUJO: REFLUJO ──────────────────────────────────────────────
const flowReflujo = addKeyword([])
  .addAnswer(
    `Entiendo. El reflujo, la acidez y la hernia hiatal son algunas de las consultas más frecuentes en cirugía digestiva alta.\n\n` +
    `El Dr. Puma Choque Rolando está especializado en:\n` +
    `• Evaluación y tratamiento del reflujo gastroesofágico\n` +
    `• Diagnóstico y cirugía de hernia hiatal\n` +
    `• Cirugía antirreflujo (funduplicatura laparoscópica)\n\n` +
    `¿Querés coordinar una consulta presencial o una teleconsulta?\n\n` +
    `1️⃣ Consulta presencial\n` +
    `2️⃣ Teleconsulta (solo particulares)\n` +
    `3️⃣ Quiero más información primero`,
    { capture: true },
    async (ctx, { gotoFlow }) => {
      const resp = ctx.body.trim()
      if (resp === '1' || resp === '2') return gotoFlow(flowSolicitarTurno)
      return gotoFlow(flowMasInfo)
    }
  )

// ─── FLUJO: DISFAGIA ─────────────────────────────────────────────
const flowDisfagia = addKeyword([])
  .addAnswer(
    `La dificultad para tragar puede tener diferentes causas. El Dr. Puma Choque Rolando se especializa en:\n\n` +
    `• Diagnóstico y tratamiento de acalasia\n` +
    `• Trastornos motores esofágicos\n` +
    `• Miotomía de Heller laparoscópica\n\n` +
    `Es importante evaluarte a tiempo. ¿Querés coordinar una consulta?\n\n` +
    `1️⃣ Sí, quiero turno\n` +
    `2️⃣ Quiero más información primero`,
    { capture: true },
    async (ctx, { gotoFlow }) => {
      const resp = ctx.body.trim()
      if (resp === '1') return gotoFlow(flowSolicitarTurno)
      return gotoFlow(flowMasInfo)
    }
  )

// ─── FLUJO: VESÍCULA ─────────────────────────────────────────────
const flowVesicula = addKeyword([])
  .addAnswer(
    `El dolor abdominal relacionado a la vesícula es muy frecuente. El Dr. Puma Choque Rolando realiza:\n\n` +
    `• Colecistectomía laparoscópica (extracción de vesícula)\n` +
    `• Evaluación y diagnóstico de cólicos biliares\n` +
    `• Cirugía mínimamente invasiva\n\n` +
    `¿Querés coordinar una consulta para evaluarte?\n\n` +
    `1️⃣ Sí, quiero turno\n` +
    `2️⃣ Quiero más información primero`,
    { capture: true },
    async (ctx, { gotoFlow }) => {
      const resp = ctx.body.trim()
      if (resp === '1') return gotoFlow(flowSolicitarTurno)
      return gotoFlow(flowMasInfo)
    }
  )

// ─── FLUJO: YA TENGO DIAGNÓSTICO ─────────────────────────────────
const flowDiagnostico = addKeyword([])
  .addAnswer(
    `Perfecto, en ese caso lo mejor es una consulta directa con el Dr. Puma Choque Rolando para revisar tu situación en detalle.\n\n` +
    `Podemos coordinar:\n` +
    `1️⃣ Consulta presencial\n` +
    `2️⃣ Teleconsulta (solo particulares)`,
    { capture: true },
    async (ctx, { gotoFlow }) => gotoFlow(flowSolicitarTurno)
  )

// ─── FLUJO: SEGUNDA OPINIÓN ──────────────────────────────────────
const flowSegundaOpinion = addKeyword([])
  .addAnswer(
    `Una segunda opinión es siempre una decisión inteligente antes de una cirugía.\n\n` +
    `El Dr. Puma Choque Rolando recibe consultas de segunda opinión tanto presenciales como por teleconsulta.\n\n` +
    `¿Cómo preferís hacerlo?\n\n` +
    `1️⃣ Consulta presencial\n` +
    `2️⃣ Teleconsulta`,
    { capture: true },
    async (ctx, { gotoFlow }) => gotoFlow(flowSolicitarTurno)
  )

// ─── FLUJO: INFORMACIÓN GENERAL ──────────────────────────────────
const flowInfo = addKeyword([])
  .addAnswer(
    `Con gusto te cuento:\n\n` +
    `📅 *Turnos:* Con turno programado. Los horarios varían según agenda.\n` +
    `💻 *Teleconsultas:* Disponibles para pacientes particulares.\n` +
    `🏥 *Cirugías:* Programadas en instituciones asociadas.\n` +
    `💳 *Obras sociales:* Trabajamos con obras sociales y pacientes particulares.\n` +
    `💰 *Honorarios:* Varían según el tipo de consulta o procedimiento. Para información personalizada, dejá tus datos y te contactamos.\n\n` +
    `¿Querés solicitar un turno?\n\n` +
    `1️⃣ Sí, quiero turno\n` +
    `2️⃣ No por ahora, gracias`,
    { capture: true },
    async (ctx, { gotoFlow, endFlow }) => {
      const resp = ctx.body.trim()
      if (resp === '1') return gotoFlow(flowSolicitarTurno)
      return endFlow('¡Perfecto! Cuando quieras podés escribirnos. ¡Que te vaya bien! 😊')
    }
  )

// ─── FLUJO: SOLICITAR TURNO ──────────────────────────────────────
const flowSolicitarTurno = addKeyword([])
  .addAnswer('Para coordinar tu turno necesito algunos datos. ¿Cuál es tu nombre completo?', { capture: true },
    async (ctx, { state }) => { await state.update({ nombre: ctx.body }) })
  .addAnswer('¿Cuál es el mejor horario para que te contactemos? (ej: mañanas, tardes, cualquiera)', { capture: true },
    async (ctx, { state }) => { await state.update({ horario: ctx.body }) })
  .addAnswer('¿Tenés obra social o sos paciente particular?', { capture: true },
    async (ctx, { state }) => { await state.update({ cobertura: ctx.body }) })
  .addAnswer(
    async (ctx, { state, flowDynamic }) => {
      const datos = state.getMyState()
      await flowDynamic([
        `¡Perfecto, ${datos.nombre}! 🙌\n\n` +
        `Recibimos tu solicitud de turno:\n` +
        `• Horario preferido: ${datos.horario}\n` +
        `• Cobertura: ${datos.cobertura}\n\n` +
        `El Dr. Puma Choque Rolando o su equipo se van a comunicar con vos a la brevedad por este mismo WhatsApp.\n\n` +
        `¡Muchas gracias por contactarte! 😊`
      ])
    }
  )

// ─── FLUJO: MÁS INFORMACIÓN ──────────────────────────────────────
const flowMasInfo = addKeyword([])
  .addAnswer(
    `Podés escribirnos directamente por este WhatsApp para cualquier consulta adicional.\n\n` +
    `Si en algún momento querés pedir turno, con gusto te ayudamos. ¡Que te vaya bien! 😊`
  )

// ─── FLUJO: NO ENTENDIDO ─────────────────────────────────────────
const flowNoEntendido = addKeyword([])
  .addAnswer(
    `Disculpá, no entendí tu respuesta. Por favor respondé con el número de la opción:\n\n` +
    `1️⃣ Reflujo / acidez\n2️⃣ Dificultad para tragar\n3️⃣ Dolor abdominal / vesícula\n` +
    `4️⃣ Ya tengo diagnóstico\n5️⃣ Segunda opinión\n6️⃣ Información general`
  )

// ─── INICIO DEL BOT ──────────────────────────────────────────────
const http = require('http')

const main = async () => {
  const adapterDB = new JsonFileDB({ filename: 'db.json' })
  const adapterProvider = new MetaProvider({
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: 'v18.0',
    port: 3008,
  })
  const adapterFlow = createFlow([
    flowBienvenida, flowReflujo, flowDisfagia, flowVesicula,
    flowDiagnostico, flowSegundaOpinion, flowInfo,
    flowSolicitarTurno, flowMasInfo, flowNoEntendido
  ])
  await createBot({ flow: adapterFlow, provider: adapterProvider, database: adapterDB })

  http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Bot activo')
}).listen(process.env.PORT || 8080)

  console.log('Bot iniciado correctamente ✅')
}

main()
