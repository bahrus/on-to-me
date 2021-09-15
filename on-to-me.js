import { convert, getProp } from './prop-mixin.js';
import { passVal } from './to-mixin.js';
import { nudge, getPreviousSib } from './on-mixin.js';
export class OnToMe extends HTMLElement {
    //_lastEvent: Event  
    _lastVal;
    _g;
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
