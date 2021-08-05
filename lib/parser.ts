import { DuplexOptions, EventEmitter } from "stream";
import { IOStream } from "./iostream";
import { AnyOf, ObjectOf } from "./types";

// var util = require('util');
// var EventEmitter = require('events').EventEmitter;
// var IOStream = require('./iostream');
// var slice = Array.prototype.slice;

// exports.Encoder = Encoder;
// exports.Decoder = Decoder;

// util.inherits(Encoder, EventEmitter);

class Encoder extends EventEmitter {
  public encode(v: AnyOf<IOStream>): AnyOf<{$stream: string, options?: DuplexOptions}> {
    if (v instanceof IOStream) {
      return this.encodeStream(v);
    } else if (Array.isArray(v)) {
      return this.encodeArray(v);
    } else if (v && 'object' === typeof v) {
      return this.encodeObject(v);
    }
    return v as unknown as AnyOf<{$stream: string, options?: DuplexOptions}>;
  }
  public encodeStream(stream: IOStream) {
    this.emit('stream', stream);
  
    // represent a stream in an object.
    const v: {$stream: string, options?: DuplexOptions} = { $stream: stream.id };
    if (stream.options) {
      v.options = stream.options;
    }
    return v;
  }
  public encodeArray(arr: ObjectOf<IOStream>[] | IOStream[]) {
    var v: {$stream: string, options?: DuplexOptions}[] = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      v.push(this.encode(arr[i]) as {$stream: string, options?: DuplexOptions});
    }
    return v;
  }
  public encodeObject(obj:ObjectOf<IOStream>) {
    var v: {[x: string]: {$stream: string, options?: DuplexOptions}, [y: number]: {$stream: string, options?: DuplexOptions}} = {};
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        v[k] = this.encode(obj[k]) as {$stream: string, options?: DuplexOptions};
      }
    }
    return v;
  }
}

class Decoder extends EventEmitter {
  public decode(v: AnyOf<{$stream: string, options?: DuplexOptions}>): AnyOf<IOStream> {
    if (v && (v as {$stream: string, options?: DuplexOptions}).$stream) {
      return this.decodeStream(v as {$stream: string, options?: DuplexOptions});
    } else if (Array.isArray(v)) {
      return this.decodeArray(v as {$stream: string, options?: DuplexOptions}[]);
    } else if (v && 'object' == typeof v) {
      return this.decodeObject(v as ObjectOf<{$stream: string, options?: DuplexOptions}>);
    }
    return v as unknown as AnyOf<IOStream>;
  }
  public decodeStream(obj: {$stream: string, options?: DuplexOptions}) {
    var stream = new IOStream(obj.options);
    stream.id = obj.$stream;
    this.emit('stream', stream);
    return stream;
  }
  public decodeArray(arr: {$stream: string, options?: DuplexOptions}[]) {
    var v: IOStream[] = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      v.push(this.decode(arr[i]) as IOStream);
    }
    return v;
  }
  public decodeObject(obj: ObjectOf<{$stream: string, options?: DuplexOptions}>) {
    var v: {[x: string]: IOStream, [y: number]: IOStream} = {};
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        v[k] = this.decode(obj[k]) as IOStream;
      }
    }
    return v;
  }
}

export {Encoder, Decoder}

// function Encoder() {
//   EventEmitter.call(this);
// }

/**
 * Encode streams to placeholder objects.
 *
 * @api public
 */
// Encoder.prototype.encode = function(v) {
//   if (v instanceof IOStream) {
//     return this.encodeStream(v);
//   } else if (util.isArray(v)) {
//     return this.encodeArray(v);
//   } else if (v && 'object' == typeof v) {
//     return this.encodeObject(v);
//   }
//   return v;
// }

// Encoder.prototype.encodeStream = function(stream) {
//   this.emit('stream', stream);

//   // represent a stream in an object.
//   var v = { $stream: stream.id };
//   if (stream.options) {
//     v.options = stream.options;
//   }
//   return v;
// }

// Encoder.prototype.encodeArray = function(arr) {
//   var v = [];
//   for (var i = 0, len = arr.length; i < len; i++) {
//     v.push(this.encode(arr[i]));
//   }
//   return v;
// }

// Encoder.prototype.encodeObject = function(obj) {
//   var v = {};
//   for (var k in obj) {
//     if (obj.hasOwnProperty(k)) {
//       v[k] = this.encode(obj[k]);
//     }
//   }
//   return v;
// }

// util.inherits(Decoder, EventEmitter);

// function Decoder() {
//   EventEmitter.call(this);
// }

/**
 * Decode placeholder objects to streams.
 *
 * @api public
 */
// Decoder.prototype.decode = function(v) {
//   if (v && v.$stream) {
//     return this.decodeStream(v);
//   } else if (util.isArray(v)) {
//     return this.decodeArray(v);
//   } else if (v && 'object' == typeof v) {
//     return this.decodeObject(v);
//   }
//   return v;
// }

// Decoder.prototype.decodeStream = function(obj) {
//   var stream = new IOStream(obj.options);
//   stream.id = obj.$stream;
//   this.emit('stream', stream);
//   return stream;
// }

// Decoder.prototype.decodeArray = function(arr) {
//   var v = [];
//   for (var i = 0, len = arr.length; i < len; i++) {
//     v.push(this.decode(arr[i]));
//   }
//   return v;
// }

// Decoder.prototype.decodeObject = function(obj) {
//   var v = {};
//   for (var k in obj) {
//     if (obj.hasOwnProperty(k)) {
//       v[k] = this.decode(obj[k]);
//     }
//   }
//   return v;
// }
