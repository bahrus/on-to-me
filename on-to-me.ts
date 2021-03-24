/**
* get previous sibling
*/
export function getPreviousSib(self: Element, observe: string | null | undefined) : Element | null{
   let prevSib: Element | null = self;
   //const observe = self.getAttribute('observe')
   while(prevSib && (prevSib.hasAttribute('on') || (observe !== null && !prevSib.matches(observe)))){
       prevSib = prevSib.previousElementSibling || self.parentElement;
   }
   return prevSib;
}

/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param prevSib 
 */
export function nudge(prevSib: Element) {
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

export function getProp(val: any, pathTokens: (string | [string, string[]])[], src: Element){
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if(context && token!=='')  {
            if(first && token==='target' && context['target'] === null){
                context = (<any>src)._trigger;
            }else{
                switch(typeof token){
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

export function convert(val: string, parseValAs: string | null){
    if(parseValAs === null) return val;
    let ret  = val as any;
    switch(this.parseValAs){
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
export function lispToCamel(s: string){
    return s.replace(ltcRe, function(m){return m[1].toUpperCase();});
}

export function findMatches(start: Element, match: string, m: number | undefined, from: string | null, careOf: string | null): Element[]{
    let returnObj = [] as Element[];
    const ubound = m ?? Infinity;
    let count = 0;
    if(from){
        start = start.closest(from);
    }else{
        start = start.nextElementSibling;
    }
    while(start !== null){
        if(start.matches(match)) {
            if(careOf){
                const careOfs = Array.from(start.querySelectorAll(careOf));
                returnObj = returnObj.concat(careOfs);
                count += careOfs.length;
            }else{
                count++;
                returnObj.push(start);
            }
            if(count > ubound) break;
        }
        start = start.nextElementSibling;
    }
    return returnObj;
}

export function getToProp(to: string, careOf: string | null): string | null{
    let target = careOf || to;
    const iPos = target.lastIndexOf('[');
    if(iPos === -1) return null;
    target = target.replace('[data-', '[-');
    return lispToCamel(target.substring(iPos + 2, target.length - 1));
}

export function passVal(val: any, self: HTMLElement, to: string | undefined, careOf: string | undefined, me: number | undefined, from, cachedMatches?: Element[] | undefined){
    const matches = cachedMatches ?? findMatches(self, to, me, from, careOf);
    const toProp = getToProp(to, careOf);
    matches.forEach( match => {
        match[toProp] = val;
    });
    return matches;
}


export class OnToMe extends HTMLElement {
    _lastEvent: Event;
    _g: any;
    connectedCallback(){
        this.style.display = 'none';
        const g = this._g = this.getAttribute.bind(this);
        const elToObserve = getPreviousSib(this, g('observe'))!;
        nudge(elToObserve);
        
        elToObserve.addEventListener(g('on')!, (e:Event) => {
            e.stopPropagation();
            this._lastEvent = e;
            this.handleEvent();
        });
        const mutateEvent = g('mutate-event');
        if(mutateEvent !== null) this.parentElement?.addEventListener(mutateEvent, (e:Event) => {
            this.handleEvent();
        });
        const initVal = g('init-val');
        if(initVal !== null){
            let val = getProp(elToObserve, initVal.split('.'), this);
            val = convert(val, g('parse-val-as'));
            const me = g('me');
            const m = me === null ? Infinity : parseInt(me);
            passVal(val, this, g('to')!, g('care-of'), m, g('from'));
        }
    }
    handleEvent(){
        let val = getProp(this._lastEvent, this._g('val')?.split('.'), this);
        if(val === undefined) return;
        val = convert(val, this._g('parse-val-as'));
        const g = this._g;
        const to = this._g('to')!;
        const careOf = this._g('care-of');
        passVal(val, this, g('to')!, g('care-of'), g('me'), g('from'));
    }
}

const otm = 'on-to-me';
if(!customElements.get(otm)) customElements.define(otm, OnToMe); 

declare global {
    interface HTMLElementTagNameMap {
        [otm]: OnToMe,
    }
}

