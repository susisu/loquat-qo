/*
 * loquat-qo
 * copyright (c) 2016 Susisu
 */

"use strict";

module.exports = _core => {
    let _qo = require("./lib/qo.js")(_core);

    return Object.freeze({
        qo: _qo.qo,
        do: _qo.qo
    });
};
