export async function handler() {
  const ORCID = "0000-0003-1676-5801";
  const LAST = "Lucas"; // change if PI's last name is different

  const term = `${LAST}[Author] AND ${ORCID}[Identifier]`;
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(term)}`;

  const searchRes = await fetch(searchUrl).then(r => r.json());
  const ids = (searchRes.esearchresult?.idlist || []).join(",");

  if (!ids) {
    return {
      statusCode: 200,
      body: JSON.stringify([])
    };
  }

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids}`;
  const data = await fetch(fetchUrl).then(r => r.json());

  const pubs = Object.values(data.result)
    .filter(x => x.uid)
    .map(p => ({
      title: p.title,
      journal: p.fulljournalname,
      year: p.pubdate,
      doi: p.elocationid || "",
      url: `https://pubmed.ncbi.nlm.nih.gov/${p.uid}/`
    }));

  return {
    statusCode: 200,
    headers: {
      "Cache-Control": "public, max-age=3600"
    },
    body: JSON.stringify(pubs)
  };
}