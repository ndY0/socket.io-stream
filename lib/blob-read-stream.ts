import { Readable, ReadableOptions } from "stream";


export class BlobReadStream extends Readable {
  private slice: typeof Blob.prototype.slice;
  private start: number = 0;
  private fileReader
  constructor(private blob: Blob, options: ReadableOptions & {synchronous?: boolean}) {
    super(options);
    this.slice = this.slice = blob.slice || (blob as any).webkitSlice || (blob as any).mozSlice;
    this.fileReader = new FileReader();
    this.fileReader.onload = this._onload.bind(this);
    this.fileReader.onerror = this._onerror.bind(this);
  }
  public _read(size: number) {
    const start = this.start;
    const end = this.start = this.start + size;
    var chunk = this.slice.call(this.blob, start, end);

    if (chunk.size) {
        this.fileReader.readAsArrayBuffer(chunk);
    } else {
      this.push(null);
    }
  }
  public _onload(event: any) {
    var chunk = Buffer.from(new Uint8Array(event.target.result));
    this.push(chunk);
  }
  public _onerror(event: any) {
    this.emit('error', event.target.error);
  }
}

// module.exports = BlobReadStream;

// util.inherits(BlobReadStream, Readable);

/**
 * Readable stream for Blob and File on browser.
 *
 * @param {Object} options
 * @api private
 */
// function BlobReadStream(blob, options) {
//   if (!(this instanceof BlobReadStream)) {
//     return new BlobReadStream(blob, options);
//   }

  // Readable.call(this, options);

  // options = options || {};
  // this.blob = blob;
  // this.slice = blob.slice || blob.webkitSlice || blob.mozSlice;
  // this.start = 0;
  // this.sync = options.synchronous || false;

  // var fileReader;

  // if (options.synchronous) {
  //   fileReader = this.fileReader = new FileReaderSync();
  // } else {
  //   fileReader = this.fileReader = new FileReader();
  // }

//   fileReader.onload = bind(this, '_onload');
//   fileReader.onerror = bind(this, '_onerror');
// }

// BlobReadStream.prototype._read = function(size) {
//   var start = this.start;
//   var end = this.start = this.start + size;
//   var chunk = this.slice.call(this.blob, start, end);

//   if (chunk.size) {
//     if (this.sync) {
//       var bufferChunk = new Buffer(new Uint8Array(this.fileReader.readAsArrayBuffer(chunk)));
//       this.push(bufferChunk);
//     } else {
//       this.fileReader.readAsArrayBuffer(chunk);
//     }
//   } else {
//     this.push(null);
//   }
// }

// BlobReadStream.prototype._onload = function(e) {
//   var chunk = new Buffer(new Uint8Array(e.target.result));
//   this.push(chunk);
// };

BlobReadStream.prototype._onerror = function(e) {
  var err = e.target.error;
  this.emit('error', err);
};

