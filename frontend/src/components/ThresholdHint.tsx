import { rangeHint, violationMessage, isEmptyValue, type RangeInfo } from "../utils/thresholds";

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

interface ThresholdHintProps {
  value: number | string;
  range?: RangeInfo;
}

export default function ThresholdHint({ value, range }: ThresholdHintProps) {
  if (!range) return null;

  if (isEmptyValue(value)) {
    const parts: string[] = [];
    const hint = rangeHint(range);
    if (hint) parts.push(hint);
    if (range.percentMax) {
      parts.push(`≤ ${Math.round(range.percentMax.percent * 100)}%: ${formatNum(range.percentMax.maxValue)}`);
    }
    if (parts.length === 0) return null;
    return <div className="threshold-range">{parts.join("; ")}</div>;
  }

  const msgs: string[] = [];
  const vmsg = violationMessage(Number(value), range);
  if (vmsg) msgs.push(vmsg);
  if (range.percentMax && Number(value) > range.percentMax.maxValue) {
    msgs.push(
      `Значение выше ${Math.round(range.percentMax.percent * 100)}% от общей суммы (${formatNum(range.percentMax.maxValue)})`,
    );
  }
  if (msgs.length === 0) return null;
  return <div className="threshold-violation">{msgs.join("; ")}</div>;
}
