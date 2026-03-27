import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const topics = await prisma.topic.findMany({ take: 1, orderBy: { updatedAt: 'desc' } })
  console.log(JSON.stringify(topics, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
