import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

// Konfigurasi chart
const chartConfig = {
  desktop: {
    label: "Stress",
    color: "#4c9aff", // Menetapkan warna biru untuk desktop
  },
  mobile: {
    label: "Mobile",
    color: "#ff6b6b", // Menetapkan warna merah untuk mobile
  },
};

export function LineCharts({
  data,
  title,
}: {
  data: { x: string; y: number }[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Last 7 Days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={[...data].reverse()} // Invert the data array
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="x"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: "Date", position: "insideBottom", offset: -10 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent formatter={(value) => [`${value}%`]} />
              }
            />
            <Line
              dataKey="y"
              type="monotone"
              stroke="#4c9aff"
              strokeWidth={3}
              dot={{
                fill: "#4c9aff",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
