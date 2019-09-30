// 获取本地 ip
const interfaces = require("os").networkInterfaces();
let IPAdress = "";
for (var devName in interfaces) {
  var iface = interfaces[devName];
  for (var i = 0; i < iface.length; i++) {
    var alias = iface[i];
    if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
      IPAdress = alias.address;
    }
  }
}

module.exports = IPAdress;
