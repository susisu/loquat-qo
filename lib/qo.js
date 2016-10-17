/*
 * loquat-qo / qo.js
 * copyright (c) 2016 Susisu
 */

/**
 * @module qo
 */

"use strict";

module.exports = _core => {
    function end() {
        return Object.freeze({
            qo
        });
    }

    const ParseError = _core.ParseError;
    const Result     = _core.Result;
    const Parser     = _core.Parser;
    const isParser   = _core.isParser;

    /**
     * @function module:qo.qo
     * @static
     * @param {GeneratorFunction} genFunc
     * @returns {AbstractParser}
     */
    function qo(genFunc) {
        return new Parser(state => {
            const gen = genFunc();

            let currentState = state;
            let currentErr = ParseError.unknown(state.pos);
            let consumed = false;

            let genRes;
            try {
                genRes = gen.next();
            }
            catch (err) {
                if (isParser(err)) {
                    const errRes = err.run(currentState);
                    if (errRes.consumed) {
                        return Result.cerr(errRes.err);
                    }
                    else {
                        return Result.eerr(ParseError.merge(currentErr, errRes.err));
                    }
                }
                else {
                    throw err;
                }
            }

            while (!genRes.done) {
                const res = genRes.value.run(currentState);
                if (res.succeeded) {
                    if (res.consumed) {
                        consumed = true;
                        currentState = res.state;
                        currentErr = res.err;
                    }
                    else {
                        currentState = res.state;
                        currentErr = ParseError.merge(currentErr, res.err);
                    }
                }
                else {
                    if (res.consumed) {
                        return Result.cerr(res.err);
                    }
                    else {
                        return consumed
                            ? Result.cerr(ParseError.merge(currentErr, res.err))
                            : Result.eerr(ParseError.merge(currentErr, res.err));
                    }
                }

                try {
                    genRes = gen.next(res.val);
                }
                catch (err) {
                    if (isParser(err)) {
                        const errRes = err.run(currentState);
                        if (errRes.consumed) {
                            return Result.cerr(errRes.err);
                        }
                        else {
                            return Result.eerr(ParseError.merge(currentErr, errRes.err));
                        }
                    }
                    else {
                        throw err;
                    }
                }
            }

            return consumed
                ? Result.csuc(currentErr, genRes.value, currentState)
                : Result.esuc(currentErr, genRes.value, currentState);
        });
    }

    return end();
};