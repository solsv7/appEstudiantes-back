const conexion = require('../db');

exports.login = async (req, res) => {
    const { Documento, Contrasena } = req.body;

    console.log(req.body);

    try {
        // Utilizamos valores parametrizados para evitar inyección SQL
        const [result] = await conexion.query(`SELECT * FROM Alumnos WHERE Documento = ${Documento}`);

        if (result.Documento = Documento) { 

            if (result.Contrasena === Contrasena) {
                res.status(200);
                console.log(`Bienvenido ${result.Nombre}`);
                return res.status(200).json(result);
            } else {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        } else {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Documento no encontrado' });
    }
};
