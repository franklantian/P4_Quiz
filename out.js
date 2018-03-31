

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
const log = (socket,msg,color) =>{
    socket.write(colorize(msg,color) + "\n");
};

/**
 * Mensaje de log Grande
 * @param msg
 * @param color
 */
const biglog = (socket,msg,color) =>{
    log(socket,figlet.textSync(msg,{horizontalLayout:'full'}),color);
};

/**
 *Mensaje de error emsg
 * @param emsg
 */
const errorlog = (socket,emsg) =>{
    socket.write(`${colorize("Error","red")}: ${colorize(colorize(emsg,"red"),"bgYellowBright")}\n`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};