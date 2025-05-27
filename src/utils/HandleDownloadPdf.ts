import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export async function handleDownloadPDF(
  sectionId: string,
  options: {
    title?: string;
    timestamp?: string;
    duration?: string;
  } = {}
): Promise<void> {
  console.log("PDF download started");

  const element = document.getElementById(sectionId);
  if (!element) {
    console.error(`Element with id '${sectionId}' not found.`);
    alert("Sorry, could not find the content to export.");
    return;
  }

  // Clone the element
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // --- REPLACE MATCHED SOURCES WITH TITLE LIST ONLY ---
  const matchedSourcesContainer = clonedElement.querySelector(".matched-sources-container");
  if (matchedSourcesContainer) {

    const titleElements = matchedSourcesContainer.querySelectorAll(".source-card h4 a");

    const titles = Array.from(titleElements).map(
      (el) => el.textContent?.trim() || el.getAttribute("href") || "Untitled Source"
    );

    // Replace matched sources content with a simple ul list of titles
    matchedSourcesContainer.innerHTML = `
      <h3 class="font-semibold text-lg mb-4">
        Matched Sources (${titles.length})
      </h3>
      <ul style="padding-left: 20px; list-style-type: disc; color: black;">
        ${titles.map((title) => `<li>${title}</li>`).join("")}
      </ul>
    `;
  }

  // Append footer with metadata if provided
  if (options.timestamp || options.duration) {
    const footer = document.createElement("div");
    footer.style.marginTop = "20px";
    footer.style.fontSize = "12px";
    footer.style.color = "#555";
    footer.innerHTML = `
      <p><strong>Scanned on:</strong> ${options.timestamp || "N/A"}</p>
      <p><strong>Time Taken to Scan:</strong> ${options.duration || "N/A"}</p>
    `;
    clonedElement.appendChild(footer);
  }

  clonedElement.style.position = "fixed";
  clonedElement.style.left = "-9999px";
  clonedElement.style.top = "0";
  clonedElement.style.zIndex = "-1";
  document.body.appendChild(clonedElement);

  try {
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff", // fallback for transparent Tailwind backgrounds
    });

    // Cleanup cloned element after rendering
    document.body.removeChild(clonedElement);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const filename = `${options.title || "Report"} - ${new Date().toLocaleString()}.pdf`;
    pdf.save(filename);

    alert("✅ PDF generated and downloaded successfully!");
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    alert("An error occurred while generating the PDF. Please try again.");

    if (document.body.contains(clonedElement)) {
      document.body.removeChild(clonedElement);
    }
  }
}
