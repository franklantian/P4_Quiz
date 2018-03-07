

const figlet = require('figlet');
const chalk = require('chalk');


/**
 * color
 * @param msg
 * @param color
 * @returns {*}
 */
const colorize = (msg,color) =>{
    if(typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Mensaje de log
 * @param msg
 * @param color
 */
const log = (msg,color) =>{
    console.log(colorize(msg,color));
};

/**
 * Mensaje de log Grande
 * @param msg
 * @param color
 */
const biglog = (msg,color) =>{
    log(figlet.textSync(msg,{horizontalLayout:'full'}),color);
};

/**
 *Mensaje de error emsg
 * @param emsg
 */
const errorlog = (emsg) =>{
    console.log(`${colorize("Error","red")}: ${colorize(colorize(emsg,"red"),"bgYellowBright")}`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};