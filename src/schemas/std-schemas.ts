import { Static, Type } from "@sinclair/typebox";




export type BadRequestSchema = Static<typeof badRequestSchema['400']>;

export const badRequestSchema = {
  400: Type.Strict(Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
  }))
};

export const internalErrorSchema = {
  500: Type.Strict(Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
  }))
};

export const conflictSchema = {
  409: Type.Strict(Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
  }))
};

export const defaultResponsesSchema = {
  ...badRequestSchema,
  ...internalErrorSchema,
  ...conflictSchema,
};






