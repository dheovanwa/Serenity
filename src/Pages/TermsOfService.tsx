import React from "react";
import { useNavigate } from "react-router-dom";
import logoLight from "../assets/Logo - Light.png";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2EDE2] p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <img src={logoLight} alt="Serenity Logo" className="w-12 h-12" />
          <h1 className="text-2xl text-[#78716C]">Serenity</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span className="text-[#358DB3] font-medium">Back</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#161F36] mb-6">
          Syarat dan Ketentuan
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-[#358DB3] mb-3">
              1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan mengakses dan menggunakan layanan Serenity, Anda menyetujui
              untuk terikat dengan Syarat dan Ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#358DB3] mb-3">
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
            <h2 className="text-xl font-semibold text-[#358DB3] mb-3">
              3. Privasi & Perlindungan Data
            </h2>
            <p>
              Kami berkomitmen untuk melindungi privasi Anda dan menangani data
              Anda sesuai dengan undang-undang perlindungan data yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#358DB3] mb-3">
              4. Batasan Layanan
            </h2>
            <p>
              Serenity menyediakan layanan dukungan kesehatan mental tetapi bukan
              pengganti layanan medis darurat. Dalam keadaan darurat, silakan
              hubungi layanan darurat setempat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#358DB3] mb-3">
              5. Perubahan Ketentuan
            </h2>
            <p>
              Kami berhak untuk mengubah ketentuan ini sewaktu-waktu. Penggunaan
              berkelanjutan atas layanan merupakan penerimaan atas ketentuan yang
              dimodifikasi.
            </p>
          </section>

          <div className="mt-8 text-sm text-gray-500">
            <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
