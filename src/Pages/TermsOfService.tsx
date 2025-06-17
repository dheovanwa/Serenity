import React from "react";
import { useNavigate } from "react-router-dom";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Import logo dark

interface TermsOfServiceProps {
  isDarkMode: boolean; // Tambahkan prop isDarkMode
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ isDarkMode }) => {
  // Terima prop isDarkMode
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-[#F2EDE2] dark:bg-[#1A2947] transition-colors duration-300">
      {" "}
      {/* Main background */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <img
            src={isDarkMode ? logoDark : logoLight} // Logo menyesuaikan mode
            alt="Serenity Logo"
            className="w-12 h-12"
          />
          <h1 className="text-2xl text-[#78716C] dark:text-gray-300">
            Serenity
          </h1>{" "}
          {/* Teks logo */}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors
                     bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:shadow-sm" // Button
        >
          <svg
            className="w-5 h-5 text-black dark:text-white" // SVG ikon panah (gunakan text- untuk warna)
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium text-[#358DB3] dark:text-blue-400">
            Back
          </span>{" "}
          {/* Teks "Back" */}
        </button>
      </div>
      <div
        className="max-w-4xl mx-auto rounded-lg shadow-lg p-8
                      bg-white dark:bg-gray-800"
      >
        {" "}
        {/* Kontainer konten */}
        <h1 className="text-3xl font-bold mb-6 text-[#161F36] dark:text-white">
          {" "}
          {/* Judul halaman */}
          Syarat dan Ketentuan
        </h1>
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          {" "}
          {/* Kontainer teks konten */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#358DB3] dark:text-blue-400">
              {" "}
              {/* Judul bagian */}
              1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan mengakses dan menggunakan layanan Serenity, Anda menyetujui
              untuk terikat dengan Syarat dan Ketentuan ini.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#358DB3] dark:text-blue-400">
              2. Tanggung Jawab Pengguna
            </h2>
            <p>Pengguna wajib:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Memberikan informasi yang akurat dan lengkap</li>
              <li>Menjaga kerahasiaan akun mereka</li>
              <li>Menggunakan layanan sesuai dengan hukum yang berlaku</li>
              <li>Tidak menyalahgunakan fitur platform</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#358DB3] dark:text-blue-400">
              3. Privasi & Perlindungan Data
            </h2>
            <p>
              Kami berkomitmen untuk melindungi privasi Anda dan menangani data
              Anda sesuai dengan undang-undang perlindungan data yang berlaku.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#358DB3] dark:text-blue-400">
              4. Batasan Layanan
            </h2>
            <p>
              Serenity menyediakan layanan dukungan kesehatan mental tetapi
              bukan pengganti layanan medis darurat. Dalam keadaan darurat,
              silakan hubungi layanan darurat setempat.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#358DB3] dark:text-blue-400">
              5. Perubahan Ketentuan
            </h2>
            <p>
              Kami berhak untuk mengubah ketentuan ini sewaktu-waktu. Penggunaan
              berkelanjutan atas layanan merupakan penerimaan atas ketentuan
              yang dimodifikasi.
            </p>
          </section>
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            {" "}
            {/* Teks terakhir diperbarui */}
            <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
