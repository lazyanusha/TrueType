import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Downloads the current result section as PDF.
 * @param {string} elementId - The ID of the HTML element to capture.
 * @param {object} metadata - Metadata like title, timestamp, duration.
 */
export const handleDownloadPDF = async (elementId: string, metadata: {
  title: string;
  timestamp: string;
  duration: string;
}) => {
  const input = document.getElementById(elementId);

  if (!input) return;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Add report metadata
  pdf.setFontSize(12);
  pdf.text(`📄 ${metadata.title}`, 10, 10);
  pdf.text(`🕒 Time Taken: ${metadata.duration}`, 10, 16);
  pdf.text(`📅 Generated: ${metadata.timestamp}`, 10, 22);

  // Add image of result section
  pdf.addImage(imgData, "PNG", 10, 30, pdfWidth - 20, pdfHeight);

  pdf.save(`Plagiarism_Report_${new Date().toISOString()}.pdf`);

};
