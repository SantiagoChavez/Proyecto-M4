import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * Handler de la función serverless de Vercel para enviar correos electrónicos.
 * Solo acepta solicitudes de método POST y utiliza AWS SES.
 */
export default async function handler(req, res) {
  // Validar método HTTP
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  const { to, subject, message } = req.body;

  // Validar campos requeridos
  if (!to || !subject || !message) {
    return res.status(400).json({ error: 'Destinatario (to), asunto (subject) y mensaje (message) son obligatorios.' });
  }

  // Inicializar cliente AWS SES con credenciales de entorno
  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Configurar comando de envío
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    // En sandbox de AWS SES, el remitente (Source) y destinatario deben estar verificados.
    // Usar 'to' como remitente por defecto mitiga el sandbox si no hay un SENDER_EMAIL configurado.
    Source: process.env.SENDER_EMAIL || to,
  });

  try {
    await sesClient.send(command);
    return res.status(200).json({ success: true, message: 'Reporte enviado con éxito.' });
  } catch (error) {
    console.error('Error en AWS SES:', error);
    return res.status(500).json({ 
      error: 'Error interno al enviar el reporte por correo.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
