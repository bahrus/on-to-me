/**
* get previous sibling
*/
export function getPreviousSib(self) {
    let prevSib = self;
    while (prevSib && (prevSib.hasAttribute('on'))) {
        prevSib = prevSib.previousElementSibling;
        if (prevSib === null) {
            prevSib = self.parentElement;
        }
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
const ltcRe = /(\-\w)/g;
export function lispToCamel(s) {
    return s.replace(ltcRe, function (m) { return m[1].toUpperCase(); });
}
export function findMatches(start, match, m, from, careOf) {
    const returnObj = [];
    const ubound = m == null ? Infinity : parseInt(m);
    let count = 0;
    if (from) {
        start = start.closest(from);
    }
    else {
        start = start.nextElementSibling;
    }
    while (start !== null) {
        if (start.matches(match)) {
            if (careOf) {
                const careOfs = Array.from(start.querySelectorAll(careOf));
                returnObj.concat(careOfs);
                count += careOfs.length;
            }
            else {
                count++;
                returnObj.push(start);
            }
            if (count > ubound)
                break;
        }
        start = start.nextElementSibling;
    }
    return returnObj;
}
export function getToProp(to, careOf) {
    const iPos = (careOf || to).lastIndexOf('[');
    if (iPos === -1)
        return null;
    return lispToCamel(to.substring(iPos + 2, to.length - 1));
}
export class OnToMe extends HTMLElement {
    connectedCallback() {
        this.style.display = 'none';
        const elToObserve = getPreviousSib(this);
        nudge(elToObserve);
        const g = this.getAttribute.bind(this);
        elToObserve.addEventListener(g('on'), e => {
            e.stopPropagation();
            const val = getProp(e, g('val').split('.'), this);
            if (val === undefined)
                return;
            const to = g('to');
            const careOf = g('care-of');
            const matches = findMatches(this, to, g('m'), g('from'), careOf);
            const toProp = getToProp(to, careOf);
            matches.forEach(match => {
                match[toProp] = val;
            });
        });
    }
}
customElements.define('on-to-me', OnToMe);
