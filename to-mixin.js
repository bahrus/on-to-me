import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
export function getToProp(to, careOf, as) {
    let target = careOf || to;
    if (!target || !target.endsWith(']'))
        return null;
    const iPos = target.lastIndexOf('[');
    if (iPos === -1)
        return null;
    target = target.replace('[data-data-', '[-');
    if (target[iPos + 1] !== '-')
        return null;
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
                if (toProp === '...') {
                    Object.assign(subMatch, val);
                }
                else {
                    subMatch[toProp] = val;
                }
        }
    });
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
