const conexion = require('../db');
const { encriptadores } = require('../encripter.js');

exports.login = async (req, res) => {
    const { Documento, Contrasena } = req.body;


    try {
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
            res.status(200).json(result);
        } else {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}