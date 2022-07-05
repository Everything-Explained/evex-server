import { Static, Type } from "@sinclair/typebox";


export const stdErrorSchema = Type.Strict(Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
}));


export type BadRequestSchema = Static<typeof stdErrorSchema>;

export const defaultResponseSchema = {
  400: stdErrorSchema,
  404: stdErrorSchema,
  403: stdErrorSchema,
  409: stdErrorSchema,
  500: stdErrorSchema,
  200: Type.String(),
  201: Type.String(),
};






