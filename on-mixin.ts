import {OnMixinProps} from './types';
import {nudge, getPreviousSib} from './on-to-me.js';
export const OnMixin = (superclass: {new(): OnMixinProps & HTMLElement}) => class C extends superclass{
    _wr: WeakRef<Element> | undefined;
    locateAndListen({on, _wr, previousOn, handleEvent, parentElement, ifTargetMatches}: this) {
        const previousElementToObserve = _wr?.deref();
        this._wr = undefined;
        const elementToObserve = this.observedElement;
        if(!elementToObserve) throw "Could not locate element to observe.";
        let doNudge = previousElementToObserve !== elementToObserve;
        if((previousElementToObserve !== undefined) && (previousOn !== undefined || (previousElementToObserve !== elementToObserve))){
            previousElementToObserve.removeEventListener(previousOn || on as keyof ElementEventMap, handleEvent);
        }else{
            doNudge = true;
        }
        this.attach(elementToObserve, this);
        if(doNudge){
            if(elementToObserve === parentElement && ifTargetMatches !== undefined){
                elementToObserve.querySelectorAll(ifTargetMatches).forEach(publisher =>{
                    nudge(publisher);
                });
            }else{
                nudge(elementToObserve);
            }
            
        }
        this.setAttribute!('status', '👂');
        this.previousOn = on;
    };

    handleEvent = (e: Event) => {
        if(this.ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches(this.ifTargetMatches!)) return;
        }
        if(!this.filterEvent(e)) return;
        this.lastEvent = e;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    get observedElement() : Element | null{
        const element = this._wr === undefined ? undefined : this._wr?.deref(); //TODO  wait for bundlephobia to get over it's updatephobia
        if(element !== undefined){
            return element;
        }
        let elementToObserve: Element | null;
        if(this.observeHost){
            elementToObserve = this.getHost(this).host;
        }
        else if(this.observeClosest){
            elementToObserve = this.closest(this.observeClosest);
            if(elementToObserve !== null && this.observe){
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement as HTMLElement, this.observe) as Element;
            }
        }else{
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement as HTMLElement, this.observe ?? null) as Element;
        }
        if(elementToObserve === null) return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }

    attach(elementToObserve: Element, {on, handleEvent, capture}: this){
        elementToObserve.addEventListener(on!, handleEvent, {capture: capture});
    }

    getHost({}: this): {host: HTMLElement}{
        let host = (<any>this.getRootNode()).host;
        if(host === undefined){
            host = this.parentElement;
            while(host && !host.localName.includes('-')){
                host = host.parentElement;
            }
        }
        return {host};
    }
}