export type TenantScoped = { tenantId: string };

export type ListParams = TenantScoped & {
  status?: ("draft" | "scheduled" | "published" | "archived")[];
  tagSlug?: string;
  locale?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type CreateArticleInput = TenantScoped & {
  title: string;
  slug: string;
  locale?: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  authorId?: string;
  coverMediaId?: string;
  status?: "draft" | "scheduled" | "published";
  publishedAt?: Date | string | null;
  tags?: string[];
};

export type UpdateArticleInput = Partial<CreateArticleInput> & TenantScoped & { id: string };
