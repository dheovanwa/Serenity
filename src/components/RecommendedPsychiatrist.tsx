import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import p1 from "../assets/p1.png"; // Import gambar profil
import p2 from "../assets/p2.png"; // Import gambar profil
import p4 from "../assets/p4.png";
import p5 from "../assets/p5.png";
import p3 from "../assets/p3.png";

const psychiatrists = [
  {
    name: "Titin Sulaiman",
    job: "Psikoterapi dan Konseling",
    image: p1, // Menggunakan variabel p1 secara langsung
  },
  {
    name: "Yohanes Smith",
    job: "Therapist",
    image: p2, // Menggunakan variabel p2 secara langsung
  },
  {
    name: "Jane Smith",
    job: "Hipnoterapi",
    image: p4, // Menggunakan variabel p4 secara langsung
  },
  {
    name: "Dheo Smith",
    job: "Evaluasi Kondisi Psikologis",
    image: p5, // Menggunakan variabel p5 secara langsung
  },
  {
    name: "Jefferson Wenanta",
    job: "Terapi Stimulasi Saraf Otak",
    image: p3, // Menggunakan variabel p3 secara langsung
  },
];

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-7xl mx-auto">
      <CarouselContent>
        {psychiatrists.map((psychiatrist, index) => (
          <CarouselItem key={index}>
            <div className="p-4">
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {/* Gambar Psikiater */}
                  <img
                    src={psychiatrist.image} // Menggunakan psychiatrist.image
                    alt={psychiatrist.name}
                    className="w-62 h-42 rounded-2xl object-cover mb-4"
                  />
                  {/* Nama Psikiater */}
                  <span className="text-2xl font-semibold mb-2">
                    {psychiatrist.name}
                  </span>
                  {/* Pekerjaan Psikiater */}
                  <p className="text-lg text-gray-500">{psychiatrist.job}</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
