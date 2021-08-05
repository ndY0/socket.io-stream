import { IOStream } from "./iostream";
import { Socket as IOSocket } from "socket.io-client"
import { Socket } from "./socket";
import { DuplexOptions, ReadableOptions } from "stream";
import { BlobReadStream } from "./blob-read-stream";

/**
 * Forces base 64 encoding when emitting. Must be set to true for Socket.IO v0.9 or lower.
 *
 * @api public
 */
const forceBase64 = false;

/**
 * Look up an existing Socket.
 *
 * @param {socket.io#Socket} socket.io
 * @param {Object} options
 * @return {Socket} Socket instance
 * @api public
 */
function lookup(sio: IOSocket, options: {forceBase64?: boolean} = {}) {
  options = options || {};
  if (null == options.forceBase64) {
    options.forceBase64 = exports.forceBase64;
  }

  if (!(sio as any)._streamSocket) {
    (sio as any)._streamSocket = new Socket(sio, options);
  }
  return (sio as any)._streamSocket;
}

/**
 * Creates a new duplex stream.
 *
 * @param {Object} options
 * @return {IOStream} duplex stream
 * @api public
 */
const createStream = function(options?: DuplexOptions) {
  return new IOStream(options);
};

/**
 * Creates a new readable stream for Blob/File on browser.
 *
 * @param {Blob} blob
 * @param {Object} options
 * @return {BlobReadStream} stream
 * @api public
 */
const createBlobReadStream = function(blob: Blob, options?: ReadableOptions & {synchronous?: boolean}) {
  return new BlobReadStream(blob, options);
};

export default lookup;
export { createBlobReadStream, forceBase64, Socket, IOStream, Buffer, createStream }