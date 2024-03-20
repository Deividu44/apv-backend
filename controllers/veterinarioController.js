import Veterinario from '../models/Veterinario.js'
import generarJWT from '../helpers/generarJWT.js'
import generarId from '../helpers/generarId.js'
import emailRegistro from '../helpers/emailRegistro.js'
import emailOlvidePassword from '../helpers/emailOlvidePassword.js'

const registrar = async (req, res) => {
  const { email, nombre } = req.body

  // Revisar usuarios duplicados

  const existeUsuario = await Veterinario.findOne({ email })

  if (existeUsuario) {
    const error = new Error('Usuario ya registrado')
    return res.status(400).json({ msg: error.message })
  }

  try {
    // Guardar un nuevo veterinario
    const veterinario = new Veterinario(req.body)
    const veterinarioGuardado = await veterinario.save()

    // Enviar email
    emailRegistro({
      email,
      nombre,
      token: veterinarioGuardado.token
    })

    res.json({ url: 'Desde /api/veterinarios' })
  } catch (error) {
    console.log(error)
  }
}

const perfil = (req, res) => {
  const { veterinario } = req
  res.json({ veterinario })
}

const confirmar = async (req, res) => {
  const { token } = req.params

  const usuarioConfirmar = await Veterinario.findOne({ token })
  if (!usuarioConfirmar) {
    const error = new Error('Token no válido')
    return res.status(404).json({ msg: error.message })
  }

  try {
    usuarioConfirmar.token = null
    usuarioConfirmar.confirmado = true
    await usuarioConfirmar.save()
    res.json({ msg: 'Usuario confirmado correctamente...' })
  } catch (error) {
    console.log(error)
  }
}

const autenticar = async (req, res) => {
  const { email, password } = req.body

  const existeUsuario = await Veterinario.findOne({ email })

  if (!existeUsuario) {
    const error = new Error('Usuario no registrado')
    return res.status(404).json({ msg: error.message })
  }

  // Comprobar si el usuario está confirmado
  if (!existeUsuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada')
    return res.status(403).json({ msg: error.message })
  }

  // Revisar el password
  if (await existeUsuario.comprobarPassword(password)) {
    // Autenticar
    res.json({
      _id: existeUsuario._id,
      nombre: existeUsuario.nombre,
      email: existeUsuario.email,
      token: generarJWT(existeUsuario.id)
    })
  } else {
    console.log('Password no correcto')
  }
}

const olvidePassword = async (req, res) => {
  const { email } = req.body

  const usuario = await Veterinario.findOne({ email })
  console.log(usuario)
  if (!usuario) {
    const error = new Error('El usuario no existe')
    return res.status(403).json({ msg: error.message })
  }

  try {
    usuario.token = generarId()
    await usuario.save()

    // Enviar email recuperación password
    emailOlvidePassword({
      email,
      nombre: usuario.nombre,
      token: usuario.token
    })
    res.json({ msg: 'Hemos enviado un email con las instrucciones' })
  } catch (error) {
    console.log(error)
  }
}

const comprobarToken = async (req, res) => {
  const { token } = req.params
  const tokenValido = await Veterinario.findOne({ token })

  if (tokenValido) {
    res.json({ msg: 'El token es válido, el usuario existe' })
  } else {
    const error = new Error('Token no válido')
    return res.status(403).json({ msg: error.message })
  }
}

const nuevoPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const veterinario = await Veterinario.findOne({ token })

  if (!veterinario) {
    const error = new Error('Hubo un error')
    return res.status(400).json({ msg: error.message })
  }

  try {
    console.log(veterinario)
    veterinario.token = null
    veterinario.password = password
    await veterinario.save()
    res.json({ msg: 'Password modificado correctamente' })
  } catch (error) {
    console.log(error)
  }
}

const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id)

  if (!veterinario) {
    const error = new Error('No se encontró al veterinario')
    return res.status(400).json({ msg: error.message })
  }

  const { email } = req.body
  if (veterinario.email !== req.body.email) {
    const existeEmail = await Veterinario.findOne({ email })
    if (existeEmail) {
      const error = new Error('Ese email ya está en uso')
      res.status(400).json({ msg: error.message })
      return
    }
  }

  try {
    veterinario.nombre = req.body.nombre
    veterinario.email = req.body.email
    veterinario.telefono = req.body.telefono
    veterinario.web = req.body.web
    const veterinarioActualizado = await veterinario.save()
    res.json(veterinarioActualizado)
  } catch (error) {
    console.log(error)
  }
}

const actualizarPassword = async (req, res) => {
  // Leer los datos
  const { id } = req.veterinario
  const { pwd_actual, pwd_nuevo } = req.body

  // Comprobar que el veterinario existe
  const veterinario = await Veterinario.findById(id)

  if (!veterinario) {
    const error = new Error('No se encontró al veterinario')
    return res.status(400).json({ msg: error.message })
  }

  // Comprobar su password

  if (await veterinario.comprobarPassword(pwd_actual)) {
    console.log('Correcto')
    veterinario.password = pwd_nuevo
    await veterinario.save()
    res.json({ msg: 'Password almacenado correctamente' })
  } else {
    const error = new Error('El password actual es incorrecto')
    return res.status(400).json({ msg: error.message })
  }

  // Almancenar el nuevo password
}

export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword
}
