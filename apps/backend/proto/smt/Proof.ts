// Original file: proto/smt.proto

import type { NodeContent as _smt_NodeContent, NodeContent__Output as _smt_NodeContent__Output } from '../smt/NodeContent';

export interface Proof {
  'path'?: (_smt_NodeContent)[];
  'lefts'?: (boolean)[];
  'root'?: (_smt_NodeContent | null);
  'userNode'?: (_smt_NodeContent | null);
  'forUser'?: (string);
  'masterSalt'?: (Buffer | Uint8Array | string);
  '_root'?: "root";
  '_userNode'?: "userNode";
}

export interface Proof__Output {
  'path': (_smt_NodeContent__Output)[];
  'lefts': (boolean)[];
  'root'?: (_smt_NodeContent__Output | null);
  'userNode'?: (_smt_NodeContent__Output | null);
  'forUser': (string);
  'masterSalt': (Buffer);
  '_root': "root";
  '_userNode': "userNode";
}
