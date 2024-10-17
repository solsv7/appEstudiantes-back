const connect = require('../db');
const { format } = require('date-fns'); // Para formatear la fecha

exports.deleteInscription = async (req, res) => {
  try {
    const { Mesa, Alumno } = req.body;

    // Obtener la conexión
    const conexion = await connect();

    // Verificar si la mesa está impresa
    const [mesa] = await conexion.query(`SELECT Impresas FROM Mesas WHERE Numero = ${Mesa}`);

    if (!mesa || mesa.Impresas === 0) {
      return res.json({ mensaje: 'La mesa no está impresa o no existe.' });
    }

    // Si la mesa está impresa, procedemos con el borrado de la inscripción
    const fechaActual = format(new Date(), 'yyyy-MM-dd');
    const horaActual = format(new Date(), 'HH:mm:ss');
    const query = `
      UPDATE Inscripciones
      SET FechaBorrado = '${fechaActual}', HoraBorrado = '${horaActual}', Acta = 0, Medio = 4
      WHERE Mesa = ${Mesa} AND Alumno = ${Alumno}
    `;

    const result = await conexion.query(query);

    if (result.affectedRows === 0) {
      return res.json({ mensaje: 'No se pudo borrar la inscripción. Verifique los datos proporcionados.' });
    }

    res.json({ mensaje: 'Inscripción borrada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
