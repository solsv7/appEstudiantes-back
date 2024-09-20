const conexion = require('../db');
const { format } = require('date-fns'); // Necesitarás instalar esta librería para formatear la fecha

exports.consultaCursadaPorId = async (req, res) => {
  try {
    const alumnoId = req.params.id;
    const result = await conexion.query(`SELECT * FROM Finales WHERE Alumno = ${alumnoId}`);
    if (result.length === 0)
      return({
    'mensaje' : 'No existen cursadas vigentes'
      });

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

    const result = await conexion.query(`
      SELECT Materias.Curso, Materias.Nombre, Finales.Division, Finales.Parcial1, Finales.Recuperatorio1, Finales.Parcial2, Finales.Recuperatorio2, Finales.Practico1, Finales.Practico2, Finales.Practico3, Finales.Practico4, Finales.Practico5, Personal.Nombre, Finales.AsistenciaPorcentaje, Finales.AsistenciaHasta 
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
    res.status(500).json({ error: error.mensaje });
  }
};


exports.consultaFinalesPorAlumnosYCarrera = async (req, res) => {
  try {
    const permiso = req.params.permiso;
    const carrera = req.params.carrera;

    // Obtenemos la fecha de hoy y la formateamos a MM/DD/YYYY
    const fecha_de_hoy = format(new Date(), 'MM/dd/yyyy'); 
    

    // QUERY DE LA DB EN ACCESS QUE TRAIGA LOS DATOS 
    const query = `
      SELECT Materias.Codigo, Materias.Curso, Finales.Ano, Finales.Asistencia, Finales.PerdioTurno, 
            Mesas.Numero, Materias.Abreviatura, Format(Mesas.Fecha, 'dd/mm/yyyy') AS Fecha, 
            Format(Mesas.Hora, 'Short Time') AS Hora, Mesas.Lugar, Mesas.Impresas, 
            Personal.Nombre AS Titular, Finales.Libre
      FROM (Materias INNER JOIN (Mesas INNER JOIN Personal ON Mesas.Titular = Personal.Codigo) 
            ON Materias.Codigo = Mesas.Materia) 
      INNER JOIN Finales ON (Mesas.Division = Finales.Division) AND (Materias.Codigo = Finales.Materia)
      WHERE (((Mesas.Fecha) >= #01/01/2024#) 
      AND ((Mesas.Turno) = (SELECT TurnoLlamado FROM Parametros)) 
      AND ((Mesas.Ano) = (SELECT AñoLlamado FROM Parametros)) 
      AND ((Finales.Alumno) = 13000) 
      AND ((Finales.Cursada) = True) 
      AND ((Finales.Aprobada) = False) 
      AND ((Finales.Promocion) = False) 
      AND ((Materias.Carrera) = 81))
      ORDER BY Materias.Curso, Mesas.Fecha;
    `;

    const result = await conexion.query(query);
    
    if (result.length === 0) {
      return res.json({ mensaje: 'No hay mesas de finales disponibles' });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
