/** Texto de relleno del diseño. Reemplázalo por el copy real de cada vista. */
export const LOREM_3 = [
  "Lorem ipsum dolor sit amet, consectetur",
  "adipiscing elit,sed do  eiusmod tempor",
  "incididunt ut labore et dolore magna aliqua.",
];

export const LOREM_9 = [
  ...LOREM_3,
  "Quis ipsum suspendisse ultrices gravida.",
  "Risus commodo viverra maecenas accumsan",
  "lacus.Lorem ipsum dolor sit amet, consectetur",
  "adipiscing elit,sed do  eiusmod tempor",
  "incididunt ut labore et dolore magna aliqua.",
  "Quis ipsum suspendisse ultrices gravida.",
];

export const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

/** Párrafo en líneas fijas (escritorio) que fluye normal en móvil. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>{line} </span>
      ))}
    </>
  );
}
