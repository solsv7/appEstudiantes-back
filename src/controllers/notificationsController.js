const connect = require('../db'); 
const { format } = require('date-fns');

exports.getNotifications = async (req, res) => {

    try {
        const alumno = req.params.permiso;
        const conexion = await connect();
        const fecha_de_hoy = format(new Date(), 'MM/dd/yyyy');

        const query = `SELECT Notificaciones.Fecha, Notificaciones.Notificaciones
                        FROM Notificaciones
                        WHERE Notificaciones.idPermiso=${alumno} AND Notificaciones.Caduca>= ${fecha_de_hoy}
                            UNION 
                        SELECT Notificaciones.Fecha, Notificaciones.Notificaciones
                        FROM Notificaciones
                        WHERE Notificaciones.Caduca>= ${fecha_de_hoy} AND Notificaciones.idPermiso Is Null AND Notificaciones.idMateria Is Null
                            UNION
                        SELECT Notificaciones.Fecha, Notificaciones.Notificaciones
                        FROM Finales INNER JOIN Notificaciones ON Finales.Materia = Notificaciones.idMateria
                        WHERE Finales.Alumno=${alumno} AND Finales.Ano=(SELECT AñoMatriculacion FROM Parametros) AND Notificaciones.Caduca>=  ${fecha_de_hoy}
                            order by Fecha`;

        let result = await conexion.query(query)
            res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}