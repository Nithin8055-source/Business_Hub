
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRTDBList } from '@/firebase/rtdb/use-list';
import { useRouter } from 'next/navigation';
import { useRealtimeDB } from '@/firebase/provider';
import {
  addTransaction,
  deleteTransaction,
  type Transaction,
} from '@/firebase/rtdb/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Loader2, ArrowUpRight, ArrowDownLeft, MoreVertical, Trash2, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getFinancialAdvice, type FinancialAnalystOutput } from '@/ai/ai-financial-analyst';
import { deductCredits, getCreditCost } from '@/lib/credits';
import { Textarea } from '@/components/ui/textarea';

const TransactionForm = ({ onSave, isSaving }: { onSave: (t: Omit<Transaction, 'id' | 'createdAt'>) => void; isSaving: boolean }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    onSave({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
      status: 'paid', // Manual transactions are always 'paid'
      currency,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: 'income' | 'expense') => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v: 'USD' | 'INR') => setCurrency(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
                </Select>
            </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g., Office Supplies" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Transaction
      </Button>
    </form>
  );
};

export default function AccountingPage() {
  const router = useRouter();
  const db = useRealtimeDB();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const transactionsPath = useMemo(() => user ? `users/${user.uid}/transactions` : null, [user]);
  const { data: allTransactions, loading: transactionsLoading } = useRTDBList<Transaction>(transactionsPath);

  const [aiQuery, setAiQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<FinancialAnalystOutput | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
        router.push('/auth/signin');
    }
  }, [user, userLoading, router]);

  const financials = useMemo(() => {
    const initial = {
        income: 0,
        expenses: 0,
        balance: 0,
        chartData: [{ name: 'Income', value: 0, color: '#22c55e' }, { name: 'Expenses', value: 0, color: '#ef4444' }],
    };

    if (!allTransactions) {
        return { USD: initial, INR: initial };
    }

    const usd = allTransactions.filter(t => t.currency === 'USD');
    const inr = allTransactions.filter(t => t.currency === 'INR');

    const calculate = (transactions: Transaction[]) => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return {
            income,
            expenses,
            balance: income - expenses,
            chartData: [{ name: 'Income', value: income, color: '#22c55e' }, { name: 'Expenses', value: expenses, color: '#ef4444' }],
        };
    };
    
    return {
        USD: calculate(usd),
        INR: calculate(inr),
    };
  }, [allTransactions]);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { incomeUSD: number; expensesUSD: number; incomeINR: number; expensesINR: number } } = {};
    if (!allTransactions) return [];

    allTransactions.forEach(t => {
      const month = format(new Date(t.date), 'yyyy-MM');
      if (!months[month]) {
        months[month] = { incomeUSD: 0, expensesUSD: 0, incomeINR: 0, expensesINR: 0 };
      }
      if (t.type === 'income') {
        if(t.currency === 'USD') months[month].incomeUSD += t.amount;
        else months[month].incomeINR += t.amount;
      } else {
        if(t.currency === 'USD') months[month].expensesUSD += t.amount;
        else months[month].expensesINR += t.amount;
      }
    });
    return Object.keys(months).map(month => ({
      name: format(new Date(month), 'MMM yy'),
      'Income (USD)': months[month].incomeUSD,
      'Expenses (USD)': months[month].expensesUSD,
      'Income (INR)': months[month].incomeINR,
      'Expenses (INR)': months[month].expensesINR,
    })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [allTransactions]);

  const sortedTransactions = useMemo(() => 
    allTransactions ? [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
  [allTransactions]);
  
  const handleSaveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      await addTransaction(db, user.uid, transaction);
      toast({ title: 'Transaction Added!' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to add transaction' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user || !db) return;
    if (window.confirm('Are you sure you want to delete this transaction?')) {
        try {
            await deleteTransaction(db, user.uid, transactionId);
            toast({title: 'Transaction deleted'});
        } catch (error) {
            console.error(error);
            toast({variant: 'destructive', title: 'Failed to delete transaction'});
        }
    }
  }

  const handleGetAiAdvice = async () => {
      if (!allTransactions || allTransactions.length === 0) {
          toast({ variant: 'destructive', title: 'Not enough data', description: 'Please add some transactions first.'});
          return;
      }
      if (!user || !db) return;

      setIsThinking(true);
      setAiAdvice(null);
      
      const result = await deductCredits(db, user.uid, 'accounting-ai');

      if (!result.success) {
        toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${result.cost} credits to use the AI Analyst.` });
        setIsThinking(false);
        return;
      }

      try {
          const advice = await getFinancialAdvice({ 
              transactions: allTransactions.map(t => ({type: t.type, amount: t.amount, category: t.category, currency: t.currency, date: t.date})),
              userQuery: aiQuery 
          });
          setAiAdvice(advice);
          toast({ title: 'Analysis Complete!', description: `${result.cost} credits were used.`})
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'AI Analyst Error', description: 'Could not generate financial advice.'});
      } finally {
          setIsThinking(false);
      }
  }
  
  if (userLoading || transactionsLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if(!user) {
      return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline">Accounting Dashboard</h1>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>New Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm onSave={handleSaveTransaction} isSaving={isSaving} />
                </DialogContent>
            </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <Card>
                <CardHeader><CardTitle>USD Account</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div><p className="text-sm text-muted-foreground">Income</p><p className="font-bold text-green-500">{financials.USD.income.toFixed(2)} USD</p></div>
                        <div><p className="text-sm text-muted-foreground">Expenses</p><p className="font-bold text-red-500">{financials.USD.expenses.toFixed(2)} USD</p></div>
                        <div><p className="font-bold text-sm text-muted-foreground">Balance</p><p className={`${financials.USD.balance >= 0 ? '' : 'text-red-500'}`}>{financials.USD.balance.toFixed(2)} USD</p></div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                 <CardHeader><CardTitle>INR Account</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div><p className="text-sm text-muted-foreground">Income</p><p className="font-bold text-green-500">{financials.INR.income.toFixed(2)} INR</p></div>
                        <div><p className="text-sm text-muted-foreground">Expenses</p><p className="font-bold text-red-500">{financials.INR.expenses.toFixed(2)} INR</p></div>
                        <div><p className="font-bold text-sm text-muted-foreground">Balance</p><p className={`${financials.INR.balance >= 0 ? '' : 'text-red-500'}`}>{financials.INR.balance.toFixed(2)} INR</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card><CardHeader><CardTitle>USD Breakdown</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={financials.USD.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{financials.USD.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value:number) => `${value.toFixed(2)} USD`}/><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
            <Card><CardHeader><CardTitle>INR Breakdown</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={financials.INR.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{financials.INR.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value:number) => `${value.toFixed(2)} INR`}/><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
        </div>
        
         <Card className="mb-8">
            <CardHeader><CardTitle>Monthly Overview</CardTitle></CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Income (USD)" stroke="#22c55e" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Expenses (USD)" stroke="#ef4444" strokeDasharray="5 5"/>
                        <Line type="monotone" dataKey="Income (INR)" stroke="#16a34a" />
                        <Line type="monotone" dataKey="Expenses (INR)" stroke="#dc2626" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wand2 /> AI Financial Analyst</CardTitle>
                <CardDescription>Get suggestions on how to improve profitability, or ask a specific question. ({getCreditCost('accounting-ai')} credits)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor='ai-query'>Ask a question (optional)</Label>
                    <Textarea id="ai-query" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder='e.g., Where can I cut costs? What were my most profitable months?' />
                </div>
                <Button onClick={handleGetAiAdvice} disabled={isThinking}>
                    {isThinking ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Wand2 className='mr-2 h-4 w-4'/>}
                    {isThinking ? 'Analyzing...' : 'Get AI Insights'}
                </Button>
                {aiAdvice && (
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle>AI Suggestions</CardTitle></CardHeader>
                        <CardContent className='prose prose-sm dark:prose-invert max-w-full' dangerouslySetInnerHTML={{ __html: aiAdvice.advice.replace(/\n/g, '<br />') }} />
                    </Card>
                )}
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A list of all your income and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sortedTransactions.length === 0 ? <p className="text-muted-foreground text-center py-8">No transactions yet.</p> :
                     sortedTransactions.slice(0, 15).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    {t.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" /> : <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400"/>}
                                </div>
                                <div>
                                    <p className="font-semibold">{t.category}</p>
                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'} {t.amount.toFixed(2)} {t.currency}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(t.date), 'PPP')}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => handleDeleteTransaction(t.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             </div>
                        </div>
                     ))
                    }
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
