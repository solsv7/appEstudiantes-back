const connect = require('../db'); 

exports.eliminarMatriculacion = async (req, res) => {
    try {
        const { Alumno, Materia, Division } = req.body;
        const conexion = await connect();

        // Validamos si la matriculación está habilitada
        const validacionQuery = `
            SELECT Habilitar_Matriculacion 
            FROM Parametros
        `;
        const validacionResult = await conexion.query(validacionQuery);

        const habilitarMatriculacion = parseInt(validacionResult[0].Habilitar_Matriculacion, 10);

        if (habilitarMatriculacion !== 1) {
            return res.status(403).json({ mensaje: 'La matriculación no está habilitada.' });
        }

        const deleteQuery = `
            DELETE FROM Finales 
            WHERE Alumno = ${Alumno} AND Materia = ${Materia} AND Division = ${Division}
        `;

        await conexion.query(deleteQuery);

        res.json({ mensaje: 'Matrícula eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.matriculate = async (req, res) => {
  try {
    const { Alumno, Materia, Division, Libre, Profesor } = req.body;
    const conexion = await connect();

    queryYear = `SELECT AñoMatriculacion FROM Parametros`
    const yearResult  = await conexion.query(queryYear);
    const year = yearResult[0]?.AñoMatriculacion;

    // 1. Verificar si la cursada ya ha sido aprobada
    let query = `SELECT Cursada FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Materia} AND Cursada = True`; 
    let result = await conexion.query(query);
    if (result.length > 0) {
      return res.json({ mensaje: 'Usted ya ha aprobado esta cursada' });
    }

    // 2. Validar si ya está matriculado en el año actual en la tabla Inscripciones
    query = `SELECT * FROM Finales 
      WHERE Alumno = ${Alumno} 
      AND Materia = ${Materia} 
      AND Ano = ${year}`;
    result = await conexion.query(query);

    if (result.length > 0) {
      return res.json({ mensaje: 'Usted ya se encuentra matriculado en esta materia' });
    }

    // 3. Controlar que no se haya llegado al límite de matriculados
    const queryLimit = `SELECT LimiteMatriculados FROM Divisiones
            WHERE Materia = ${Materia}
            AND Profesor = ${Profesor} 
            AND Division = ${Division}
            AND Ano = ${year}`;
    let resultLimit = await conexion.query(queryLimit);

    const queryMatric = `SELECT * FROM Finales 
                    WHERE Materia = ${Materia} 
                    AND Ano = ${year} 
                    AND Libre = False 
                    AND Division = ${Division}`;
    let resultMatric = await conexion.query(queryMatric);
    
    let resultAssignatureLimit = resultLimit[0]?.LimiteMatriculados
    let resultMatriculated  = resultMatric.length;

    if (resultMatriculated >= resultAssignatureLimit) {
      return res.json({ mensaje: 'No se puede matricular. Por el momento se llegó al límite máximo para esta división.' });
    }

    // 4. Controlar que no deba correlativas de la materia
    query = `SELECT Correlativa, PorFinal FROM Correlativas WHERE Principal = ${Materia}`;
    result = await conexion.query(query);

    const correlativasPendientes = [];
    for (const correlativa of result) {
      const { Correlativa } = correlativa;

      // Validar cursada de correlativa
      let correlativaQuery = `SELECT Cursada FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Correlativa} AND Cursada = true`;
      let correlativaResult = await conexion.query(correlativaQuery);
      let correlativaFinalQuery = `SELECT Aprobada FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Correlativa} AND Aprobada = false`;
      let correlativaFinalResult = await conexion.query(correlativaFinalQuery);

      if (correlativaResult.Cursada == undefined || false ) {
        correlativasPendientes.push(`${Correlativa} - Cursada pendiente`);
      }else{       // Validar final de correlativa si es necesario
        if (correlativaFinalResult.Final == undefined || false) {
          correlativasPendientes.push(`${Correlativa} - Final pendiente`);
        }
      }
    }

    if (correlativasPendientes.length > 0) {
      return res.json({
        mensaje: 'No se puede matricular. Debe la/s siguiente/s correlativa/s',
        correlativas: correlativasPendientes
      });
    }

    // 5. Registrar la inscripción si todas las validaciones son exitosas
    query = `INSERT INTO Finales (Alumno, Materia, Ano, Division, Habilitada, Profesor) 
            VALUES (${Alumno}, ${Materia}, ${year} , ${Division}, True, ${Profesor})`;
    await conexion.query(query);

    res.json({ mensaje: 'Matriculación registrada exitosamente' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
