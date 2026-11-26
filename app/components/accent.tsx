// A heading with one word in the accent serif. Parts are [before, accent word, after].
export function Accent({ parts }: { parts: readonly string[] }) {
  const [before, word, after = ""] = parts;
  return (
    <>
      {before}
      <i className="accent">{word}</i>
      {after}
    </>
  );
}
