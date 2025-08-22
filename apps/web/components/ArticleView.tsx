export default function ArticleView({ html, title, date, coverUrl }: { html: string, title: string, date?: string | Date | null, coverUrl?: string | null }) {
  return (
    <article>
      <h1>{title}</h1>
      {date ? <small>Pubblicato il {new Date(date).toLocaleDateString("it-IT")}</small> : null}
      {coverUrl ? <img src={coverUrl} alt="" style={{maxWidth:'100%', borderRadius:12, marginTop:12}}/> : null}
      <div style={{marginTop:16}} dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
