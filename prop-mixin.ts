export function convert(val: string, parseValAs: string | null){
    if(parseValAs === null) return val;
    let ret  = val as any;
    switch(parseValAs){
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

export function getProp(val: any, pathTokens: (string | [string, string[]])[], src: Element){
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if(context && token!=='')  {
            if(first && token==='target' && context['target'] === null){ //I think this code isn't used anymore
                context = (<any>src)._trigger; //TODO:  remove this code
            }else{
                switch(typeof token){
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        context = context[token[0]].apply(context, token[1]); //allow for method calls
                }
            }
            first = false;
        }
    });

    return context;
}