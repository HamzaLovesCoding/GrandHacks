import { footer, footerRows, type Panel } from "../content";

// The status rows at the very bottom of both pages. Nothing links anywhere until it's live.
export function Foot({ open }: { open: (panel: Panel) => void }) {
  return (
    <div className="wrap foot">
      <dl>
        {footerRows.map(({ label, status, href, panel }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {panel ? (
                <button type="button" className="footLink" onClick={() => open(panel)}>
                  {status}
                </button>
              ) : href ? (
                <a href={href}>{footer.open}</a>
              ) : (
                status
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="small">{footer.line}</p>
    </div>
  );
}
