
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BookUser, BrainCircuit, CreditCard, Mail, UsersRound, FileText, Rocket, ReceiptText, BarChart3, Mail as MailIcon } from 'lucide-react';

export default function InfoPage() {
  const features = [
    { name: 'Co-working Rooms', href: '/info/co-working', icon: <UsersRound className="h-6 w-6" /> },
    { name: 'Document Intelligence', href: '/info/document-intelligence', icon: <FileText className="h-6 w-6" /> },
    { name: 'Startup Generator', href: '/info/startup-generator', icon: <Rocket className="h-6 w-6" /> },
    { name: 'Invoice Generator', href: '/info/invoicing', icon: <ReceiptText className="h-6 w-6" /> },
    { name: 'AI Email Generator', href: '/info/email-generator', icon: <MailIcon className="h-6 w-6" /> },
    { name: 'Accounting Dashboard', href: '/info/accounting', icon: <BarChart3 className="h-6 w-6" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3"><BrainCircuit className="h-8 w-8 text-primary" />About AI-BUSINESS-HUB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>AI-BUSINESS-HUB is designed to be an all-in-one toolkit for aspiring entrepreneurs and established business owners alike. Our mission is to provide powerful, AI-driven tools that streamline complex tasks, foster collaboration, and provide intelligent insights to guide your business journey.</p>
            <p>From generating a full-fledged startup plan from a simple idea to managing your finances and creating professional invoices, our goal is to empower you to focus on what matters most: building and growing your business.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3"><BookUser className="h-7 w-7 text-primary" /> Core Feature Guides</CardTitle>
            <CardDescription>Click on a feature to learn how to use it, how it can benefit your business, and details about its credit cost.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Button key={feature.name} asChild variant="outline" className="justify-start gap-4 h-14 text-left">
                <Link href={feature.href}>
                  {feature.icon}
                  <span className="flex-grow">{feature.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3"><CreditCard className="h-7 w-7 text-primary" />About the Credit System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>To power the advanced AI capabilities in this app, we utilize powerful generative models that are not free for us to operate. The credit system is a way for us to manage these costs fairly while providing you with substantial free access.</p>
            <p>Every user receives <span className="font-bold text-foreground">50 free credits every 24 hours</span>. This daily allowance is enough to explore all the features and use them for your day-to-day business needs.</p>
            <p className="font-bold text-primary p-3 bg-primary/10 rounded-md">
              Important Note: When you first sign in, your credit balance might not display the correct amount immediately. Your actual credit balance will be correctly reflected after you use any core feature for the first time.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3"><Mail className="h-7 w-7 text-primary" />Get In Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Have an idea for a new feature? Encountered an issue? We'd love to hear from you. Your feedback is invaluable as we work to improve AI-BUSINESS-HUB.</p>
            <p>For any inquiries, suggestions, or to report a problem, please do not hesitate to write to us at: <a href="mailto:aibusinesshub360@gmail.com" className="font-bold text-primary underline">aibusinesshub360@gmail.com</a>.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
