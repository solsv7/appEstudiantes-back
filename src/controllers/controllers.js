const conexion = require('../db');

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



exports.consultaCursadaPor2Id = async (req, res) => {
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

exports.agregarParametro = async (req, res) => {
  const { TurnoLlamado, MesasPosibles } = req.body;
  try {
    
    //await db.query('INSERT INTO Parametros (TurnoLlamado, MesasPosibles) VALUES (?, ?)', [TurnoLlamado, MesasPosibles]);
    
    const result = await conexion.query(`INSERT INTO Parametros (TurnoLlamado, MesasPosibles) VALUES (${TurnoLlamado}, ${MesasPosibles})`);
    res.status(201).json({ message: 'Item created' });
  } catch (error) {
    res.status(500).json({ error: 'Database insert failed' });
  }
};
