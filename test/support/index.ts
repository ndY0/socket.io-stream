import io, { Socket } from 'socket.io-client';
// import {forceBase64} from '../../'

const port = process.env.ZUUL_PORT || 4000;

const isBrowser = !!global.window;
const defaultURI = isBrowser ? '' : 'http://localhost:' + exports.port;

let client: (uri: string, options: any) => Socket;
if ((io as any).version) {
  // forceBase64 = true;

  const optionMap: any = {
    autoConnect: 'auto connect',
    forceNew: 'force new connection',
    reconnection: 'reconnect'
  };

  // 0.9.x
  client = function(uri: string, options: any) {
    if ('object' === typeof uri) {
      options = uri;
      uri = null;
    }
    uri = uri || defaultURI;
    options = options || {};

    var _options: any = {
      'force new connection': true
    };

    for (var key in options) {
      _options[optionMap[key] || key] = options[key];
    }

    return io(uri, _options);
  };

} else {
  // 1.x.x

  client = function(uri: string, options: any) {
    if ('object' === typeof uri) {
      options = uri;
      uri = null;
    }
    uri = uri || defaultURI;
    options = options || {};

    var _options: any = {
      forceNew: true
    };
    for (var key in options) {
      _options[key] = options[key];
    }

    return io(uri, _options);
  };
}
export {client, port}
