require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
      console.log('🔄 Iniciando inserção no Banco de Dados...');

      // 1. Inserindo uma Cantora de Exemplo
      const cantorAline = await prisma.verbete.create({
            data: {
                  titulo: 'Aline Barros',
                  subtitulo: 'Cantora de Música Cristã Contemporânea',
                  categoria_tipo: 'Cantor',
                  texto_biografia: 'Aline Kistenmacker Barros dos Santos é uma cantora, compositora e pastora brasileira...',
                  slug: 'aline-barros',
                  status: 'Publicado',
                  foto_perfil: 'https://res.cloudinary.com/demo/image/upload/v1/aline_barros_exemplo.jpg', // Cloudinary fake URL
            },
      });
      console.log('✅ Cantora Inserida:', cantorAline.titulo);

      // 2. Inserindo um Hino com Título já Formatado (Simulando o sistema do Painel)
      const hinoHarpa = await prisma.verbete.create({
            data: {
                  titulo: 'Hino da Harpa Cristã 15 - Foi na Cruz', // O título como a pessoa quis pesquisar
                  titulo_formatado: 'Hino 15 da Harpa Cristã Foi na Cruz', // A Regra de Negócio que nosso código do server faria
                  categoria_tipo: 'Hino',
                  texto_letra: 'Oh, quão cego andei e perdido vaguei, Longe, longe do meu Salvador...',
                  slug: 'harpa-crista-15',
                  status: 'Publicado',
                  eh_hino: true,
                  numero_hinario: 15,
            },
      });
      console.log('✅ Hino Inserido:', hinoHarpa.titulo_formatado);

      // 3. Inserindo um Rascunho (Pra provar que o banco aceita e oculta)
      const rascunho = await prisma.verbete.create({
            data: {
                  titulo: 'Cassiane (Rascunho Secreto)',
                  categoria_tipo: 'Cantor',
                  slug: 'cassiane-rascunho',
                  status: 'Rascunho', // Front-end não via ver isso!
                  data_nascimento: '1973-01-27',
            },
      });
      console.log('✅ Rascunho de Teste Inserido:', rascunho.titulo);

}

main()
      .then(async () => {
            await prisma.$disconnect();
            console.log('🎉 Tudo gravado e finalizado com sucesso!');
      })
      .catch(async (e) => {
            console.error(e);
            await prisma.$disconnect();
            process.exit(1);
      });
