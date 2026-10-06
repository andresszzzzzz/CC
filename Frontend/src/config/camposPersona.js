// Columnas y campos de formulario compartidos por Estudiantes, Docentes,
// Acudientes y Usuarios del Sistema (todos son el modelo "Usuario" del backend).
//
// Las claves con punto (credenciales.usuario) el FormModal las convierte en
// objetos anidados al enviar: { credenciales: { usuario: '...' } }, que es
// exactamente lo que espera el backend.

export const columnasPersona = [
  { key: 'documento', label: 'Documento' },
  { key: 'nombreCompleto', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'estado', label: 'Estado' }
]

export function camposPersona({ incluirRol = false } = {}) {
  const campos = []

  if (incluirRol) {
    campos.push({
      key: 'tipoPerfil',
      label: 'Rol',
      type: 'select',
      required: true,
      opciones: [
        { value: 'rector', label: 'Rector' },
        { value: 'coordinador', label: 'Coordinador' },
        { value: 'secretaria', label: 'Secretaría' }
      ]
    })
  }

  campos.push(
    {
      key: 'tipoDocumento',
      label: 'Tipo de documento',
      type: 'select',
      default: 'CC',
      opciones: [
        { value: 'CC', label: 'Cédula de ciudadanía' },
        { value: 'TI', label: 'Tarjeta de identidad' },
        { value: 'CE', label: 'Cédula de extranjería' },
        { value: 'RC', label: 'Registro civil' },
        { value: 'PA', label: 'Pasaporte' }
      ]
    },
    { key: 'documento', label: 'Número de documento' },
    { key: 'nombres', label: 'Nombres', required: true },
    { key: 'apellidos', label: 'Apellidos', required: true },
    { key: 'email', label: 'Correo electrónico', type: 'email', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    {
      key: 'genero',
      label: 'Género',
      type: 'select',
      opciones: [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
        { value: 'Otro', label: 'Otro' }
      ]
    },
    // Solo al crear: el backend ignora las credenciales en la edición
    // (la contraseña se restablece por otro flujo).
    { key: 'credenciales.usuario', label: 'Usuario de acceso', required: true, soloCreacion: true },
    {
      key: 'credenciales.passwordHash',
      label: 'Contraseña inicial',
      type: 'password',
      required: true,
      soloCreacion: true,
      minlength: 6
    },
    // Solo se muestra al EDITAR: toda persona nueva se crea siempre como "activo"
    // y desde aquí (al editar) se puede inactivar o reactivar.
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      default: 'activo',
      soloEdicion: true,
      opciones: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' }
      ]
    }
  )

  return campos
}