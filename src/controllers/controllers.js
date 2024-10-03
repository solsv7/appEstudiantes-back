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
    SELECT Ma.Codigo, Ma.Curso, F.Ano, F.Asistencia, F.PerdioTurno, Me.Numero, Ma.Abreviatura, Format(Me.Fecha,'dd/mm/yyyy') 
    
    AS Fecha, Format(Me.Hora,'Short Time') AS Hora, Me.Lugar, Me.Impresas, P.Nombre AS Titular, F.Libre, IIf((SELECT count( Inscripciones.Alumno) 

    FROM Inscripciones WHERE Inscripciones.FechaBorrado Is Null AND Inscripciones.Alumno=13000 AND Inscripciones.Mesa=Me.Numero) > 0, True, False) AS Inscripto

    FROM (Materias Ma INNER JOIN (Mesas Me INNER JOIN Personal P ON Me.Titular = P.Codigo) ON Ma.Codigo = Me.Materia) INNER JOIN Finales F ON (Me.Division = F.Division) AND (Ma.Codigo = F.Materia)

    WHERE (((Me.Fecha)>=${fecha_de_hoy}) AND ((Me.Turno)=(SELECT TurnoLlamado FROM Parametros)) AND ((Me.Ano)=(SELECT AñoLlamado FROM Parametros)) AND ((F.Alumno)=${permiso}) AND ((F.Cursada)=True) AND ((F.Aprobada)=False) AND ((F.Promocion)=False) AND ((Ma.Carrera)=${carrera}))
    ORDER BY Ma.Curso, Me.Fecha;
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
