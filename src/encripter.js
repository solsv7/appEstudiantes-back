const combinaciones = [
    ['H', 'z', 'F', 'Ñ'],
    ['u', 'Ñ', 'G', 'I'],
    ['2', 'e', 'B', 'O'],
    ['f', 'y', 'H', 'E'],
    ['q', 'c', 'g', 'L'],
    ['c', '9', 't', 'C'],
    ['w', 't', 'I', 'N'],
    ['K', 'Q', 'J', '6'],
    ['b', 's', 'M', 'Q'],
    ['k', 'G', 'X', 'F'],
    ['t', 'O', 'D', 'J'],
    ['i', 'T', 'C', '0'],
    ['5', '5', 'm', 'y'],
    ['A', 'v', 'h', 'A'],
    ['7', 'd', 'x', 'U'],
    ['X', 'X', 'ñ', 'P'],
    ['l', 'I', 's', 'u'],
    ['n', 'J', 'Ñ', 'f'],
    ['y', 'h', 'y', 'K'],
    ['6', 'o', '8', '4'],
    ['v', 'M', 'N', 'z'],
    ['R', 'Y', 'c', 'i'],
    ['E', 'l', 'V', 'Z'],
    ['9', 'K', '2', 'x'],
    ['L', 'C', 'q', 'Y'],
    ['0', 'D', '0', 'T'],
    ['p', 'U', 'r', 'w'],
    ['Z', 'F', '6', 'D'],
    ['U', 'B', 'R', 'W'],
    ['e', '8', 'j', 'M'],
    ['F', 'W', 'O', 'H'],
    ['Q', 'V', '4', 'd'],
    ['x', 'r', 'o', '8'],
    ['G', 'ñ', 'E', '7'],
    ['m', 'j', 'p', 'v'],
    ['d', '7', 'A', 't'],
    ['W', 'R', 'f', 'p'],
    ['C', '6', '1', 'a'],
    ['D', 'b', 'Z', 'S'],
    ['z', '3', 'K', 'R'],
    ['Y', '4', 'u', 'l'],
    ['8', '1', 'Q', 'k'],
    ['s', 'n', 'd', 'j'],
    ['I', '0', '9', '2'],
    ['1', 'x', 'W', 'ñ'],
    ['V', 'L', '3', 'G'],
    ['B', 'P', 'k', 'n'],
    ['h', 'a', 'i', 'm'],
    ['3', 'f', 'v', 'r'],
    ['g', 'A', '5', '5'],
    ['ñ', 'u', 'w', 'X'],
    ['J', '2', 'U', '9'],
    ['r', 'Z', 'n', 'g'],
    ['S', 'm', 'b', 'B'],
    ['4', 'p', 'T', 'o'],
    ['j', 'E', 'L', 'c'],
    ['M', 'w', 'l', 'e'],
    ['N', 'i', '7', 'b'],
    ['a', 'S', 'S', 'V'],
    ['O', 'k', 'e', 's'],
    ['Ñ', 'q', 'Y', 'q'],
    ['T', 'g', 'P', '3'],
    ['o', 'N', 'z', 'h'],
    ['P', 'H', 'a', '1'],
];

const encriptarPorModo = (contrasena, modo) => {
    let contrasenaEncriptada = '';
    
    // Convertir la contraseña en un array de caracteres
    const caracteres = contrasena.split('');

    caracteres.forEach(char => {
        const index = parseInt(char, 36); // Convertir carácter a número (0-35)

        if (index >= 0 && index < combinaciones.length) {
            contrasenaEncriptada += combinaciones[index][modo];
        } else {
            contrasenaEncriptada += char; // Si el carácter no está en la tabla, lo dejamos igual
        }
    });

    return contrasenaEncriptada;
};

// Ejemplos de encriptadores
const encriptarModo1 = (contrasena) => encriptarPorModo(contrasena, 0);
const encriptarModo2 = (contrasena) => encriptarPorModo(contrasena, 1);
const encriptarModo3 = (contrasena) => encriptarPorModo(contrasena, 2);
const encriptarModo4 = (contrasena) => encriptarPorModo(contrasena, 3);

const encriptadores = {
    1: encriptarModo1,
    2: encriptarModo2,
    3: encriptarModo3,
    4: encriptarModo4,
};

module.exports = { encriptadores };
