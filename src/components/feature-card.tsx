import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  image?: string;
  imageHint?: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  image,
  imageHint
}: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={imageHint}
            />
          </div>
        )}
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="mt-1">{icon}</div>
          <div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-auto flex justify-end">
            <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                Explore
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
