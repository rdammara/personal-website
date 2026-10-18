// Sets a new password for an admin account. Run on the server:
//   npm run set-admin-password
// The password is typed without being shown and is never written anywhere in plain text.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'node:readline';

const MIN_LENGTH = 12;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Print the question, then mute echo for whatever is typed
    rl._writeToOutput = (s) => {
      if (rl.muted) {
        if (s.includes('\n') || s.includes('\r')) rl.output.write('\n');
      } else {
        rl.output.write(s);
      }
    };
    rl.muted = false;
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    rl.muted = true;
  });
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const prisma = new PrismaClient();

async function main() {
  if (!process.stdin.isTTY) throw new Error('Run this in a terminal, so the password can be typed privately.');

  const admins = await prisma.user.findMany({ select: { email: true } });
  if (admins.length === 0) throw new Error('No admin account exists.');

  let email = admins[0].email;
  if (admins.length > 1) {
    email = await ask(`Admin email (${admins.map((a) => a.email).join(', ')}): `);
    if (!admins.some((a) => a.email === email)) throw new Error(`No admin with email ${email}.`);
  }
  console.log(`Changing the password for ${email}.`);

  const password = await askHidden(`New password (at least ${MIN_LENGTH} characters): `);
  if (password.length < MIN_LENGTH) throw new Error(`Too short: use at least ${MIN_LENGTH} characters. Nothing changed.`);
  const repeat = await askHidden('Type it again: ');
  if (repeat !== password) throw new Error('The two entries did not match. Nothing changed.');

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 12), passwordChangedAt: new Date() },
  });
  console.log('Password changed, and every signed-in browser was signed out. Sign in again at /admin/login.');
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
