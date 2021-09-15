export interface OnToMeProps extends Partial<HTMLElement>{}

export type asAttr = 'str-attr' | 'bool-attr' | 'obj-attr' | undefined | null;

export interface OnMixinProps{
    on: string;
    observe: string;
    previousOn?: string;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches: string;

    lastEvent?: Event;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock: boolean;

    observeClosest: string;

    observeHost: boolean;

    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture: boolean;

    observedElement : Element | null;
}

export interface OnMixinActions{
    locateAndListen(self: this): void;
    doEvent(self: this): {cnt: number}; 
    getHost(self: this): {host: HTMLElement};   
    handleEvent: (e: Event) => void;
}