const connect = require('../db');
const { encriptadores } = require('../encripter.js');

exports.changePassword = async (req, res) => {   
    const { permiso, actPass, newPass } = req.body;

    try {
        const connection = await connect();
        const [alumnData] = await connection.query(`SELECT * FROM Alumnos WHERE Permiso = ${permiso}`);

        if (alumnData.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const encriptador = encriptadores[alumnData.Modo];
        if (!encriptador) {
            return res.status(500).json({ error: 'Modo de encriptación no soportado' });
        }

        const encriptedNewPass = encriptador(newPass);
        const encriptedActPass = encriptador(actPass);

        if (alumnData.Contrasena !== encriptedActPass) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta / La contraseña supera el limite de caracteres (6)' });
        }

        if (newPass.length > 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener menos de 6 caracteres' });
        }

        await connection.query(`UPDATE Alumnos SET Contrasena = '${encriptedNewPass}', Contraseña = '${encriptedNewPass}' WHERE Permiso = ${permiso}`);

        return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error en changePassword:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};


exports.changeUserInfo = async (req, res) => {
    const permiso = req.params.permiso;
    const {phoneNumber, email, adress} = req.body;
    
    try {
        const connection = await connect();
        await connection.query(`UPDATE Alumnos SET Telefono = ${phoneNumber}, Correo = '${email}' , Domicilio = '${adress}' WHERE Permiso = ${permiso}`);
        return res.status(200).json({ message: "datos de usuario actualizados con exito" });
    }catch(error){
        return (res.status(500).json({ error: 'error al cambiar informacion personal'}))
    }
}

