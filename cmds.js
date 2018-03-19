const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");
const Sequelize = require('sequelize');


/**
 * Muestra la ayuda
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Commandos :");
    log(" h|help - Muestra esta ayuda");
    log(" list - listar los quizzes existentes");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado");
    log(" add - Añadir un nuevo quiz interactivamente");
    log(" delete <id> - BOrrar el quiz indicado");
    log(" edit <id> - Editar el quiz indicado");
    log(" test <id> - Probar el quiz indicado");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(" credits - Creditos");
    log(" q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Listar todos los quizzes existentes en el model
 */

exports.listCmd = rl => {

    models.quiz.findAll()//quizzes es un array
        .each(quiz => {
            log(`[${colorize(quiz.id, 'magenta')}] : ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const validateId = id =>{
    return new Promise((resolve,reject) => {
        if(typeof id === "undefined"){
            reject(new Error(`Falta el parametro <id>.`));
        }else {
            id = parseInt(id); // coger la parte entera y descartar lo
            if (Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un  número.`));
            }else{
                resolve(id);
            }
        }
    });
};

/**
 * Muestra el quiz indicado en el parámetro : la pregunta t la respuesta.
 *
 * @param id CLAVE del quiz indicado.
 */
exports.showCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            log(`[${colorize(quiz.id,'magenta')}] : ${quiz.question} ${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const makeQuestion = (rl,text) =>{

    return new Promise((resolve,reject) => {
        rl.question(colorize(text, 'red'),answer => {
            resolve(answer.trim());
        });
    });
};


/**
 *
 * @param rl
 * */

exports.addCmd = rl => {
    makeQuestion(rl,' Introduzca una pregunta : ')
        .then(q =>{
            return makeQuestion(rl,'Introduzca la respuesta : ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(` ${colorize('Se ha añadido','magenta')} : ${quiz.question} ${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};



/**
 * Borrar un quiz indicado.
 * @param id CLAVE del quiz indicado a borrar.
 */
exports.deleteCmd = (rl,id) =>{
    validateId(id)
        .then(id => models.quiz.destroy({where :{id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(()=>{
            rl.prompt();
        });
};

/**
 *
 * @param rl
 * @param id
 */
exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            return makeQuestion(rl,'Introduzca la pregunta: ')
                .then( q => {
                    process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
                    return makeQuestion(rl,'Introduza la respuesta : ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                        });
;                })
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por : ${quiz.question}${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(()=>{
            rl.prompt();
        });

};

/**
 *
 * @param rl
 * @param id
 */
exports.testCmd = (rl,id) =>{
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            makeQuestion(rl,`${colorize(quiz.question + '? ', 'red')}`)
           .then(a => {
               if (trimm(a) === trimm(quiz.answer)) {
                   log('Su respuesta es correcta.\n');
                   biglog("CORRECTO", 'green');
               } else {
                   log('Su respuesta es incorrecta.\n');
                   biglog("INCORRECTO", 'red');
               }
            });

        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(()=>{
            rl.prompt();
        });
    
};


/**
 * Pregunta todos los quizzees existentes den el model en orden aleatorio.
 * Se gana si se contesta a todos stisfactoriamente.
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];

    for (i = 0; i < model.count(); i++) {
        toBeResolved.push(i);
    }

    const bucle = () => {
        if(toBeResolved.length === 0){
            log('No hay nada más que preguntar.\n');
            log(`Fin del juego. Aciertos: ${score}`);
            biglog(score, 'magenta');
            rl.prompt();
        }else{
            let id = toBeResolved[Math.floor(Math.random()*toBeResolved.length)];
            let quiz = model.getByIndex(id);
            rl.question(`${colorize(quiz.question + '? ', 'red')}`,answer =>{

                if (trimm(answer) === trimm(quiz.answer)) {
                    score += 1;
                    log(`CORRECTO - Lleva ${score} aciertos.`);
                    toBeResolved.splice(toBeResolved.indexOf(id),1)
                    bucle();
                } else {
                    log('INCORRECTO \n');
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(score, 'magenta');
                    rl.prompt();
                }
            });
        }


    };bucle();

};


/**
 * Muestra los nombres de los autores de la Practica.
 */
exports.creditsCmd = rl =>{
    log('Autores de la Practica:');
    log('TIAN LAN');
    rl.prompt();
};

exports.quitCmd = rl =>{
    rl.close();
};

/**
 *
 * @param str
 * @returns {string | void | *}
 */
trimm = rl => {
    rl = rl.replace(/\s+/g,"");
    rl = rl.toUpperCase();
    rl = rl.toLowerCase();
    return rl;
};
