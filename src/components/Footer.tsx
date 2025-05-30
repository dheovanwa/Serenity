import React from "react";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import SerenityLogo from "../assets/Logo - Dark.png"; // Asumsi: Ini adalah logo 'S'

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#161F36] text-white pt-16">
      <div className="w-full mx-auto px-10 md:px-16 lg:px-24">
        <div className="flex items-center mb-16 pl-4 md:pl-0">
          {SerenityLogo && (
            <img
              src={SerenityLogo}
              alt="Serenity S Logo"
              className="h-14 w-14 mr-4"
            />
          )}
          <h2 className="text-6xl font-bold text-white">Serenity</h2>
        </div>

        {/* Menggunakan grid-cols-1 md:grid-cols-3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-0 mb-16">
          {/* Kolom 1: Informasi Kontak (Tetap Rata Kiri) */}
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-6">Informasi Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-base">
                <img src={Instagram} alt="Instagram" className="w-6 h-6 mr-3" />
                <span>@mentalhealthid</span>
              </li>
              <li className="flex items-center text-base">
                <img src={Whatsapp} alt="Whatsapp" className="w-6 h-6 mr-3" />
                <span>+628529320581</span>
              </li>
              <li className="flex items-center text-base">
                <img src={email} alt="email" className="w-6 h-6 mr-3" />
                <span>mentalhealth@serenity.co.id</span>
              </li>
            </ul>
          </div>

          {/* Kolom 2: PT Serenity Mental Health (Alamat) - Dorong ke Tengah dengan margin-left */}
          {/* Tambahkan md:ml-20 untuk mendorongnya dari kolom pertama */}
          <div className="text-left md:ml-30">
            {" "}
            {/* <--- Perubahan di sini */}
            <h3 className="text-xl font-semibold mb-6">
              PT Serenity Mental Health
            </h3>
            <p className="text-base leading-relaxed">
              Jl. Raya Kb. Mangga No.72 RT.2/RW.09, <br />
              Kec. Duku, Kota Jakarta Selatan, <br />
              Daerah Khusus Ibukota Jakarta 10812
            </p>
          </div>

          {/* Kolom 3: Peta Situs (Dorong ke Kanan menggunakan ml-auto) */}
          {/* Pastikan ini tetap ada untuk mendorongnya ke paling kanan */}
          <div className="text-left md:ml-auto">
            {" "}
            {/* <--- Perubahan di sini */}
            <h3 className="text-xl font-semibold mb-6">Peta Situs</h3>
            <ul className="space-y-3 text-base">
              <li>
                <a href="#" className="hover:opacity-75">
                  Halaman Utama
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-75">
                  Pencarian Psikiater
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-75">
                  Jadwal Sesi
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-75">
                  Pesan
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-75">
                  Profil
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Copyright */}
      <div className="bg-[#161F36] py-4 text-center">
        <p className="text-base font-medium">
          © 2024 - 2025 PT Serenity Mental Health
        </p>
      </div>
    </footer>
  );
};

export default Footer;
