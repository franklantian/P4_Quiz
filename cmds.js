const model = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");


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

    model.getAll().forEach((quiz,id)=> {
        log(`[${colorize(id,'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parámetro : la pregunta t la respuesta.
 *
 * @param id CLAVE del quiz indicado.
 */
exports.showCmd = (rl,id) => {
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try {
            const quiz = model.getByIndex(id);
            log(`[${colorize(id,'magenta')}]: ${quiz.question}${colorize('=>','magenta')}${quiz.answer}`);
        } catch (error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Añade un nuevo quiz al módelo
 * Pregunta interactivamente por la pregunta y por la respuesta.
 */
exports.addCmd = rl =>{
   rl.question(colorize(' Introduzca una pregunta: ', 'red'),question =>{
       rl.question(colorize(' Introduzca la respuesta ', 'red'),answer =>{

           model.add(question,answer);
           log(`${colorize('Se ha añadido','magenta')}:${question}${colorize('=>','magenta')}${answer}`);
           rl.prompt();
       })
   })
};

/**
 * Borrar un quiz indicado.
 * @param id CLAVE del quiz indicado a borrar.
 */
exports.deleteCmd = (rl,id) =>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try {
            model.deleteByIndex(id);
        } catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita un quiz indicado del modelo
 *
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl,id) => {
    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'),question =>{

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'),answer =>{

                    model.update(id,question,answer);
                    log(` Se ha cambiado el quiz ${colorize(id,'magenta')} por : ${question}${colorize(' => ','magenta')}${answer}`);
                    rl.prompt();
                });
            });
        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

/**
 *
 * @param rl
 * @param id
 */
exports.testCmd = (rl,id) =>{
    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question(`${colorize(quiz.question + '? ', 'red')}`,answer => {

                if (trimm(answer) === trimm(quiz.answer)) {
                    log('Su respuesta es correcta.\n')
                    biglog("CORRECTO", 'green');
                    rl.prompt();
                } else {
                    log('Su respuesta es incorrecta.');
                    biglog("INCORRECTO", 'red');
                    rl.prompt();
                }
                rl.prompt();
            });



        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};


/**
 * Pregunta todos los quizzees existentes den el model en orden aleatorio.
 * Se gana si se contesta a todos stisfactoriamente.
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];

    for (i = 0; i < model.count(); i++) {
        toBeResolved[i] = i;
    }

    bucle = () => {
            if(toBeResolved.length === 0){
                log('No hay nada más que preguntar.\n');
                log(`Fin del juego. Aciertos: ${score}`);
                biglog(score, 'magenta');
            }else{
                let idd = toBeResolved[Math.random()*toBeResolved.length];
                let quiz = model.getByIndex(idd);
                rl.question(`${colorize(quiz.question + '? ', 'red')}`,answer =>{

                    if (trimm(answer) === trimm(quiz.answer)) {
                        score += 1;
                        log(`CORRECTO - Lleva ${score} aciertos.`);
                        bucle();
                    } else {
                        log('INCORRECTO \n');
                        biglog(score, 'red');
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
