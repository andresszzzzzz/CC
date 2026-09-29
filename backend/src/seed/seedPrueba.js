// Seed de PRUEBA: crea una institución, un estudiante y un acudiente vinculados,
// para poder iniciar sesión en el frontend sin tener aún las pantallas de gestión.
//
// Uso (desde la carpeta backend, con el .env ya apuntando a Atlas):
//   1) Copiar este archivo a backend/src/seed/seedPrueba.js
//   2) npm run seed          (si aún no lo has corrido: crea el núcleo y admin)
//   3) node src/seed/seedPrueba.js
//
// Es idempotente: si algo ya existe, no lo duplica.

require('dotenv').config();
const mongoose = require('mongoose');
const DireccionNucleo = require('../models/DireccionNucleo');
const Institucion = require('../models/Institucion');
const Usuario = require('../models/Usuario');

const PASSWORD_PRUEBA = 'Prueba12345';

const obtenerOCrearUsuario = async (filtro, datos) => {
  let usuario = await Usuario.findOne(filtro);
  if (usuario) {
    console.log(`[INFO] Ya existe: ${usuario.email}`);
    return usuario;
  }
  usuario = await Usuario.create(datos); // la contraseña se encripta al guardar
  console.log(`[OK] Creado ${usuario.tipoPerfil}: ${usuario.email} (${usuario._id})`);
  return usuario;
};

const ejecutar = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[OK] Conectado a MongoDB');

  try {
    const nucleo = await DireccionNucleo.findOne({ nombre: process.env.NUCLEO_NOMBRE });
    if (!nucleo) {
      console.error('[ERROR] No existe el núcleo. Corre primero: npm run seed');
      process.exit(1);
    }

    // 1) Institución
    let institucion = await Institucion.findOne({ nit: '900000001-0' });
    if (institucion) {
      console.log(`[INFO] Ya existe la institución "${institucion.nombre}"`);
    } else {
      institucion = await Institucion.create({
        nombre: 'Colegio de Prueba',
        nit: '900000001-0',
        nucleoId: nucleo._id
      });
      console.log(`[OK] Institución creada: ${institucion.nombre} (${institucion._id})`);
    }

    // 2) Estudiante
    const estudiante = await obtenerOCrearUsuario(
      { email: 'estudiante@prueba.edu.co' },
      {
        institucionId: institucion._id,
        tipoDocumento: 'TI',
        documento: '1000000001',
        nombres: 'Estudiante',
        apellidos: 'Prueba',
        email: 'estudiante@prueba.edu.co',
        tipoPerfil: 'estudiante',
        credenciales: {
          usuario: 'estudiante.prueba',
          passwordHash: PASSWORD_PRUEBA,
          debeCambiarPassword: false
        }
      }
    );

    // 3) Acudiente vinculado al estudiante
    const acudiente = await obtenerOCrearUsuario(
      { email: 'acudiente@prueba.edu.co' },
      {
        institucionId: institucion._id,
        documento: '2000000001',
        nombres: 'Acudiente',
        apellidos: 'Prueba',
        email: 'acudiente@prueba.edu.co',
        tipoPerfil: 'acudiente',
        estudiantes: [{ estudianteId: estudiante._id, parentesco: 'Madre', nombre: 'Estudiante Prueba' }],
        credenciales: {
          usuario: 'acudiente.prueba',
          passwordHash: PASSWORD_PRUEBA,
          debeCambiarPassword: false
        }
      }
    );

    // Vínculo inverso: el estudiante también guarda a su acudiente
    if (!estudiante.acudientes || estudiante.acudientes.length === 0) {
      estudiante.acudientes = [{ acudienteId: acudiente._id, parentesco: 'Madre' }];
      await estudiante.save();
      console.log('[OK] Estudiante vinculado con su acudiente');
    }

    console.log('\n[OK] Listo. Usuarios de prueba (clave para ambos: ' + PASSWORD_PRUEBA + '):');
    console.log('   estudiante.prueba  -> /estudiante/inicio');
    console.log('   acudiente.prueba   -> /acudiente/inicio');
  } finally {
    await mongoose.disconnect();
  }
};

ejecutar().catch((error) => {
  console.error('[ERROR] Falló el seed de prueba:', error.message);
  process.exit(1);
});
