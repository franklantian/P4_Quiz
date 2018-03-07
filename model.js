const fs = require("fs");

const DB_FILENAME = "quizzes.json";



//Modelo de datos.
let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    }];

const load = () => {
    fs.readFile(DB_FILENAME,(err,data) => {
        if(err){

            if(err.code === "ENOENT"){
                save(); //crear
                return;

            }
            throw err;
        }
        let json = JSON.parse(data);
        if(json){
            quizzes = json;
        }
    });
};

const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
              if(err) throw err;
        });
};
/**
 * Devuelve el numero total de preguntas existentes.
 * @returns {number}
 */
exports.count = () => quizzes.length;


/**
 * Añade un nuevo quiz.
 *
 * @param question
 * @param answer
 */
exports.add = (question,answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
 * Actualiza el quiz situado en la posicion index.
 *
 * @param id
 * @param question
 * @param answer
 */
exports.update = (id,question,answer) => {
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es valído.`);
    }
    quizzes.splice(id , 1, {
        question :(question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
 * Devuelve todos los quizzes existentes.
 * para clonar quizzes se ussa stringify + parse.
 *
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 * Devuelve un clon del quiz almacenado en la posicion dada.
 *
 * @param id
 * @returns {any}
 */
exports.getByIndex = id =>{
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es valído.`);

    }
    return JSON.parse(JSON.stringify(quiz));

};

/**
 * Elimina el quiz situado en la posicion dada.
 *
 * @param id Clave que identifica el quiz a borrar.
 */
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es valído.`);
    }
    quizzes.splice(id,1);
    save();
};

load();