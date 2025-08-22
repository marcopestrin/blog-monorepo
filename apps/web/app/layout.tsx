import "./globals.css";
import TenantBadge from "./TenantBadge";
import QuillStyles from "../components/QuillStyles";

export const metadata = {
  title: "Blog",
  description: "Demo modulo blog multi-tenant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <QuillStyles />

        <nav
          style={{
            padding: "12px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/blog">Blog</a>
            <span>•</span>
            <a href="/admin">Admin</a>
            <span>•</span>
            <a href="/admin/authors/new">Autori</a>
          </div>
          <TenantBadge />
        </nav>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}
