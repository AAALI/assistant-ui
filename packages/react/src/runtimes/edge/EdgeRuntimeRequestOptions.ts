import {
  LanguageModelConfigSchema,
  LanguageModelV1CallSettingsSchema,
} from "../../types/ModelConfigTypes";
import { z } from "zod";

const LanguageModelV1FunctionToolSchema = z.object({
  type: z.literal("function"),
  name: z.string(),
  description: z.string().optional(),
  parameters: z.record(z.unknown()),
});

const TextContentPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const ImageContentPartSchema = z.object({
  type: z.literal("image"),
  image: z.string(),
});

const CoreToolCallContentPartSchema = z.object({
  type: z.literal("tool-call"),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.record(z.unknown()),
  result: z.unknown().optional(),
  isError: z.boolean().optional(),
});
// args is required but unknown;

const CoreUserMessageSchema = z.object({
  role: z.literal("user"),
  content: z
    .array(
      z.discriminatedUnion("type", [
        TextContentPartSchema,
        ImageContentPartSchema,
      ]),
    )
    .min(1),
});

const CoreAssistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z
    .array(
      z.discriminatedUnion("type", [
        TextContentPartSchema,
        CoreToolCallContentPartSchema,
      ]),
    )
    .min(1),
});

const CoreSystemMessageSchema = z.object({
  role: z.literal("system"),
  content: z.tuple([TextContentPartSchema]),
});

const CoreMessageSchema = z.discriminatedUnion("role", [
  CoreSystemMessageSchema,
  CoreUserMessageSchema,
  CoreAssistantMessageSchema,
]);

export const EdgeRuntimeRequestOptionsSchema = z
  .object({
    system: z.string().optional(),
    messages: z.array(CoreMessageSchema).min(1),
    tools: z.array(LanguageModelV1FunctionToolSchema),
  })
  .merge(LanguageModelV1CallSettingsSchema)
  .merge(LanguageModelConfigSchema);

export type EdgeRuntimeRequestOptions = z.infer<
  typeof EdgeRuntimeRequestOptionsSchema
>;
