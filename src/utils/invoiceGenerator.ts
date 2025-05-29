import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceData {
  id: string;
  date: string;
  patientName: string;
  doctorName: string;
  method: string;
  time: string;
  price: number;
  status: string;
}

export const generateInvoicePDF = (appointmentData: InvoiceData) => {
  // Create new jsPDF instance
  const doc = new jsPDF();

  // Initialize autoTable
  const tablePlugin = autoTable as unknown as typeof doc.autoTable;

  // Add header
  doc.setFontSize(20);
  doc.text("SERENITY", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Invoice Konsultasi", 105, 30, { align: "center" });

  // Add invoice details
  doc.setFontSize(10);
  doc.text(`No. Invoice: INV-${appointmentData.id}`, 20, 50);
  doc.text(
    `Tanggal: ${new Date(appointmentData.date).toLocaleDateString("id-ID")}`,
    20,
    60
  );

  // Add line
  doc.line(20, 70, 190, 70);

  // Add patient and doctor details
  doc.text("Detail Konsultasi:", 20, 80);
  doc.text(`Nama Pasien: ${appointmentData.patientName}`, 20, 90);
  doc.text(`Nama Dokter: ${appointmentData.doctorName}`, 20, 100);
  doc.text(`Metode: ${appointmentData.method}`, 20, 110);
  doc.text(`Waktu: ${appointmentData.time}`, 20, 120);

  // Add payment details using autoTable
  tablePlugin(doc, {
    startY: 150,
    head: [["Deskripsi", "Jumlah"]],
    body: [
      [
        "Biaya Konsultasi",
        `Rp${appointmentData.price.toLocaleString("id-ID")}`,
      ],
      ["Total", `Rp${appointmentData.price.toLocaleString("id-ID")}`],
    ],
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [24, 125, 168] },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Add footer
  doc.text("Status Pembayaran:", 20, finalY);
  doc.setTextColor(0, 150, 0);
  doc.text(appointmentData.status, 20, finalY + 10);

  // Add thank you note
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Terima kasih telah menggunakan layanan Serenity",
    105,
    finalY + 30,
    { align: "center" }
  );

  return doc;
};
