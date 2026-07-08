'use client';

import DiaryLine, { DiaryLineData } from './DiaryLine';

type DiaryLineListProps = {
  lines: DiaryLineData[];
  focusLineId: string | null;
  onChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onEnter: (id: string) => void;
};

export default function DiaryLineList({
  lines,
  focusLineId,
  onChange,
  onDelete,
  onEnter,
}: DiaryLineListProps) {
  return (
    <div>
      {lines.map((line) => (
        <DiaryLine
          key={line.id}
          line={line}
          showDelete={lines.length > 1}
          autoFocus={line.id === focusLineId}
          onChange={onChange}
          onDelete={onDelete}
          onEnter={onEnter}
        />
      ))}
    </div>
  );
}
