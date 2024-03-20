import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  const { email, nombre, token } = datos

  const info = await transport.sendMail({
    from: 'APV - Administrador',
    to: email,
    subject: 'Confirma tu cuenta - Esto no es un SAPAM',
    text: 'Confirma tu cuenta en APV',
    html: `<p>Hola ${nombre}, comprueba tu cuenta en APV</p>
        <p>Debes confirmar la cuenta, solo debes ir al enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>
        <p>Si tu no creaste esta cuenta, puede ignorar este mensaje</p>`
  })
  console.log('Mensaje enviado: %s', info.messageId)
}

export default emailRegistro
