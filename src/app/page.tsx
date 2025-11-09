import { UsersRound, FileText, Rocket, ReceiptText, Mail, BarChart3 } from 'lucide-react';
import FeatureCard from '@/components/feature-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function Home() {
  const features = [
    {
      icon: <UsersRound className="h-10 w-10 text-primary" />,
      title: 'Co-working Rooms',
      description: 'Join virtual rooms, chat with peers, and collaborate in real-time.',
      href: '/collaboration',
      image: PlaceHolderImages.find(p => p.id === 'collaboration_room'),
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'Document Intelligence',
      description: 'Get AI-powered summaries and risk analysis for your legal documents.',
      href: '/document-ai',
      image: PlaceHolderImages.find(p => p.id === 'document_intelligence'),
    },
    {
      icon: <Rocket className="h-10 w-10 text-primary" />,
      title: 'Startup Generator',
      description: 'Turn your idea into a business plan with an AI-generated logo and pitch deck.',
      href: '/startup-generator',
      image: PlaceHolderImages.find(p => p.id === 'startup_generator'),
    },
    {
      icon: <ReceiptText className="h-10 w-10 text-primary" />,
      title: 'Invoice Generator',
      description: 'Create, manage, and send professional invoices with ease.',
      href: '/invoicing',
      image: PlaceHolderImages.find(p => p.id === 'invoice_generator'),
    },
    {
      icon: <Mail className="h-10 w-10 text-primary" />,
      title: 'AI Email Generator',
      description: 'Describe your email\'s purpose and let AI craft the perfect message for you.',
      href: '/email-generator',
      image: PlaceHolderImages.find(p => p.id === 'email_generator'),
    },
     {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: 'Accounting Dashboard',
      description: 'Track income, expenses, and invoices with visual financial reports.',
      href: '/accounting',
      image: PlaceHolderImages.find(p => p.id === 'accounting_dashboard'),
    },
  ];
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'auth_background');

  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full py-20 md:py-32 border-b overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt="Abstract background"
                fill
                className="object-cover -z-10 opacity-20"
                data-ai-hint={heroImage.imageHint}
                priority
            />
        )}
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
              Welcome to AI-BUSINESS-HUB
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Your all-in-one AI-powered business hub. Streamline your workflow, from collaboration to legal analysis and invoicing.
            </p>
            <Button size="lg" asChild className="font-headline">
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                image={feature.image?.imageUrl}
                imageHint={feature.image?.imageHint}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
