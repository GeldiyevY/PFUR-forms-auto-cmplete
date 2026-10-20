import type { KpiStageData, KpiData, KpiSubRow } from '../types/form';

function emptySubRow(): KpiSubRow {
  return { stage1: 0, stage2: 0, stage3: 0, criteria: '' };
}

export function createDefaultKpiData(): KpiData {
  const kpe = (): KpiStageData => ({ stage1: 0, stage2: 0, stage3: 0, comment: '' });
  return {
    kpe1: { rows: [emptySubRow()], comment: '' },
    kpe2: kpe(),
    kpe3: { rows: [emptySubRow()], comment: '' },
    kpe4: kpe(),
    kpe5: { rows: [emptySubRow()], comment: '' },
    kpe6: kpe(),
    kpe7: kpe(),
    kpe8: kpe(),
    kpe9: kpe(),
  };
}
