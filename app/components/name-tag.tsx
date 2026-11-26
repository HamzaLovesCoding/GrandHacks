import { cleanName, tag, type Story, type Tell } from "../content";
import { Mark } from "./pixel";

let ruler: CanvasRenderingContext2D | null | undefined;

// Names run the full width of the tag, so short ones are huge and long ones step down.
function fit(name: string) {
  // the empty state is fixed, so the server and browser agree on it
  if (!name) return 0.4;
  ruler ??= document.createElement("canvas").getContext("2d");
  if (!ruler) return 0.4;
  ruler.font = "700 100px DM, Arial, sans-serif";
  return Math.min(1, 280 / ruler.measureText(name.toUpperCase()).width);
}

export function NameTag({ id, story, tell }: { id: string; story: Story; tell: Tell }) {
  return (
    <div className="tag">
      <div className="tagTop" aria-hidden="true">
        <span className="tagSlot" />
        <Mark className="tagLogo" />
        <strong className="tagMark">{tag.mark}</strong>
      </div>
      <div className="tagBody">
        <label className="srOnly" htmlFor={id}>
          {tag.label}
        </label>
        {/* No form and no name attribute, so a stray Enter can't put it in the URL. */}
        <input
          id={id}
          value={story.name}
          onChange={(e) => tell({ name: cleanName(e.target.value) })}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          style={{ "--fit": fit(story.name).toFixed(3) } as React.CSSProperties}
          placeholder={tag.placeholder}
          maxLength={14}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="done"
          data-1p-ignore
          data-lpignore="true"
        />
        <p className="tagRole">{tag.role}</p>
        <p className="tagWhen">
          <span>{tag.when}</span>
          <span>{tag.where}</span>
        </p>
      </div>
      <p className="tagStrip">{tag.notTicket}</p>
    </div>
  );
}
