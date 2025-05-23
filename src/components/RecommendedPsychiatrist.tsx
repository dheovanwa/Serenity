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
    image: { PsychiatristPhoto },
  },
  {
    name: "Yohanes Smith",
    job: "Therapist",
    image: { PsychiatristPhoto },
  },
  {
    name: "Jane Smith",
    job: "Therapist",
    image: { PsychiatristPhoto },
  },
  {
    name: "Dheo Smith",
    job: "Therapist",
    image: { PsychiatristPhoto },
  },
  {
    name: "Jefferson Wenanta",
    job: "Therapist",
    image: { PsychiatristPhoto },
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
