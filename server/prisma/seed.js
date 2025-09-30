import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
  ];

  console.log('Creating categories...');
  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  console.log('Creating demo user...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@financeflow.com' },
    update: {},
    create: {
      email: 'demo@financeflow.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'user',
    },
  });

  // Get categories for demo data
  const foodCategory = await prisma.category.findFirst({
    where: { name: 'Food & Dining' },
  });
  
  const salaryCategory = await prisma.category.findFirst({
    where: { name: 'Salary' },
  });

  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transportation' },
  });

  // Create demo transactions
  console.log('Creating demo transactions...');
  const demoTransactions = [
    {
      title: 'Monthly Salary',
      amount: 3500.00,
      type: 'income',
      categoryId: salaryCategory?.id,
      date: new Date('2025-01-01'),
      notes: 'January salary deposit',
      userId: demoUser.id,
    },
    {
      title: 'Grocery Shopping',
      amount: 120.50,
      type: 'expense',
      categoryId: foodCategory?.id,
      date: new Date('2025-01-02'),
      notes: 'Weekly groceries',
      userId: demoUser.id,
    },
    {
      title: 'Gas Station',
      amount: 45.00,
      type: 'expense',
      categoryId: transportCategory?.id,
      date: new Date('2025-01-03'),
      notes: 'Fuel for car',
      userId: demoUser.id,
    },
    {
      title: 'Coffee Shop',
      amount: 4.75,
      type: 'expense',
      categoryId: foodCategory?.id,
      date: new Date('2025-01-04'),
      notes: 'Morning coffee',
      userId: demoUser.id,
    },
    {
      title: 'Freelance Project',
      amount: 750.00,
      type: 'income',
      categoryId: null,
      date: new Date('2025-01-05'),
      notes: 'Website development project',
      userId: demoUser.id,
    },
  ];

  for (const transaction of demoTransactions) {
    await prisma.item.create({
      data: transaction,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('Demo user credentials:');
  console.log('Email: demo@financeflow.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });