/**
* get previous sibling
*/
export function getPreviousSib(self, observe) {
    let prevSib = self;
    //const observe = self.getAttribute('observe')
    while (prevSib && (prevSib.hasAttribute('on') || (observe !== null && observe !== undefined && !prevSib.matches(observe)))) {
        const nextPrevSib = prevSib.previousElementSibling || prevSib.parentElement;
        //if(prevSib === nextPrevSib) return null;
        prevSib = nextPrevSib;
    }
    return prevSib;
}
/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param prevSib
 */
export function nudge(prevSib) {
    const da = prevSib.getAttribute('disabled');
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            prevSib.removeAttribute('disabled');
        }
        else {
            prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
        }
    }
}
export function getProp(val, pathTokens, src) {
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if (context && token !== '') {
            if (first && token === 'target' && context['target'] === null) {
                context = src._trigger;
            }
            else {
                switch (typeof token) {
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        context = context[token[0]].apply(context, token[1]);
                }
            }
            first = false;
        }
    });
    return context;
}
export function convert(val, parseValAs) {
    if (parseValAs === null)
        return val;
    let ret = val;
    switch (parseValAs) {
        case 'bool':
            ret = val === 'true';
            break;
        case 'int':
            ret = parseInt(val);
            break;
        case 'float':
            ret = parseFloat(val);
            break;
        case 'date':
            ret = new Date(val);
            break;
        case 'truthy':
            ret = !!val;
            break;
        case 'falsy':
            ret = !val;
            break;
    }
    return ret;
}
const ltcRe = /(\-\w)/g;
export function lispToCamel(s) {
    return s.replace(ltcRe, function (m) { return m[1].toUpperCase(); });
}
export function findMatches(start, match, m, from, careOf) {
    let returnObj = [];
    match = match || '*';
    const ubound = m ?? Infinity;
    let count = 0;
    let start2;
    if (from) {
        start2 = start.closest(from);
    }
    else {
        start2 = start.nextElementSibling;
    }
    while (start2 !== null) {
        if (start2.matches(match)) {
            if (careOf) {
                const careOfs = Array.from(start2.querySelectorAll(careOf));
                returnObj = returnObj.concat(careOfs);
                count += careOfs.length;
            }
            else {
                count++;
                returnObj.push(start2);
            }
            if (count > ubound)
                break;
        }
        start2 = start2.nextElementSibling;
    }
    return returnObj;
}
export function getToProp(to, careOf, as) {
    let target = careOf || to;
    if (!target)
        return null;
    const iPos = target.lastIndexOf('[');
    if (iPos === -1)
        return null;
    target = target.replace('[data-', '[-');
    target = target.substring(iPos + 2, target.length - 1);
    return !!as ? target : lispToCamel(target);
}
export function passVal(val, self, to, careOf, me, from, prop, as, cachedMatches) {
    const matches = cachedMatches ?? findMatches(self, to, me, from, careOf);
    passValToMatches(matches, val, to, careOf, prop, as);
    return matches;
}
export function passValToMatches(matches, val, to, careOf, prop, as) {
    const dynToProp = getToProp(to, careOf, as);
    const hasBoth = !!prop && dynToProp !== null; //hasBoth is there for use with an element ref property.
    const toProp = hasBoth ? dynToProp : prop || dynToProp;
    if (toProp === null)
        throw "No to prop.";
    matches.forEach(match => {
        let subMatch = match;
        if (hasBoth) {
            if (match[prop] === undefined) {
                match[prop] = {};
            }
            subMatch = match[prop];
        }
        switch (as) {
            case 'str-attr':
                subMatch.setAttribute(toProp, val.toString());
                break;
            case 'obj-attr':
                subMatch.setAttribute(toProp, JSON.stringify(val));
                break;
            case 'bool-attr':
                if (val) {
                    subMatch.setAttribute(toProp, '');
                }
                else {
                    subMatch.removeAttribute(toProp);
                }
                break;
            default:
                subMatch[toProp] = val;
        }
    });
}
export class OnToMe extends HTMLElement {
    connectedCallback() {
        this.style.display = 'none';
        const g = this._g = this.getAttribute.bind(this);
        const elToObserve = getPreviousSib(this, g('observe'));
        nudge(elToObserve);
        elToObserve.addEventListener(g('on'), (e) => {
            e.stopPropagation();
            this.getVal(e);
        });
        const mutateEvent = g('mutate-event');
        if (mutateEvent !== null)
            this.parentElement?.addEventListener(mutateEvent, (e) => {
                this.putVal();
            });
        const initVal = g('init-val');
        if (initVal !== null) {
            this.setInit(elToObserve, initVal);
            const initEvent = g('init-event');
            if (initEvent !== null) {
                elToObserve.addEventListener(initEvent, (e) => {
                    this.setInit(elToObserve, initVal);
                }, { once: true });
            }
        }
    }
    setInit(elToObserve, initVal) {
        const g = this._g;
        let val = getProp(elToObserve, initVal.split('.'), this);
        val = convert(val, g('parse-val-as'));
        this._lastVal = val;
        const me = g('me');
        const m = me === null ? Infinity : parseInt(me);
        passVal(val, this, g('to'), g('care-of'), m, g('from'), g('prop'), g('as'));
    }
    getVal(lastEvent) {
        let val = getProp(lastEvent, this._g('val')?.split('.'), this);
        if (val === undefined)
            return;
        val = convert(val, this._g('parse-val-as'));
        this._lastVal = val;
        this.putVal();
    }
    putVal() {
        if (this._lastVal === undefined)
            return;
        const g = this._g;
        const to = this._g('to');
        const careOf = this._g('care-of');
        passVal(this._lastVal, this, g('to'), g('care-of'), g('me'), g('from'), g('prop'), g('as'));
    }
}
const otm = 'on-to-me';
if (!customElements.get(otm))
    customElements.define(otm, OnToMe);
