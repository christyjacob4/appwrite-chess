
export const GameMode = {
    "DEMO" : "demo",
    "COMPUTER" : "computer",
    "LIVE" : "live"
}

export const AppMode = {
    "CREATE" : "create",
    "JOIN" : "join"
}

export function createId(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function joinGame(appwrite) {
}