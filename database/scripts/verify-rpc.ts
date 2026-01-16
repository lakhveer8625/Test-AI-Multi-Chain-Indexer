import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const chain = await prisma.chain.findUnique({
        where: { chainId: 11155111 },
    });
    console.log('Current Sepolia Config:', chain);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
