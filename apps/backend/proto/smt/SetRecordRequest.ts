// Original file: proto/smt.proto

import type { Long } from '@grpc/proto-loader';

export interface SetRecordRequest {
  'balances'?: (number | string | Long)[];
  'userName'?: (string);
}

export interface SetRecordRequest__Output {
  'balances': (string)[];
  'userName': (string);
}
