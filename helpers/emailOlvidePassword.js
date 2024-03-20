import nodemailer from 'nodemailer'

const emailOlvidePassword = async (datos) => {
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
    subject: 'Restablecer contraseña',
    text: 'Restablecer contraseña en APV',
    html: `<p>Hola ${nombre}, has solicitado restablecer tu contraseña</p>
           <a href='${process.env.FRONTEND_URL}/olvide-password/${token}'>
           Restablecer contraseña</a>`
  })
  console.log('Mensaje enviado: %s', info.messageId)
}

export default emailOlvidePassword
