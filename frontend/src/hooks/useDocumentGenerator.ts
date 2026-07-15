import { useCallback } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

interface GenerateInput {
  templateBuffer: Uint8Array;
  payload: Record<string, unknown>;
  templateName: string;
}

export function useDocumentGenerator() {
  const generate = useCallback(
    async ({ templateBuffer, payload, templateName: _templateName }: GenerateInput): Promise<void> => {
      const zip = new PizZip(templateBuffer);
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
