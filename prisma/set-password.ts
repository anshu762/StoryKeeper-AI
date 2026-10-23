import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "anubhavsinghbkj@gmail.com";
  const newPassword = process.argv[3] || "StoryKeeper2026!";

  console.log(`Setting password for: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }

  const hashedPassword = await hashPassword(newPassword);

  const credentialAccount = user.accounts.find(
    (acc) => acc.providerId === "credential"
  );

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: { password: hashedPassword },
    });
    console.log(`Updated existing credential account for ${email}.`);
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });
    console.log(`Created new credential account for ${email}.`);
  }

  console.log(`\nPassword successfully updated!`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error("Error setting password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
