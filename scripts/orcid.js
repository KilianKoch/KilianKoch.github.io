// orcid.js

/**
 * Fetch all work summaries from ORCID public API for a given ORCID iD.
 * @param {string} orcidId - Your ORCID iD, e.g. '0000-0002-1825-0097'
 * @returns {Promise<Array<Object>>} - Array of work-summary objects
 */
export async function fetchOrcidWorks(orcidId) {
    const url = `https://pub.orcid.org/v3.0/${orcidId}/works`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ORCID works: ${response.status}`);
    }

    const data = await response.json();
    return (data.group ?? []).map(g => g['work-summary'][0]);
}

const YOUR_NAME = "Kilian Koch";

/**
 * Fetches all publications from ORCID and returns detailed, UI-ready objects.
 * @param {string} orcidId
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAndNormalizeOrcidWorks(orcidId) {
    const base = `https://pub.orcid.org/v3.0/${orcidId}`;

    // 1. Get list of all put-codes
    const res = await fetch(`${base}/works`, {
        headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error("Failed to fetch works index");
    const workList = await res.json();

    const putCodes = (workList.group ?? []).map(g => g['work-summary'][0]['put-code']);

    // 2. Fetch each work in detail
    const fetchWork = async (code) => {
        const r = await fetch(`${base}/work/${code}`, {
            headers: { Accept: 'application/json' }
        });
        if (!r.ok) return null;
        return r.json();
    };

    const detailedWorks = await Promise.all(putCodes.map(fetchWork));
    return detailedWorks
        .filter(Boolean)
        .map(pub => {
            const title = pub.title?.title?.value ?? "Untitled";

            const year = pub['publication-date']?.year?.value ?? "n/a";
            const month = pub['publication-date']?.month?.value ?? "";
            const day = pub['publication-date']?.day?.value ?? "";
            const date = [year, month, day].filter(Boolean).join("-");

            const type = pub.type ?? "other";


            const abstract = pub['short-description'] ?? null;

            const doi = pub['external-ids']?.['external-id']
                ?.find(id => id['external-id-type'] === 'doi')?.['external-id-value'] ?? null;

            const isArxiv = doi?.toLowerCase().startsWith("10.48550/arxiv.");
            const journal = isArxiv ? "arXiv Preprint" :
                pub['journal-title']?.value ??
                (type === "preprint" ? "Preprint" : "Unknown");

            const link = pub['external-ids']?.['external-id']
                ?.find(id => id['external-id-url']?.value)?.['external-id-url'].value
                ?? pub.url?.value ?? "#";

            const authors = pub.contributors?.contributor?.map(c =>
                c['credit-name']?.value || c['contributor-orcid']?.path || "Unnamed"
            ) ?? [];

            const youAreAuthor = authors.includes(YOUR_NAME);

            return {
                title,
                authors,
                youAreAuthor,
                highlightName: YOUR_NAME,
                abstract,
                date,
                journal,
                type,
                doi,
                link
            };
        });
}

