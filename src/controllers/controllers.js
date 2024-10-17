const connect = require('../db'); // Cambiado para importar la función de conexión
const { format } = require('date-fns'); // Necesitarás instalar esta librería para formatear la fecha

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
    res.status(500).json({ error: error.message }); // Ajustado para usar error.message
  }
};




exports.consultaFinalesPorAlumnosYCarrera = async (req, res) => {
  try {
    const permiso = req.params.permiso;
    const carrera = req.params.carrera;

    // Obtenemos la fecha de hoy y la formateamos a MM/DD/YYYY
    const fecha_de_hoy = format(new Date(), 'MM/dd/yyyy');
    const conexion = await connect(); // Conectar a la base de datos

    // QUERY DE LA DB EN ACCESS QUE TRAIGA LOS DATOS 
    const query = `
    SELECT Ma.Codigo, Ma.Curso, F.Ano, F.Asistencia, F.PerdioTurno, Me.Numero, Ma.Abreviatura, Format(Me.Fecha,'dd/mm/yyyy') AS Fecha, Format(Me.Hora,'Short Time') AS Hora, Me.Lugar, Me.Impresas, P.Nombre AS Titular, F.Libre, IIf((SELECT count( Inscripciones.Alumno) 
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



exports.inscribirAlumnosPorId = async (req, res) => {
  try {
    const { Mesa, Alumno, Cursada, Libre } = req.body;
    const conexion = await connect(); // Conectar a la base de datos

    // Obtener el estado de 'Impresas' de la mesa y la materia
    const mesa = await conexion.query(`SELECT Materia, Impresas FROM Mesas WHERE Numero = ${Mesa}`);

    if (mesa.length > 0) {
      const impresa = mesa[0].Impresas;
      const materia = mesa[0].Materia;

      // Verificar las correlativas de la materia
      const correlativas = await conexion.query(`
        SELECT Correlativas.Correlativa, Materias.Curso, Materias.Nombre
        FROM Correlativas 
        INNER JOIN Materias ON Correlativas.Correlativa = Materias.Codigo
        WHERE Correlativas.Principal = ${materia}
      `);

      let materiasNoAprobadas = [];

      // Verificar si el alumno ha aprobado las correlativas
      for (const correlativa of correlativas) {
        const correlativaAprobada = await conexion.query(`
          SELECT * FROM Finales 
          WHERE Alumno = ${Alumno} AND Materia = ${correlativa.Correlativa} AND Aprobada = True
        `);
        if (correlativaAprobada.length === 0) {
          materiasNoAprobadas.push(correlativa.Nombre);
        }
      }

      if (materiasNoAprobadas.length > 0) {
        return res.json({ 
          mensaje: 'El alumno no ha aprobado las siguientes correlativas:', 
          materiasNoAprobadas 
        });
      }

      // Verificar si el alumno ya está inscripto en otra mesa de la misma materia y turno
      const yaInscripto = await conexion.query(`
        SELECT DISTINCT Mesas.Materia 
        FROM Inscripciones 
        INNER JOIN Mesas ON Inscripciones.Mesa = Mesas.Numero 
        WHERE Mesas.Materia = ${materia} 
        AND Mesas.Turno = (SELECT TurnoLlamado FROM Parametros) 
        AND Mesas.Ano = (SELECT AñoLlamado FROM Parametros) 
        AND Inscripciones.Alumno = ${Alumno} 
        AND Inscripciones.FechaBorrado IS NULL
      `);

      if (yaInscripto.length > 0) {
        return res.json({ mensaje: 'No se puede inscribir. Ya se encuentra inscripto en esta misma asignatura en otra mesa del mismo turno.' });
      }

      // Verificar si la mesa tiene el límite de inscriptos alcanzado
      const limiteInscriptos = await conexion.query(`
        SELECT LimiteInscriptos, 
        (SELECT COUNT(Inscripciones.Alumno) FROM Inscripciones WHERE Inscripciones.Mesa = ${Mesa} AND Inscripciones.FechaBorrado IS NULL) AS Inscriptos 
        FROM Mesas 
        WHERE Numero = ${Mesa}
      `);

      const { LimiteInscriptos, Inscriptos } = limiteInscriptos[0];
      if (Inscriptos >= LimiteInscriptos) {
        return res.json({ mensaje: 'No se puede inscribir. Por el momento se llegó al límite máximo de inscriptos permitidos.' });
      }

      // Si todo es correcto, realizar la inscripción
      await conexion.query(`
        INSERT INTO Inscripciones (Mesa, Alumno, Cursada, FechaInscripto, HoraInscripto, Medio, Libre) 
        VALUES (${Mesa}, ${Alumno}, ${Cursada}, Date(), Time(), 4, ${Libre})
      `);

      res.json({ mensaje: 'Inscripción realizada correctamente.' });

    } else {
      return res.json({ mensaje: 'La mesa no existe.' });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
