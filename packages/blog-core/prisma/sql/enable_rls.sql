ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Author" ENABLE ROW LEVEL SECURITY;

CREATE POLICY article_tenant_isolation ON "Article"
  USING (tenantId::text = current_setting('app.tenant_id', true));
CREATE POLICY tag_tenant_isolation ON "Tag"
  USING (tenantId::text = current_setting('app.tenant_id', true));
CREATE POLICY media_tenant_isolation ON "MediaAsset"
  USING (tenantId::text = current_setting('app.tenant_id', true));
CREATE POLICY author_tenant_isolation ON "Author"
  USING (tenantId::text = current_setting('app.tenant_id', true));

CREATE POLICY article_insert_tenant ON "Article" FOR INSERT
  WITH CHECK (tenantId::text = current_setting('app.tenant_id', true));
