import { useCallback } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import type { FormData, TeamMember, ExpenseItem, ExpenseCategoryType } from '../types/form';

interface GenerateInput {
  templateBuffer: Uint8Array;
  formData: FormData;
  teamMembers: TeamMember[];
  expenseItems: Record<ExpenseCategoryType, ExpenseItem[]>;
  budgetYear1Total: number;
  budgetYear2Total: number;
  budgetYear3Total: number;
  budgetGrandTotal: number;
  teamTotalSalary: number;
  horizon: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}г.`;
}

export function useDocumentGenerator() {
  const generate = useCallback(
    async ({
      templateBuffer,
      formData,
      teamMembers,
      expenseItems,
      budgetYear1Total,
      budgetYear2Total,
      budgetYear3Total,
      budgetGrandTotal,
      teamTotalSalary,
      horizon,
    }: GenerateInput): Promise<void> => {
      const payload: Record<string, string | number | Record<string, string | number>[]> = {};

      for (const [key, value] of Object.entries(formData)) {
        payload[key] = value;
      }

      payload['date'] = formatDate(payload['date'] as string);

      if (horizon >= 3) {
        payload['f4_7_3'] = budgetYear3Total.toFixed(1);
      }

      payload['f4_7_1'] = budgetYear1Total.toFixed(1);
      payload['f4_7_2'] = budgetYear2Total.toFixed(1);
      payload['f4_7_4'] = budgetGrandTotal.toFixed(1);
      payload['f4_sum'] = teamTotalSalary.toFixed(1);

      const teamArray: Record<string, string | number>[] = [];
      for (const [idx, member] of teamMembers.entries()) {
        const n = idx + 1;
        const mName =
          n === 1
            ? (formData.head_of_project || 'Руководитель проекта') + ', руководитель проекта, 1.0 ставки'
            : member.name;
        teamArray.push({ number: n, name: mName, salary: member.salary.toFixed(1) });
        payload[`student_${n}`] = mName;
        payload[`salary_${n}`] = member.salary.toFixed(1);
      }
      payload['team_members'] = teamArray;
      payload['team_count'] = teamArray.length;

      if (teamArray.length > 0) {
        const last = teamArray[teamArray.length - 1];
        payload['student_n'] = last.name;
        payload['salary_n'] = last.salary;
        payload['n'] = last.number;
      } else {
        payload['student_n'] = '';
        payload['salary_n'] = '0';
        payload['n'] = '1';
      }

      for (let i = teamArray.length + 1; i <= 10; i++) {
        payload[`student_${i}`] = '';
        payload[`salary_${i}`] = '0';
      }

      const catConfig: { type: ExpenseCategoryType; prefix: string }[] = [
        { type: 'equipment', prefix: 'eq' },
        { type: 'travel', prefix: 'tr' },
        { type: 'services', prefix: 'sv' },
        { type: 'other', prefix: 'ot' },
      ];

      for (const { type, prefix } of catConfig) {
        const items = expenseItems[type];
        const itemsArray: Record<string, string | number>[] = [];
        let totalQty = 0;
        let totalSum = 0;

        for (const [idx, item] of items.entries()) {
          const n = idx + 1;
          const sum = (item.quantity || 0) * (item.price || 0);
          itemsArray.push({
            [`${prefix}_number`]: n,
            [`${prefix}_name`]: item.name,
            [`${prefix}_quantity`]: (item.quantity || 0).toString(),
            [`${prefix}_price`]: (item.price || 0).toFixed(1),
            [`${prefix}_sum`]: sum.toFixed(1),
          });
          payload[`${prefix}_${n}_name`] = item.name;
          payload[`${prefix}_${n}_quantity`] = (item.quantity || 0).toString();
          payload[`${prefix}_${n}_price`] = (item.price || 0).toFixed(1);
          payload[`${prefix}_${n}_sum`] = sum.toFixed(1);
          totalQty += item.quantity || 0;
          totalSum += sum;
        }

        payload[`${type}_items`] = itemsArray;
        payload[`${prefix}_total_quantity`] = totalQty.toString();
        payload[`${prefix}_total_sum`] = totalSum.toFixed(1);
        const avg = totalQty > 0 ? totalSum / totalQty : 0;
        payload[`${prefix}_total_price`] = avg.toFixed(1);

        for (let i = items.length + 1; i <= 10; i++) {
          payload[`${prefix}_${i}_name`] = '';
          payload[`${prefix}_${i}_quantity`] = '0';
          payload[`${prefix}_${i}_price`] = '0.0';
          payload[`${prefix}_${i}_sum`] = '0.0';
        }

        payload[`${prefix}_total_quantity`] = totalQty.toString();
        payload[`${prefix}_total_sum`] = totalSum.toFixed(1);
        const avgP = totalQty > 0 ? totalSum / totalQty : 0;
        payload[`${prefix}_total_price`] = avgP.toFixed(1);
      }

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

      const filename = `Заявка ${formData.project_name}.docx`;
      saveAs(output, filename);
    },
    [],
  );

  return { generate };
}
