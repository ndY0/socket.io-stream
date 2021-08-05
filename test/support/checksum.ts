import {createHash, Encoding, Hash} from "crypto";
import { DuplexOptions, PassThrough } from "stream";


export default class Checksum extends PassThrough {
  private hash: Hash = createHash('sha1');
  constructor(options: DuplexOptions) {
    super(options);
    this.resume();
  }
  public _write(chunk: any, encoding: Encoding, callback: Function) {
    this.hash.update(chunk, );
    super._write.call(this, chunk, encoding, callback);
  }
  public digest() {
    return this.hash.digest('hex');
  }
}