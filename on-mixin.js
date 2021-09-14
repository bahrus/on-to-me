import { nudge, getPreviousSib } from './on-to-me.js';
export const OnMixin = (superclass) => class C extends superclass {
    _wr;
    locateAndListen({ on, _wr, previousOn, handleEvent, parentElement, ifTargetMatches }) {
        const previousElementToObserve = _wr?.deref();
        this._wr = undefined;
        const elementToObserve = this.observedElement;
        if (!elementToObserve)
            throw "Could not locate element to observe.";
        let doNudge = previousElementToObserve !== elementToObserve;
        if ((previousElementToObserve !== undefined) && (previousOn !== undefined || (previousElementToObserve !== elementToObserve))) {
            previousElementToObserve.removeEventListener(previousOn || on, handleEvent);
        }
        else {
            doNudge = true;
        }
        this.attach(elementToObserve, this);
        if (doNudge) {
            if (elementToObserve === parentElement && ifTargetMatches !== undefined) {
                elementToObserve.querySelectorAll(ifTargetMatches).forEach(publisher => {
                    nudge(publisher);
                });
            }
            else {
                nudge(elementToObserve);
            }
        }
        this.setAttribute('status', '👂');
        this.previousOn = on;
    }
    ;
    handleEvent = (e) => {
        if (this.ifTargetMatches !== undefined) {
            if (!e.target.matches(this.ifTargetMatches))
                return;
        }
        if (!this.filterEvent(e))
            return;
        this.lastEvent = e;
    };
    filterEvent(e) {
        return true;
    }
    get observedElement() {
        const element = this._wr === undefined ? undefined : this._wr?.deref(); //TODO  wait for bundlephobia to get over it's updatephobia
        if (element !== undefined) {
            return element;
        }
        let elementToObserve;
        if (this.observeHost) {
            elementToObserve = this.getHost(this).host;
        }
        else if (this.observeClosest) {
            elementToObserve = this.closest(this.observeClosest);
            if (elementToObserve !== null && this.observe) {
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement, this.observe);
            }
        }
        else {
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement, this.observe ?? null);
        }
        if (elementToObserve === null)
            return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }
    attach(elementToObserve, { on, handleEvent, capture }) {
        elementToObserve.addEventListener(on, handleEvent, { capture: capture });
    }
    getHost({}) {
        let host = this.getRootNode().host;
        if (host === undefined) {
            host = this.parentElement;
            while (host && !host.localName.includes('-')) {
                host = host.parentElement;
            }
        }
        return { host };
    }
};
