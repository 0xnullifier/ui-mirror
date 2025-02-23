// Original file: proto/smt.proto


export interface NodeContent {
  'commitment'?: (Buffer | Uint8Array | string);
  'hash'?: (Buffer | Uint8Array | string);
}

export interface NodeContent__Output {
  'commitment': (Buffer);
  'hash': (Buffer);
}
