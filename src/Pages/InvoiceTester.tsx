import React, { useState } from "react";

const InvoiceTester = () => {
  // State untuk form pembuatan invoice
  const [amount, setAmount] = useState("50000");
  const [customerName, setCustomerName] = useState("Budi Santoso");
  const [customerEmail, setCustomerEmail] = useState(
    "budi.santoso@example.com"
  );

  // State untuk hasil dari API
  const [invoiceResult, setInvoiceResult] = useState<{
    url: string;
    id: string;
  } | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<any | null>(null);
  const [statusId, setStatusId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInvoiceResult(null);

    try {
      const response = await fetch("/api/invoice/create", {
        // Mengarah ke backend Anda
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `INV-${Date.now()}`,
          amount: parseInt(amount, 10),
          customerFirstName: customerName,
          customerEmail: customerEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setInvoiceResult({ url: data.invoice_url, id: data.id });
      setStatusId(data.id); // Otomatis isi ID untuk pengecekan status
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusId) {
      setError("Please provide an Invoice ID.");
      return;
    }
    setLoading(true);
    setError("");
    setInvoiceStatus(null);
    try {
      const response = await fetch(`/api/invoice/status/${statusId}`); // Mengarah ke backend Anda
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setInvoiceStatus(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <h1>Midtrans Invoice API Tester</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* --- BAGIAN CREATE INVOICE --- */}
      <section
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        <h2>1. Create Invoice</h2>
        <form onSubmit={handleCreateInvoice}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Amount: </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Customer Name: </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Customer Email: </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </form>
        {invoiceResult && (
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "#e0f7fa",
              padding: "1rem",
            }}
          >
            <h3>Invoice Created!</h3>
            <p>
              <strong>Invoice ID:</strong> {invoiceResult.id}
            </p>
            <p>
              <strong>Payment Link:</strong>{" "}
              <a
                href={invoiceResult.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {invoiceResult.url}
              </a>
            </p>
            <p>
              <em>
                (Salin Invoice ID di atas dan gunakan untuk mengecek status)
              </em>
            </p>
          </div>
        )}
      </section>

      {/* --- BAGIAN GET INVOICE --- */}
      <section style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <h2>2. Get Invoice Status</h2>
        <form onSubmit={handleGetStatus}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Invoice ID: </label>
            <input
              type="text"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              required
              style={{ width: "300px" }}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>
        {invoiceStatus && (
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "#f1f8e9",
              padding: "1rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            <h3>Invoice Status:</h3>
            <pre>{JSON.stringify(invoiceStatus, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default InvoiceTester;
