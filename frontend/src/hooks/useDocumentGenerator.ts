import { useCallback } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { mergeDocxBuffers } from '../utils/mergeDocx';

interface GenerateInput {
  templateBuffers: Uint8Array[];
  payload: Record<string, unknown>;
  templateName: string | null;
}

export function useDocumentGenerator() {
  const generate = useCallback(
    async ({ templateBuffers, payload, templateName: _templateName }: GenerateInput): Promise<void> => {
      const merged = mergeDocxBuffers(templateBuffers);
      const zip = new PizZip(merged);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.setData(payload);
      doc.render();

      const output = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const baseName = (payload['project_name'] as string) || 'заявка';
      const filename = `Заявка ${baseName}.docx`;
      saveAs(output, filename);
    },
    [],
  );

  return { generate };
}
