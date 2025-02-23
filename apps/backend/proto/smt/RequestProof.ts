// Original file: proto/smt.proto


export interface RequestProof {
  'userEmail'?: (string);
  'fetchRoot'?: (boolean);
  'fetchUserNode'?: (boolean);
  '_fetchRoot'?: "fetchRoot";
  '_fetchUserNode'?: "fetchUserNode";
}

export interface RequestProof__Output {
  'userEmail': (string);
  'fetchRoot'?: (boolean);
  'fetchUserNode'?: (boolean);
  '_fetchRoot': "fetchRoot";
  '_fetchUserNode': "fetchUserNode";
}
