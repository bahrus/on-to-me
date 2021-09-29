export function convert(val, parseValAs) {
    if (parseValAs === null)
        return val;
    let ret = val;
    switch (parseValAs) {
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
        case 'string':
            switch (typeof val) {
                case 'string':
                    ret = val;
                    break;
                case 'object':
                    ret = JSON.stringify(val);
                    break;
            }
            break;
        case 'object':
            switch (typeof val) {
                case 'string':
                    ret = JSON.parse(val);
                    break;
                case 'object':
                    ret = val;
                    break;
            }
    }
    return ret;
}
export function splitExt(val) {
    const split = val.split('.');
    return split.map(s => {
        const subSplit = s.split('|');
        if (subSplit.length > 1)
            return subSplit;
        return s;
    });
}
export function getProp(val, pathTokens, src) {
    let context = val;
    let first = true;
    pathTokens.forEach(token => {
        if (context && token !== '') {
            if (first && token === 'target' && context['target'] === null) { //I think this code isn't used anymore
                context = src._trigger; //TODO:  remove this code
            }
            else {
                switch (typeof token) {
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        //allow for method calls
                        if (token[1] === '') {
                            context = context[token[0]]();
                        }
                        else {
                            //TODO:  try JSON.parse(token[1])
                            context = context[token[0]](token[1]);
                        }
                }
            }
            first = false;
        }
    });
    return context;
}
