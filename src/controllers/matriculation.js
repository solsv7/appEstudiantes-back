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
      const { Alumno, Materia, Division, Libre } = req.body;
      const conexion = await connect();
  
      // 1. Verificar si la cursada ya ha sido aprobada
      let query = `SELECT Cursada FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Materia}`;
      let result = await conexion.query(query);
      console.log(result)
      if (result === false) {
        return res.json({ mensaje: 'Usted ya ha aprobado esta cursada' });
      }
  
      // 2. Validar si ya está matriculado en el año actual en la tabla Inscripciones
      query = `SELECT * FROM Inscripciones 
        WHERE Alumno = ${Alumno} 
        AND Cursada = ${Materia} 
        AND YEAR(FechaInscripto) = (SELECT AñoMatriculacion FROM Parametros)`;
      result = await conexion.query(query);
  
      if (result.length > 0) {
      return res.json({ mensaje: 'Usted ya se encuentra matriculado en esta materia' });
      }
  
      // 3. Controlar que no se haya llegado al límite de matriculados
      query = `SELECT LimiteMatriculados, 
                      (SELECT count(Alumno) FROM Finales 
                       WHERE Materia = ${Materia} 
                       AND Ano = (SELECT AñoMatriculacion FROM Parametros) 
                       AND Libre = False 
                       AND Division = ${Division}) AS Matriculados 
               FROM Divisiones 
               WHERE Materia = ${Materia} 
               AND Ano = (SELECT AñoMatriculacion FROM Parametros) 
               AND Division = ${Division}`;
      result = await conexion.query(query);
      const { LimiteMatriculados, Matriculados } = result;
      if (Matriculados >= LimiteMatriculados) {
        return res.json({ mensaje: 'No se puede matricular. Por el momento se llegó al límite máximo para esta división.' });
      }
  
      // 4. Controlar que no deba correlativas de la materia
      query = `SELECT Correlativa, PorFinal FROM Correlativas WHERE Principal = ${Materia}`;
      result = await conexion.query(query);
  
      const correlativasPendientes = [];
      for (let correlativa of result) {
        const { Correlativa, PorFinal } = correlativa;
  
        // Validar cursada de correlativa
        let correlativaQuery = `SELECT Cursada FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Correlativa} AND Cursada = True`;
        let correlativaResult = await conexion.query(correlativaQuery);
  
        if (correlativaResult.length === 0) {
          correlativasPendientes.push(`${Correlativa} - Cursada pendiente`);
        }
  
        // Validar final de correlativa si es necesario
        if (PorFinal) {
          correlativaQuery = `SELECT Final FROM Finales WHERE Alumno = ${Alumno} AND Materia = ${Correlativa} AND Final = True`;
          correlativaResult = await conexion.query(correlativaQuery);
          if (correlativaResult.length === 0) {
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
      const fechaActual = new Date();
      const fechaInscripto = `${fechaActual.getFullYear()}-${fechaActual.getMonth() + 1}-${fechaActual.getDate()}`;
      const horaInscripto = `${fechaActual.getHours()}:${fechaActual.getMinutes()}:${fechaActual.getSeconds()}`;
  
      query = `INSERT INTO Inscripciones (Mesa, Alumno, Cursada, FechaInscripto, HoraInscripto, Medio, Libre) 
               VALUES (35487, ${Alumno}, ${Materia}, '${fechaInscripto}', '${horaInscripto}', 4, ${Libre})`;
      await conexion.query(query);
  
      res.json({ mensaje: 'Matriculación registrada exitosamente' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }