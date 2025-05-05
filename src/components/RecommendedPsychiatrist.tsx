import * as React from "react";
import PsychiatristPhoto from "../assets/psychiatristPhoto.png";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

// Data psikiater
const psychiatrists = [
  {
    name: "Titin Sulaiman",
    job: "Anxiety & Depression Specialist",
    image: { PsychiatristPhoto }, // Gantilah dengan path gambar psikiater
  },
  {
    name: "John Doe",
    job: "Mental Health Specialist",
    image: { PsychiatristPhoto }, // Gantilah dengan path gambar psikiater
  },
  {
    name: "Jane Smith",
    job: "Therapist",
    image: { PsychiatristPhoto }, // Gantilah dengan path gambar psikiater
  },
  // Tambahkan lebih banyak data sesuai kebutuhan
];

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-md mx-auto">
      <CarouselContent>
        {psychiatrists.map((psychiatrist, index) => (
          <CarouselItem key={index}>
            <div className="p-4">
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {/* Gambar Psikiater */}
                  <img
                    src={PsychiatristPhoto}
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
