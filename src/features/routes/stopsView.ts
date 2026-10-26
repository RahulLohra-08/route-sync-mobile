// Pure rule for which stops a collapsed route list shows (unit-tested).
export const COLLAPSED_EDGE = 2;

/**
 * Collapsed: first 2 + last 2 + the selected stop (so a selection is never hidden).
 * Expanded / short routes / collapsible=false: everything.
 */
export function visibleStopIndexes(
  ids: string[],
  selectedId: string | null | undefined,
  expanded: boolean,
  collapsible = true,
): number[] {
  const last = ids.length - 1;
  const canCollapse = collapsible && ids.length > COLLAPSED_EDGE * 2 + 1;
  return ids
    .map((id, i) => ({ id, i }))
    .filter(({ id, i }) => !canCollapse || expanded || i < COLLAPSED_EDGE || i > last - COLLAPSED_EDGE || id === selectedId)
    .map(({ i }) => i);
}
