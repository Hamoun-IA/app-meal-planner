import { prisma } from '../lib/prisma';

async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@babounette.com' },
    });

    if (user) {
      console.log('User ID:', user.id);
    } else {
      console.log('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserId(); 