const connect = require('../db');
const { encriptadores } = require('../encripter.js');

exports.login = async (req, res) => {
    const { Documento, Contrasena } = req.body;

    try {
        // Obtener la conexión
        const conexion = await connect();

        // Usar parámetros en la consulta SQL para evitar inyección SQL
        const [result] = await conexion.query(`SELECT * FROM Alumnos WHERE Documento = ${Documento}`);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Seleccionar el encriptador adecuado según el modo
        const encriptador = encriptadores[result.Modo];
        if (!encriptador) {
            return res.status(500).json({ error: 'Modo de encriptación no soportado' });
        }

        // Encriptamos la contraseña proporcionada por el usuario
        const contrasenaEncriptada = encriptador(Contrasena);

        // Comparamos las contraseñas
        if (result.Contrasena === contrasenaEncriptada) {
            const [datosAlumno] = await conexion.query(`
                SELECT Alumnos.Permiso, Alumnos.Nombre, Alumnos.Documento, Alumnos.Domicilio, Alumnos.Localidad, Alumnos.Telefono, Alumnos.Correo, Alumnos.BloquearAutogestion
                FROM Alumnos
                WHERE Alumnos.Permiso = ${result.Permiso}`);
    
            const [datosCarrera] = await conexion.query(`
                SELECT Carreras.Codigo, Carreras.Nombre, CarrerasHechas.Ingreso
                FROM Carreras
                INNER JOIN CarrerasHechas ON Carreras.Codigo = CarrerasHechas.Carrera
                WHERE CarrerasHechas.Condición = 1 AND CarrerasHechas.Permiso = ${result.Permiso}`);
                
            res.status(200).json({ datosAlumno, datosCarrera });
        } else {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}
