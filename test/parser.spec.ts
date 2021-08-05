import { createStream, IOStream } from '../';
import { Decoder, Encoder } from '../lib/parser';
import { AnyOf, ObjectOf } from '../lib/types';

describe('parser', function() {
  it('should encode/decode a stream', function() {
    var encoder = new Encoder();
    var decoder = new Decoder();
    var stream = createStream();
    var result = decoder.decode(encoder.encode(stream));
    expect(result).toBeInstanceOf(IOStream);
    expect(result).not.toBeInstanceOf(stream);
  });

  it('should keep stream options', function() {
    var encoder = new Encoder();
    var decoder = new Decoder();
    var stream = createStream({ highWaterMark: 10, objectMode: true, allowHalfOpen: true })
    var result = decoder.decode(encoder.encode(stream)) as IOStream;
    expect(result.options).toEqual({ highWaterMark: 10, objectMode: true, allowHalfOpen: true });
  });

  it('should encode/decode every streams', function() {
    var encoder = new Encoder();
    var decoder = new Decoder();
    var result = decoder.decode(encoder.encode([
      createStream() as unknown as ObjectOf<IOStream>,
      { foo: createStream() }
    ]));
    expect((result as IOStream[])[0]).toBeInstanceOf(IOStream);
    expect((result as ObjectOf<IOStream>[])[1].foo).toBeInstanceOf(IOStream);
  });

  it('should keep non-stream values', function() {
    var encoder = new Encoder();
    var decoder = new Decoder();
    var result = decoder.decode(encoder.encode([1, 'foo', { foo: 'bar' }, null, undefined] as any));
    expect(result).toEqual([1, 'foo', { foo: 'bar' }, null, undefined]);
  });

  describe('Encoder', function() {
    it('should fire stream event', function(done) {
      var encoder = new Encoder();
      var stream = createStream();
      encoder.on('stream', function(s: IOStream) {
        expect(s).toEqual(stream);
        done();
      });
      encoder.encode(stream);
    });
  });

  describe('Decoder', function() {
    it('should fire stream event', function() {
      var encoder = new Encoder();
      var decoder = new Decoder();
      var stream;
      decoder.on('stream', function(s) {
        stream = s;
      });
      var decoded = decoder.decode(encoder.encode(createStream()));
      expect(stream).toEqual(decoded);
    });
  });
});
