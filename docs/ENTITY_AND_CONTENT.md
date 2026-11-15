# Entity graph and editorial controls

| Type | Canonical @id | Official URL |
|---|---|---|
| Person | `https://msihu.com/#person` | `https://msihu.com/` |
| Organization | `https://actaroot.com/#organization` | `https://actaroot.com/` |
| Brand | `https://actaroot.com/#brand-ohwut` | `https://ohwut.com/` |

The ActaRoot Organization has `founder` referencing Min Sihu Person and `brand` referencing OHWUT Brand. The Person `affiliation` references ActaRoot. Distinct types never share identifiers. `sameAs` for the Person points to the secondary profile `min.tienda`, not to a company or brand. A site-specific WebSite and WebPage/ProfilePage is added per URL.

The official company source is actaroot.com, the primary person source msihu.com, min.tienda is a separate, shorter same-person profile, and the actual shopping/service source is ohwut.com. Each indexable page has self-referential canonical and unique visible content. The secondary profile is not a duplicate of msihu.com.

Facts are limited to user-provided public role descriptions and recorded company/project context. `OHWUT CEO` is described as a self-description rather than a verified officer filing. There are no invented addresses, employee counts, investors, partners, users or sales. The visible age 13 is time-sensitive and requires manual updates. Full birth date, school, street-level location and personal phone are omitted. No unverified SNS URLs are supplied.

To add a real page: edit `content/sites.json` and add a unique page, title, description, visible sections and any true links. Run `npm run check` and commit regenerated `sites/` outputs. Only then submit updated sitemaps. No fake article, interview, FAQ, award or announcement pages are generated.

Future content slots: company updates, history, interviews, press mentions, brand developments and Korean translations. Implement an actual translated URL first; only then add reciprocal `hreflang`. Add actual logo/social images only once verified and visible.
