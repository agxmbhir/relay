const serializeArgs = (args) => {
    let keys = Object.keys(args);
    let serialized_args = new Object();
    
    keys.forEach(key => {
        if(isNaN(Number(key))) {
            if(typeof args[key] == "object") {
                try {
                    serialized_args[key] = args[key].toNumber();
                } catch {
                    serialized_args[key] = args[key].toString();
                }
            } else {
                serialized_args[key] = args[key];
            }
        }
    });

    return serialized_args;
}

const serializeEvent = (eve) => {
    try {
        let serializedObject = new Object();

        for(let key in eve) {
            if(typeof eve[key] != "function" && key !== "args" && key != "eventFragment") {
                serializedObject[key] = eve[key];
            }
        }

        serializedObject["args"] = serializeArgs(eve.args);
        return serializedObject;
    } catch {
        return null;
    }
}

module.exports = {
    serializeArgs,
    serializeEvent
}