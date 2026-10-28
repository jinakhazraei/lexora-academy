import { Fragment, type ReactNode } from "react";

/**
 * Like fmt(), but placeholders can be React elements — for links inside a translated
 * sentence, where word order differs between languages:
 *   rich("I've read the {policy} and agree…", { policy: <Link …>Privacy Policy</Link> })
 */
export function rich(template: string, parts: Record<string, ReactNode>): ReactNode {
  const pieces = template.split(/(\{\w+\})/g);
  return pieces.map((piece, i) => {
    const m = piece.match(/^\{(\w+)\}$/);
    return <Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : piece}</Fragment>;
  });
}
