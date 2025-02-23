import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { SMTBackendClient as _smt_SMTBackendClient, SMTBackendDefinition as _smt_SMTBackendDefinition } from './smt/SMTBackend';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  smt: {
    NodeContent: MessageTypeDefinition
    Proof: MessageTypeDefinition
    RequestProof: MessageTypeDefinition
    Response: MessageTypeDefinition
    SMTBackend: SubtypeConstructor<typeof grpc.Client, _smt_SMTBackendClient> & { service: _smt_SMTBackendDefinition }
    SetRecordRequest: MessageTypeDefinition
  }
}

