// Original file: proto/smt.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Proof as _smt_Proof, Proof__Output as _smt_Proof__Output } from '../smt/Proof';
import type { RequestProof as _smt_RequestProof, RequestProof__Output as _smt_RequestProof__Output } from '../smt/RequestProof';
import type { Response as _smt_Response, Response__Output as _smt_Response__Output } from '../smt/Response';
import type { SetRecordRequest as _smt_SetRecordRequest, SetRecordRequest__Output as _smt_SetRecordRequest__Output } from '../smt/SetRecordRequest';

export interface SMTBackendClient extends grpc.Client {
  GenerateProof(argument: _smt_RequestProof, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  GenerateProof(argument: _smt_RequestProof, metadata: grpc.Metadata, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  GenerateProof(argument: _smt_RequestProof, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  GenerateProof(argument: _smt_RequestProof, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  generateProof(argument: _smt_RequestProof, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  generateProof(argument: _smt_RequestProof, metadata: grpc.Metadata, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  generateProof(argument: _smt_RequestProof, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  generateProof(argument: _smt_RequestProof, callback: grpc.requestCallback<_smt_Proof__Output>): grpc.ClientUnaryCall;
  
  SetUserData(argument: _smt_SetRecordRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  SetUserData(argument: _smt_SetRecordRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  SetUserData(argument: _smt_SetRecordRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  SetUserData(argument: _smt_SetRecordRequest, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  setUserData(argument: _smt_SetRecordRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  setUserData(argument: _smt_SetRecordRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  setUserData(argument: _smt_SetRecordRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  setUserData(argument: _smt_SetRecordRequest, callback: grpc.requestCallback<_smt_Response__Output>): grpc.ClientUnaryCall;
  
}

export interface SMTBackendHandlers extends grpc.UntypedServiceImplementation {
  GenerateProof: grpc.handleUnaryCall<_smt_RequestProof__Output, _smt_Proof>;
  
  SetUserData: grpc.handleUnaryCall<_smt_SetRecordRequest__Output, _smt_Response>;
  
}

export interface SMTBackendDefinition extends grpc.ServiceDefinition {
  GenerateProof: MethodDefinition<_smt_RequestProof, _smt_Proof, _smt_RequestProof__Output, _smt_Proof__Output>
  SetUserData: MethodDefinition<_smt_SetRecordRequest, _smt_Response, _smt_SetRecordRequest__Output, _smt_Response__Output>
}
