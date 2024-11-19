const connect = require('../db'); // Cambiado para importar la función de conexión

exports.consultaCursadaPorId = async (req, res) => {
  try {
    const alumnoId = req.params.id;
    const conexion = await connect(); // Conectar a la base de datos

    const result = await conexion.query(`SELECT * FROM Finales WHERE Alumno = ${alumnoId}`);
    if (result.length === 0)
      return res.json({ mensaje: 'No existen cursadas vigentes' }); // Ajustado para usar res.json

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.consultaCursadaPorAlumnoYCarrera = async (req, res) => {
  try {
    const permiso = req.params.permiso;
    const carrera = req.params.carrera;
    const conexion = await connect(); // Conectar a la base de datos

    const result = await conexion.query(`
      SELECT Materias.Curso, Materias.Nombre as Materia, Finales.Division, Finales.Parcial1, Finales.Recuperatorio1, Finales.Parcial2, Finales.Recuperatorio2, Finales.Practico1, Finales.Practico2, Finales.Practico3, Finales.Practico4, Finales.Practico5, Personal.Nombre as Profesor, Finales.AsistenciaPorcentaje, Finales.AsistenciaHasta 
      FROM (Finales 
      INNER JOIN Materias ON Finales.Materia = Materias.Codigo) 
      INNER JOIN Personal ON Finales.Profesor = Personal.Codigo 
      WHERE Finales.Alumno = ${permiso} 
      AND Finales.Ano = (SELECT AñoMatriculacion FROM Parametros) 
      AND Materias.Carrera = ${carrera} 
      AND PerdioCursada = False 
      ORDER BY Finales.Materia
    `);

    if (result.length === 0) {
      return res.json({ mensaje: 'No existen cursadas vigentes' });
    }

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message }); // Ajustado para usar error.message
  }
};





