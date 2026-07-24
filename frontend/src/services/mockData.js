export const INITIAL_TRACKS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Inglês Essencial para o Cotidiano',
    description: 'Aprenda vocabulário básico, cumprimentos e frases fundamentais para conversação diária.',
    level: 'Iniciante',
    order_index: 1,
    icon: 'book-open',
    modules: [
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        title: 'Módulo 1: Apresentação Pessoal & Greetings',
        description: 'Como se apresentar, saudações formais e informais.',
        lessons: [
          {
            id: 'c1111111-1111-1111-1111-111111111111',
            title: 'Aula 1: Hello & Nice to meet you',
            description: 'Aprenda os cumprimentos essenciais em inglês com pronúncia correta.',
            youtube_id: 'dQw4w9WgXcQ',
            pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            duration_minutes: 8,
            exercises: [
              {
                id: 'e1111111-1111-1111-1111-111111111111',
                type: 'multiple_choice',
                question: 'Qual a forma correta de responder a "Nice to meet you"?',
                options: ['Nice to meet you too', 'I am fine', 'Good morning', 'Yes, please'],
                correct_answer: 'Nice to meet you too',
                explanation: 'A resposta padrão para "Prazer em conhecê-lo" é "Prazer em conhecê-lo também".'
              },
              {
                id: 'e2222222-2222-2222-2222-222222222222',
                type: 'fill_in_blank',
                question: 'Preencha a lacuna: "Hello, _____ name is Sarah."',
                options: [],
                correct_answer: 'my',
                explanation: 'O pronome possessivo para "eu" (minha) é "my".'
              }
            ]
          },
          {
            id: 'c2222222-2222-2222-2222-222222222222',
            title: 'Aula 2: Falando sobre sua rotina',
            description: 'Uso do Present Simple para descrever atividades diárias.',
            youtube_id: 'L_LUpnjgPso',
            pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            duration_minutes: 12,
            exercises: [
              {
                id: 'e3333333-3333-3333-3333-333333333333',
                type: 'multiple_choice',
                question: 'Qual frase representa uma ação da rotina?',
                options: ['I go to school every day', 'I went yesterday', 'I will fly tomorrow', 'I am sleeping now'],
                correct_answer: 'I go to school every day',
                explanation: 'Expressões de frequência como "every day" acompanham o Present Simple.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Speaking & Fluência com Americanos',
    description: 'Prepare-se para interações reais com voluntários estrangeiros e visitas na escola.',
    level: 'Intermediário',
    order_index: 2,
    icon: 'mic',
    modules: [
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        title: 'Módulo 1: Cultural Exchange Prep',
        description: 'Expressões comuns utilizadas em conversas com nativos.',
        lessons: [
          {
            id: 'c3333333-3333-3333-3333-333333333333',
            title: 'Aula 1: Perguntando sobre Origem e Cultura',
            description: 'Como fazer perguntas gentis para visitantes americanos.',
            youtube_id: '3JZ_D3ELwOQ',
            pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            duration_minutes: 15,
            exercises: [
              {
                id: 'e4444444-4444-4444-4444-444444444444',
                type: 'multiple_choice',
                question: 'Como perguntar de onde alguém vem?',
                options: ['Where are you from?', 'Where you go?', 'How are you coming?', 'Who are you from?'],
                correct_answer: 'Where are you from?',
                explanation: '"Where are you from?" é a estrutura correta para perguntar a origem.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_GALLERY = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    title: 'Visita da Delegação de Boston',
    description: 'Estudantes americanos participando da oficina de conversação na nossa sala de leitura.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    category: 'Visita Americana',
    event_date: '2026-03-15'
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    title: 'Workshop de Pronúncia & Pitching',
    description: 'Atividade prática de speaking entre nossos alunos da comunidade e mentores norte-americanos.',
    image_url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80',
    category: 'Evento',
    event_date: '2026-04-10'
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    title: 'Certificação da Turma de 2026',
    description: 'Entrega de certificados do nível intermediário com a presença dos parceiros sociais.',
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    category: 'Aula Especial',
    event_date: '2026-06-20'
  }
];
