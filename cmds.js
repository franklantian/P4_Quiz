const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");
const Sequelize = require('sequelize');


/**
 * Muestra la ayuda
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = (socket,rl) => {
    log(socket,"Commandos :");
    log(socket," h|help - Muestra esta ayuda");
    log(socket," list - listar los quizzes existentes");
    log(socket," show <id> - Muestra la pregunta y la respuesta el quiz indicado");
    log(socket," add - Añadir un nuevo quiz interactivamente");
    log(socket," delete <id> - BOrrar el quiz indicado");
    log(socket," edit <id> - Editar el quiz indicado");
    log(socket," test <id> - Probar el quiz indicado");
    log(socket," p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(socket," credits - Creditos");
    log(socket," q|quit - Salir del programa");
    rl.prompt();
};

/**
 * Listar todos los quizzes existentes en el model
 */

exports.listCmd = (socket,rl) => {

    models.quiz.findAll()//quizzes es un array
        .each(quiz => {
            log(socket,`[${colorize(quiz.id, 'magenta')}] : ${quiz.question}`);
        })
        .catch(error => {
            errorlog(socket,error.message);
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
exports.showCmd = (socket,rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            log(socket,`[${colorize(quiz.id,'magenta')}] : ${quiz.question} ${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const makeQuestion = (socket,rl,text) =>{

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

exports.addCmd = (socket,rl) => {
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
            log(socket,` ${colorize('Se ha añadido','magenta')} : ${quiz.question} ${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(socket,message));
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        });
};



/**
 * Borrar un quiz indicado.
 * @param id CLAVE del quiz indicado a borrar.
 */
exports.deleteCmd = (socket,rl,id) =>{
    validateId(id)
        .then(id => models.quiz.destroy({where :{id}}))
        .catch(error => {
            errorlog(socket,error.message);
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
exports.editCmd = (socket,rl,id) => {
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
            log(socket,`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por : ${quiz.question}${colorize('=>','magenta')}${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(socket,message));
        })
        .catch(error => {
            errorlog(socket,error.message);
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
exports.testCmd = (socket,rl,id) =>{
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            makeQuestion(socket,rl,`${colorize(quiz.question + '? ', 'red')}`)
           .then(a => {
               if (trimm(a) === trimm(quiz.answer)) {
                   log(socket,'Su respuesta es correcta.\n');
                   biglog(socket,"CORRECTO", 'green');
               } else {
                   log(socket,'Su respuesta es incorrecta.\n');
                   biglog(socket,"INCORRECTO", 'red');
               }
            });

        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erroneo : ');
            error.errors.forEach(({message}) => errorlog(socket,message));
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(()=>{
            rl.prompt();
        });

};

const  copy = (socket,text) =>{

    return new Promise((resolve,reject) => {
        models.quiz.findAll()
            .each(quiz =>{
                text.push(quiz.id)
            })
            .then(() =>{
                resolve(text);
            })
        });
};



const bucle =(socket,rl,text,score) => {
    return new Promise((resolve, reject) => {
       let num = text[Math.floor(Math.random()*text.length)];
        validateId(num)
            .then(num => models.quiz.findById(num))
            .then(quiz => {
                if (text.length === 0) {
                    log(socket,'No hay nada más que preguntar.\n');
                    log(socket,`Fin del juego. Aciertos: ${score}`);
                    biglog(socket,score, 'magenta');
                    rl.prompt();
                    resolve();
                }
                else {
                    makeQuestion(socket,rl, `${colorize(quiz.question + '? ', 'red')}`)
                        .then(a => {
                            if (trimm(a) === trimm(quiz.answer)) {
                                score += 1;
                                log(socket,`CORRECTO - Lleva ${score} aciertos.`);
                                text.splice(text.indexOf(num), 1)
                                bucle(rl,text,score);
                                resolve();
                            } else {
                                log(socket,'INCORRECTO \n');
                                log(socket,`Fin del juego. Aciertos: ${score}`);
                                biglog(socket,score, 'magenta');
                                rl.prompt();
                                resolve();
                            }
                        });
                }
            });
    });
};

/**
 * Pregunta todos los quizzees existentes den el model en orden aleatorio.
 * Se gana si se contesta a todos stisfactoriamente.
 */
exports.playCmd = (socket,rl) => {
    let score = 0;
    let toBeResolved = [];
    copy(socket,toBeResolved)
        .then(() =>{
            bucle(socket,rl,toBeResolved,score);
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(()=>{
            rl.prompt();
        });
};
    /*let score = 0;
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

};*/


/**
 * Muestra los nombres de los autores de la Practica.
 */
exports.creditsCmd = (socket,rl) =>{
    log(socket,'Autores de la Practica:');
    log(socket,'TIAN LAN');
    rl.prompt();
};

exports.quitCmd = (socket,rl) =>{
    rl.close();
    socket.end();
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
