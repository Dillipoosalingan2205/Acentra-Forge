import { TimelineTask, PatientSummary } from '../types/aegis';

export function generateICSFile(tasks: TimelineTask[], patientSummary?: PatientSummary): string {
  const patientName = patientSummary?.patient_name || 'Patient';
  const now = new Date();
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aegis Care//Post-Discharge Coordinator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Aegis Recovery Plan - ${patientName}`,
  ];

  tasks.forEach((task, index) => {
    const startDate = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const summary = `[Aegis ${task.category.toUpperCase()}] ${task.simplified_text_en}`;
    const description = `Original clinical order: ${task.original_text}\\n\\nLanguage instructions: ${task.simplified_text_lang}\\n\\nStatus: ${task.status}`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:aegis-task-${task.task_id}-${startDate.getTime()}@aegiscare.health`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `STATUS:${task.status === 'Completed' ? 'COMPLETED' : 'CONFIRMED'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${task.simplified_text_en}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadICSFile(tasks: TimelineTask[], patientSummary?: PatientSummary) {
  const content = generateICSFile(tasks, patientSummary);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Aegis_Recovery_Schedule_${(patientSummary?.patient_name || 'Plan').replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
