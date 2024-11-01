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
