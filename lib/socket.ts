
// exports = module.exports = Socket;

import { EventEmitter } from "stream";
import { Socket as IOSocket } from 'socket.io-client';
import { IOStream } from "./iostream";
import { Decoder, Encoder } from "./parser";
import { baseEvent, baseEvents } from "./constants";

/**
 * Base event name for messaging.
 *
 * @api public
 */
// exports.event = '$stream';

// exports.events = [
//   'error',
//   'newListener',
//   'removeListener'
// ];

// util.inherits(Socket, EventEmitter);

class Socket extends EventEmitter {
  private forceBase64: boolean;
  private streams: {[x: string]: IOStream; [y: number]: IOStream};
  private encoder = new Encoder();
  private decoder = new Decoder();
  constructor(private sio: IOSocket, private options: {forceBase64?: boolean} = {}) {
    super();
    this.forceBase64 = !!options.forceBase64;
    this.sio.on(baseEvent, this.emit);
    this.sio.on(baseEvent + '-read', this._onread.bind(this));
    this.sio.on(baseEvent + '-write', this._onwrite.bind(this));
    this.sio.on(baseEvent + '-end', this._onend.bind(this));
    this.sio.on(baseEvent + '-error', this._onerror.bind(this));
    this.sio.on('error', (...args: any[]) => this.emit('error', ...args).bind(this));
    this.sio.on('disconnect', this._ondisconnect.bind(this));

    this.encoder.on('stream', this._onencode.bind(this));
    this.decoder.on('stream', this._ondecode.bind(this));
  }
  public emit(type: string, ...args: any[] ) {
    if (~baseEvents.indexOf(type)) {
      return super.emit.apply(this, [type, ...args]);
    }
    this._stream.apply(this, [type, args]);
    return this;
  }
  public on(type: string, listener: Function, ...rest: any[]) {
    if (~baseEvents.indexOf(type)) {
      return super.on.apply(this, [type, listener, ...rest]);
    }
  
    this._onstream(type, listener);
    return this;
  }
  public _stream(type: string, ...rest: any[]) {

    const self = this;
    const args = Array.prototype.slice.call([type, ...rest], 1);
    const ack = args[args.length - 1];
    if ('function' === typeof ack) {
      args[args.length - 1] = function() {
        var args = Array.prototype.slice.call([type, ...rest]);
        args = self.decoder.decode(args);
        ack.apply(this, args);
      };
    }
    this.sio.emit.apply(this.sio, [baseEvents, type].concat(this.encoder.encode(args) as any));
  }
  public _read(id: string, size: number) {
    this.sio.emit(baseEvent + '-read', id, size);
  }
  public _write(id: string, chunk: any, encoding: BufferEncoding, callback: Function) {
    if (Buffer.isBuffer(chunk)) {
      if (this.forceBase64) {
        encoding = 'base64';
        chunk = chunk.toString(encoding);
      } else if (!global.Buffer) {
        // socket.io can't handle Buffer when using browserify.
        if ((chunk as any).toArrayBuffer) {
          chunk = (chunk as any).toArrayBuffer();
        } else {
          chunk = chunk.buffer;
        }
      }
    }
    this.sio.emit(baseEvent + '-write', id, chunk, encoding, callback);
  }
  public _end (id: string) {
    this.sio.emit(baseEvent + '-end', id);
  };
  
  public _error (id: string, err: any) {
    this.sio.emit(baseEvent + '-error', id, err.message || err);
  };
  public _onstream(type: string, listener: Function) {
    if ('function' != typeof listener) {
      throw TypeError('listener must be a function');
    }
  
    function onstream(...argz: any[]) {
      const self = this;
      const args = Array.prototype.slice.call(argz);
      var ack = args[args.length - 1];
      if ('function' == typeof ack) {
        args[args.length - 1] = function() {
          const args = Array.prototype.slice.call(argz);
          ack.apply(this, self.encoder.encode(args));
        };
      }
      listener.apply(this, this.decoder.decode(args));
    }
  
    // for removeListener
    onstream.listener = listener;
  
    super.on.call(this, type, onstream);
  }
  public _onread(id: string, size: number) {

    var stream = this.streams[id];
    if (stream) {
      stream._onread(size);
    } else {
    }
  }
  public _onwrite(id: string, chunk: any, encoding: BufferEncoding, callback: Function) {

    var stream = this.streams[id];
    if (!stream) {
      callback('invalid stream id: ' + id);
      return;
    }
    if (global.ArrayBuffer && chunk instanceof ArrayBuffer) {
      // make sure that chunk is a buffer for stream
      chunk = Buffer.from(new Uint8Array(chunk));
    }
    stream._onwrite(chunk, encoding, callback);
  }
  public _onend(id: string) {

    var stream = this.streams[id];
    if (!stream) {
      return;
    }
  
    stream._end();
  }
  public _onerror(id: string, message: string) {

    var stream = this.streams[id];
    if (!stream) {
      return;
    }
  
    var err = new Error(message);
    (err as any).remote = true;
    stream.emit('error', err);
  }
  
  public _ondisconnect() {
    var stream;
    for (var id in this.streams) {
      stream = this.streams[id];
      stream.destroy();
  
      // Close streams when the underlaying
      // socket.io connection is closed (regardless why)
      stream.emit('close');
      stream.emit('error', new Error('Connection aborted'));
    }
  };
  
  public _onencode(stream: IOStream) {
    if (stream.socket || stream.destroyed) {
      throw new Error('stream has already been sent.');
    }
  
    var id = stream.id;
    if (this.streams[id]) {
      throw new Error('Encoded stream already exists: ' + id);
    }
  
    this.streams[id] = stream;
    stream.socket = this;
  };
  
  public _ondecode(stream: IOStream) {
    var id = stream.id;
    if (this.streams[id]) {
      this._error(id, new Error('Decoded stream already exists: ' + id));
      return;
    }
  
    this.streams[id] = stream;
    stream.socket = this;
  };
  
  public cleanup(id: string) {
    delete this.streams[id];
  };
}
export {Socket}

/**
 * Bidirectional stream socket which wraps Socket.IO.
 *
 * @param {socket.io#Socket} socket.io
 * @api public
 */
// function Socket(sio, options) {
//   if (!(this instanceof Socket)) {
//     return new Socket(sio, options);
//   }

  // EventEmitter.call(this);

  // options = options || {};

  // this.sio = sio;
  // this.forceBase64 = !!options.forceBase64;
  // this.streams = {};
  // this.encoder = new parser.Encoder();
  // this.decoder = new parser.Decoder();

  // var eventName = exports.event;
//   sio.on(eventName, bind(this, emit));
//   sio.on(eventName + '-read', bind(this, '_onread'));
//   sio.on(eventName + '-write', bind(this, '_onwrite'));
//   sio.on(eventName + '-end', bind(this, '_onend'));
//   sio.on(eventName + '-error', bind(this, '_onerror'));
//   sio.on('error', bind(this, emit, 'error'));
//   sio.on('disconnect', bind(this, '_ondisconnect'));

//   this.encoder.on('stream', bind(this, '_onencode'));
//   this.decoder.on('stream', bind(this, '_ondecode'));
// }

/**
 * Original emit function.
 *
 * @api private
 */
// Socket.prototype.$emit = emit;

/**
 * Emits streams to this corresponding server/client.
 *
 * @return {Socket} self
 * @api public
 */
// Socket.prototype.emit = function(type) {
//   if (~exports.events.indexOf(type)) {
//     return emit.apply(this, arguments);
//   }
//   this._stream.apply(this, arguments);
//   return this;
// };

// Socket.prototype.on = function(type, listener) {
//   if (~exports.events.indexOf(type)) {
//     return on.apply(this, arguments);
//   }

//   this._onstream(type, listener);
//   return this;
// };

/**
 * Sends a new stream request.
 *
 * @param {String} event type
 * @api private
 */
// Socket.prototype._stream = function(type) {

//   var self = this;
//   var args = slice.call(arguments, 1);
//   var ack = args[args.length - 1];
//   if ('function' == typeof ack) {
//     args[args.length - 1] = function() {
//       var args = slice.call(arguments);
//       args = self.decoder.decode(args);
//       ack.apply(this, args);
//     };
//   }

//   args = this.encoder.encode(args);
//   var sio = this.sio;
//   sio.emit.apply(sio, [exports.event, type].concat(args));
// };

/**
 * Notifies the read event.
 *
 * @api private
 */
// Socket.prototype._read = function(id, size) {
//   this.sio.emit(exports.event + '-read', id, size);
// };

/**
 * Requests to write a chunk.
 *
 * @api private
 */
// Socket.prototype._write = function(id, chunk, encoding, callback) {
//   if (Buffer.isBuffer(chunk)) {
//     if (this.forceBase64) {
//       encoding = 'base64';
//       chunk = chunk.toString(encoding);
//     } else if (!global.Buffer) {
//       // socket.io can't handle Buffer when using browserify.
//       if (chunk.toArrayBuffer) {
//         chunk = chunk.toArrayBuffer();
//       } else {
//         chunk = chunk.buffer;
//       }
//     }
//   }
//   this.sio.emit(exports.event + '-write', id, chunk, encoding, callback);
// };

// Socket.prototype._end = function(id) {
//   this.sio.emit(exports.event + '-end', id);
// };

// Socket.prototype._error = function(id, err) {
//   this.sio.emit(exports.event + '-error', id, err.message || err);
// };

/**
 * Handles a new stream request.
 *
 * @param {String} event type
 * @param {Function} listener
 *
 * @api private
 */
// Socket.prototype._onstream = function(type, listener) {
//   if ('function' != typeof listener) {
//     throw TypeError('listener must be a function');
//   }

//   function onstream() {
//     var self = this;
//     var args = slice.call(arguments);
//     var ack = args[args.length - 1];
//     if ('function' == typeof ack) {
//       args[args.length - 1] = function() {
//         var args = slice.call(arguments);
//         args = self.encoder.encode(args);
//         ack.apply(this, args);
//       };
//     }

//     args = this.decoder.decode(args);
//     listener.apply(this, args);
//   }

//   // for removeListener
//   onstream.listener = listener;

//   on.call(this, type, onstream);
// };

// Socket.prototype._onread = function(id, size) {

//   var stream = this.streams[id];
//   if (stream) {
//     stream._onread(size);
//   } else {
//   }
// };

// Socket.prototype._onwrite = function(id, chunk, encoding, callback) {

//   var stream = this.streams[id];
//   if (!stream) {
//     callback('invalid stream id: ' + id);
//     return;
//   }

//   if (global.ArrayBuffer && chunk instanceof ArrayBuffer) {
//     // make sure that chunk is a buffer for stream
//     chunk = new Buffer(new Uint8Array(chunk));
//   }
//   stream._onwrite(chunk, encoding, callback);
// };

// Socket.prototype._onend = function(id) {

//   var stream = this.streams[id];
//   if (!stream) {
//     return;
//   }

//   stream._end();
// };

// Socket.prototype._onerror = function(id, message) {

//   var stream = this.streams[id];
//   if (!stream) {
//     return;
//   }

//   var err = new Error(message);
//   err.remote = true;
//   stream.emit('error', err);
// };

// Socket.prototype._ondisconnect = function() {
//   var stream;
//   for (var id in this.streams) {
//     stream = this.streams[id];
//     stream.destroy();

//     // Close streams when the underlaying
//     // socket.io connection is closed (regardless why)
//     stream.emit('close');
//     stream.emit('error', new Error('Connection aborted'));
//   }
// };

// Socket.prototype._onencode = function(stream) {
//   if (stream.socket || stream.destroyed) {
//     throw new Error('stream has already been sent.');
//   }

//   var id = stream.id;
//   if (this.streams[id]) {
//     throw new Error('Encoded stream already exists: ' + id);
//   }

//   this.streams[id] = stream;
//   stream.socket = this;
// };

// Socket.prototype._ondecode = function(stream) {
//   var id = stream.id;
//   if (this.streams[id]) {
//     this._error(id, new Error('Decoded stream already exists: ' + id));
//     return;
//   }

//   this.streams[id] = stream;
//   stream.socket = this;
// };

// Socket.prototype.cleanup = function(id) {
//   delete this.streams[id];
// };

