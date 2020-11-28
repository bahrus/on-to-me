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
export function findMatches(start, match, m) {
    const returnObj = [];
    const ubound = m == null ? Infinity : parseInt(m);
    let count = 0;
    while (start !== null) {
        if (start.matches(match)) {
            count++;
            returnObj.push(start);
            if (count > ubound)
                break;
        }
        start = start.nextElementSibling;
    }
    return returnObj;
}
export function getToProp(css) {
    const iPos = css.lastIndexOf('[');
    if (iPos === -1)
        return null;
    return lispToCamel(css.substring(iPos, css.length - 1));
}
customElements.define('on-to-me', class extends HTMLElement {
    connectedCallback() {
        this.style.display = 'none';
        const elToObserve = getPreviousSib(this);
        nudge(elToObserve);
        elToObserve.addEventListener(this.getAttribute('on'), e => {
            const val = getProp(e, this.getAttribute('val').split('.'), this);
            if (val === undefined)
                return;
            const to = this.getAttribute('to');
            const matches = findMatches(this.nextElementSibling, to, this.getAttribute('m'));
            const toProp = getToProp(to);
            matches.forEach(match => {
                match[toProp] = val;
            });
        });
    }
});
