import { can } from "../auth/permissions";
import type { CreateArticleInput } from '../types';
import type { AuthCtx } from '../auth/context';
import * as Articles from "./articles";

export async function create(ctx: AuthCtx, input: CreateArticleInput) {
  if (!can(ctx.roles,"article:create")) {
    throw new Error("Forbidden");
  }
  return Articles.createArticle(input);
}