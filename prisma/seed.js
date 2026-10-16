const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create the admin user if missing. An existing admin's password is never
  // overwritten, so re-running the seed cannot reset it to a known value.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists; password left unchanged.`);
  } else if (!process.env.ADMIN_PASSWORD) {
    console.log('Skipping admin user: set ADMIN_PASSWORD to create one.');
  } else {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.create({ data: { email: adminEmail, passwordHash } });
    console.log(`Created admin user: ${adminEmail}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
