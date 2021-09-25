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
    attach(elementToObserve, { on, onProp, handleEvent, capture }) {
        if (on !== undefined) {
            elementToObserve.addEventListener(on, handleEvent, { capture: capture });
        }
        if (onProp !== undefined) {
            let proto = elementToObserve;
            let prop = Object.getOwnPropertyDescriptor(proto, onProp);
            while (proto && !prop) {
                proto = Object.getPrototypeOf(proto);
                prop = Object.getOwnPropertyDescriptor(proto, onProp);
            }
            if (prop === undefined) {
                throw { elementToObserve, onProp, message: "Can't find property." };
            }
            const setter = prop.set.bind(elementToObserve);
            const getter = prop.get.bind(elementToObserve);
            Object.defineProperty(elementToObserve, onProp, {
                get() {
                    return getter();
                },
                set(nv) {
                    setter(nv);
                    const event = {
                        target: this
                    };
                    handleEvent(event);
                },
                enumerable: true,
                configurable: true,
            });
        }
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
/**
* get previous sibling
*/
export function getPreviousSib(self, observe) {
    let prevSib = self;
    //const observe = self.getAttribute('observe')
    //TODO:  use instanceof?
    while (prevSib && (prevSib.hasAttribute('on') || prevSib.hasAttribute('val-from-target') || prevSib.hasAttribute('vft') || (observe && !prevSib.matches(observe)))) {
        const nextPrevSib = prevSib.previousElementSibling || prevSib.parentElement;
        //if(prevSib === nextPrevSib) return null;
        prevSib = nextPrevSib;
    }
    return prevSib;
}
