import type { SpanishWord, PartOfSpeech, CEFRLevel } from '../types';

export const INITIAL_SPANISH_WORDS: SpanishWord[] = [
  // 1-7: Fundamental Personal Pronouns
  {
    id: 'w-1',
    spanish: 'yo',
    english: 'I',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '___ soy estudiante de español.',
    sentenceEn: 'I am a Spanish student.',
    sentenceEnLiteral: 'I am student of spanish.',
    hint: '1st person singular pronoun',
    frequencyRank: 1
  },
  {
    id: 'w-2',
    spanish: 'tú',
    english: 'you (informal)',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '¿___ eres de aquí?',
    sentenceEn: 'Are you from here?',
    sentenceEnLiteral: 'You are of here?',
    hint: '2nd person singular informal',
    frequencyRank: 2
  },
  {
    id: 'w-3',
    spanish: 'él',
    english: 'he',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '___ habla inglés muy bien.',
    sentenceEn: 'He speaks English very well.',
    sentenceEnLiteral: 'He speaks english very well.',
    hint: '3rd person masculine pronoun (with accent)',
    frequencyRank: 3
  },
  {
    id: 'w-4',
    spanish: 'ella',
    english: 'she',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '___ es mi mejor amiga.',
    sentenceEn: 'She is my best friend.',
    sentenceEnLiteral: 'She is my best friend.',
    hint: '3rd person feminine pronoun',
    frequencyRank: 4
  },
  {
    id: 'w-5',
    spanish: 'nosotros',
    english: 'we',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '___ vivimos en Madrid.',
    sentenceEn: 'We live in Madrid.',
    sentenceEnLiteral: 'We live in Madrid.',
    hint: '1st person plural pronoun',
    frequencyRank: 5
  },
  {
    id: 'w-6',
    spanish: 'ellos',
    english: 'they',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '___ están en la casa.',
    sentenceEn: 'They are in the house.',
    sentenceEnLiteral: 'They are in the house.',
    hint: '3rd person plural pronoun',
    frequencyRank: 6
  },
  {
    id: 'w-7',
    spanish: 'usted',
    english: 'you (formal)',
    partOfSpeech: 'pronoun',
    cefr: 'A1',
    sentenceEs: '¿Cómo está ___ hoy?',
    sentenceEn: 'How are you today?',
    sentenceEnLiteral: 'How is you today?',
    hint: 'formal 2nd person singular',
    frequencyRank: 7
  },

  // 8-12: Core Verb - SER (to be - permanent/identity) - Conjugated
  {
    id: 'w-8',
    spanish: 'soy',
    english: 'I am (ser)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ de España.',
    sentenceEn: 'I am from Spain.',
    sentenceEnLiteral: 'I am from Spain.',
    hint: 'verb: ser (presente: yo)',
    frequencyRank: 8
  },
  {
    id: 'w-9',
    spanish: 'es',
    english: 'is / he is / she is (ser)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Este libro ___ muy interesante.',
    sentenceEn: 'This book is very interesting.',
    sentenceEnLiteral: 'This book is very interesting.',
    hint: 'verb: ser (presente: él/ella)',
    frequencyRank: 9
  },
  {
    id: 'w-10',
    spanish: 'eres',
    english: 'you are (ser)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿De dónde ___ tú?',
    sentenceEn: 'Where are you from?',
    sentenceEnLiteral: 'Of where are you?',
    hint: 'verb: ser (presente: tú)',
    frequencyRank: 10
  },
  {
    id: 'w-11',
    spanish: 'somos',
    english: 'we are (ser)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Nosotros ___ amigos desde hace años.',
    sentenceEn: 'We are friends for years.',
    sentenceEnLiteral: 'We are friends from does years.',
    hint: 'verb: ser (presente: nosotros)',
    frequencyRank: 11
  },
  {
    id: 'w-12',
    spanish: 'son',
    english: 'they are (ser)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Ellos ___ profesores universitarios.',
    sentenceEn: 'They are university professors.',
    sentenceEnLiteral: 'They are professors university.',
    hint: 'verb: ser (presente: ellos)',
    frequencyRank: 12
  },

  // 13-15: Core Verb - ESTAR (to be - state/location) - Conjugated
  {
    id: 'w-13',
    spanish: 'estoy',
    english: 'I am (estar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Hoy ___ muy contento con los resultados.',
    sentenceEn: 'Today I am very happy with the results.',
    sentenceEnLiteral: 'Today I am very happy with the results.',
    hint: 'verb: estar (presente: yo - state)',
    frequencyRank: 13
  },
  {
    id: 'w-14',
    spanish: 'está',
    english: 'is / is located (estar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'El café ___ cerca de aquí.',
    sentenceEn: 'The café is near here.',
    sentenceEnLiteral: 'The café is near of here.',
    hint: 'verb: estar (presente: él/ella - location)',
    frequencyRank: 14
  },
  {
    id: 'w-15',
    spanish: 'están',
    english: 'they are / are located (estar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿Dónde ___ mis llaves?',
    sentenceEn: 'Where are my keys?',
    sentenceEnLiteral: 'Where are my keys?',
    hint: 'verb: estar (presente: ellos)',
    frequencyRank: 15
  },

  // 16-19: Core Verb - TENER (to have) - Conjugated
  {
    id: 'w-16',
    spanish: 'tengo',
    english: 'I have (tener)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ dos hermanos mayores.',
    sentenceEn: 'I have two older brothers.',
    sentenceEnLiteral: 'I have two brothers older.',
    hint: 'verb: tener (presente: yo)',
    frequencyRank: 16
  },
  {
    id: 'w-17',
    spanish: 'tienes',
    english: 'you have (tener)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿___ tiempo para tomar un café?',
    sentenceEn: 'Do you have time to have a coffee?',
    sentenceEnLiteral: 'Have you time for to take a coffee?',
    hint: 'verb: tener (presente: tú)',
    frequencyRank: 17
  },
  {
    id: 'w-18',
    spanish: 'tiene',
    english: 'has / he has / she has (tener)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Ella ___ un coche nuevo.',
    sentenceEn: 'She has a new car.',
    sentenceEnLiteral: 'She has a car new.',
    hint: 'verb: tener (presente: él/ella)',
    frequencyRank: 18
  },
  {
    id: 'w-19',
    spanish: 'tenemos',
    english: 'we have (tener)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Nosotros ___ una reserva a las ocho.',
    sentenceEn: 'We have a reservation at eight.',
    sentenceEnLiteral: 'We have a reservation at the eight.',
    hint: 'verb: tener (presente: nosotros)',
    frequencyRank: 19
  },

  // 20-21: HABER (there is/was)
  {
    id: 'w-20',
    spanish: 'hay',
    english: 'there is / there are (haber)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'En la mesa ___ una carta para ti.',
    sentenceEn: 'On the table there is a letter for you.',
    sentenceEnLiteral: 'In the table there is a letter for you.',
    hint: 'verb: haber (impersonal presente)',
    frequencyRank: 20
  },
  {
    id: 'w-21',
    spanish: 'había',
    english: 'there was / there were (haber)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'Ayer ___ mucha gente en el parque.',
    sentenceEn: 'Yesterday there were many people in the park.',
    sentenceEnLiteral: 'Yesterday there was much people in the park.',
    hint: 'verb: haber (imperfecto)',
    frequencyRank: 21
  },

  // 22-26: IR (to go) - Conjugated (Present & Preterite)
  {
    id: 'w-22',
    spanish: 'voy',
    english: 'I go / I am going (ir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ a la oficina ahora.',
    sentenceEn: 'I am going to the office now.',
    sentenceEnLiteral: 'I go to the office now.',
    hint: 'verb: ir (presente: yo)',
    frequencyRank: 22
  },
  {
    id: 'w-23',
    spanish: 'va',
    english: 'goes / is going (ir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'El autobús ___ directo al centro.',
    sentenceEn: 'The bus goes directly to the center.',
    sentenceEnLiteral: 'The bus goes direct to the center.',
    hint: 'verb: ir (presente: él/ella)',
    frequencyRank: 23
  },
  {
    id: 'w-24',
    spanish: 'vamos',
    english: 'we go / let’s go (ir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Nosotros ___ al cine esta tarde.',
    sentenceEn: 'We are going to the cinema this afternoon.',
    sentenceEnLiteral: 'We go to the cinema this afternoon.',
    hint: 'verb: ir (presente: nosotros)',
    frequencyRank: 24
  },
  {
    id: 'w-25',
    spanish: 'fui',
    english: 'I went / I was (ir/ser)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'El sábado ___ a visitar a mis abuelos.',
    sentenceEn: 'On Saturday I went to visit my grandparents.',
    sentenceEnLiteral: 'The saturday I went to to visit to my grandparents.',
    hint: 'verb: ir (pretérito: yo)',
    frequencyRank: 25
  },
  {
    id: 'w-26',
    spanish: 'fue',
    english: 'went / was (ir/ser)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'La reunión de ayer ___ muy productiva.',
    sentenceEn: 'Yesterday’s meeting was very productive.',
    sentenceEnLiteral: 'The meeting of yesterday was very productive.',
    hint: 'verb: ser (pretérito: él/ella)',
    frequencyRank: 26
  },

  // 27-29: QUERER (to want / would like) - Conjugated
  {
    id: 'w-27',
    spanish: 'quiero',
    english: 'I want (querer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ aprender español este año.',
    sentenceEn: 'I want to learn Spanish this year.',
    sentenceEnLiteral: 'I want to learn spanish this year.',
    hint: 'verb: querer (presente: yo)',
    frequencyRank: 27
  },
  {
    id: 'w-28',
    spanish: 'quiere',
    english: 'wants / he wants / she wants (querer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿Quién ___ un poco de pastel?',
    sentenceEn: 'Who wants a little bit of cake?',
    sentenceEnLiteral: 'Who wants a little of cake?',
    hint: 'verb: querer (presente: él/ella)',
    frequencyRank: 28
  },
  {
    id: 'w-29',
    spanish: 'quisiera',
    english: 'I would like (querer polite)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: '___ pedir la cuenta, por favor.',
    sentenceEn: 'I would like to ask for the bill, please.',
    sentenceEnLiteral: 'I would like to ask-for the bill, by favor.',
    hint: 'verb: querer (polite request)',
    frequencyRank: 29
  },

  // 30-32: PODER (can / to be able) - Conjugated
  {
    id: 'w-30',
    spanish: 'puedo',
    english: 'I can (poder)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿___ entrar un momento?',
    sentenceEn: 'Can I come in for a moment?',
    sentenceEnLiteral: 'Can I to enter a moment?',
    hint: 'verb: poder (presente: yo)',
    frequencyRank: 30
  },
  {
    id: 'w-31',
    spanish: 'puede',
    english: 'can / you can (formal) (poder)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Usted ___ pasar ahora mismo.',
    sentenceEn: 'You can come in right now.',
    sentenceEnLiteral: 'You can to pass now same.',
    hint: 'verb: poder (presente: él/ella/usted)',
    frequencyRank: 31
  },
  {
    id: 'w-32',
    spanish: 'podemos',
    english: 'we can (poder)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Juntos ___ resolver este problema.',
    sentenceEn: 'Together we can solve this problem.',
    sentenceEnLiteral: 'Together we can to solve this problem.',
    hint: 'verb: poder (presente: nosotros)',
    frequencyRank: 32
  },

  // 33-35: HACER (to do / to make) - Conjugated
  {
    id: 'w-33',
    spanish: 'hago',
    english: 'I do / I make (hacer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Siempre ___ la cama por la mañana.',
    sentenceEn: 'I always make the bed in the morning.',
    sentenceEnLiteral: 'Always I make the bed by the morning.',
    hint: 'verb: hacer (presente: yo)',
    frequencyRank: 33
  },
  {
    id: 'w-34',
    spanish: 'hace',
    english: 'does / makes / it is (weather) (hacer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Hoy ___ muy buen tiempo.',
    sentenceEn: 'Today the weather is very good.',
    sentenceEnLiteral: 'Today it makes very good weather.',
    hint: 'verb: hacer (presente: él/ella/clima)',
    frequencyRank: 34
  },
  {
    id: 'w-35',
    spanish: 'hizo',
    english: 'did / made (hacer)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'Él ___ un trabajo excelente.',
    sentenceEn: 'He did an excellent job.',
    sentenceEnLiteral: 'He made a job excellent.',
    hint: 'verb: hacer (pretérito: él/ella)',
    frequencyRank: 35
  },

  // 36-38: DECIR (to say / tell) - Conjugated
  {
    id: 'w-36',
    spanish: 'digo',
    english: 'I say / I tell (decir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Siempre te ___ la verdad.',
    sentenceEn: 'I always tell you the truth.',
    sentenceEnLiteral: 'Always to you I say the truth.',
    hint: 'verb: decir (presente: yo)',
    frequencyRank: 36
  },
  {
    id: 'w-37',
    spanish: 'dice',
    english: 'says / tells (decir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Mi amigo ___ que no vendrá hoy.',
    sentenceEn: 'My friend says he will not come today.',
    sentenceEnLiteral: 'My friend says that not will-come today.',
    hint: 'verb: decir (presente: él/ella)',
    frequencyRank: 37
  },
  {
    id: 'w-38',
    spanish: 'dijo',
    english: 'said / told (decir)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'Ella me ___ una noticia sorprendente.',
    sentenceEn: 'She told me surprising news.',
    sentenceEnLiteral: 'She to-me said a news surprising.',
    hint: 'verb: decir (pretérito: él/ella)',
    frequencyRank: 38
  },

  // 39-40: SABER (to know facts/skills) - Conjugated
  {
    id: 'w-39',
    spanish: 'sé',
    english: 'I know (saber)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo no ___ cómo se llama esa calle.',
    sentenceEn: 'I do not know what that street is called.',
    sentenceEnLiteral: 'I not know how itself calls that street.',
    hint: 'verb: saber (presente: yo - with accent)',
    frequencyRank: 39
  },
  {
    id: 'w-40',
    spanish: 'sabe',
    english: 'knows (saber)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿Alguien ___ la respuesta a esta pregunta?',
    sentenceEn: 'Does anyone know the answer to this question?',
    sentenceEnLiteral: 'Anyone knows the answer to this question?',
    hint: 'verb: saber (presente: él/ella)',
    frequencyRank: 40
  },

  // 41-43: VER (to see) - Conjugated
  {
    id: 'w-41',
    spanish: 'veo',
    english: 'I see (ver)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Desde mi ventana ___ el mar.',
    sentenceEn: 'From my window I see the sea.',
    sentenceEnLiteral: 'From my window I see the sea.',
    hint: 'verb: ver (presente: yo)',
    frequencyRank: 41
  },
  {
    id: 'w-42',
    spanish: 've',
    english: 'sees (ver)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Él no ___ bien sin sus gafas.',
    sentenceEn: 'He does not see well without his glasses.',
    sentenceEnLiteral: 'He not sees well without his glasses.',
    hint: 'verb: ver (presente: él/ella)',
    frequencyRank: 42
  },
  {
    id: 'w-43',
    spanish: 'vimos',
    english: 'we saw (ver)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'Ayer ___ una película fantástica.',
    sentenceEn: 'Yesterday we saw a fantastic movie.',
    sentenceEnLiteral: 'Yesterday we saw a movie fantastic.',
    hint: 'verb: ver (pretérito: nosotros)',
    frequencyRank: 43
  },

  // 44-46: DAR (to give) - Conjugated
  {
    id: 'w-44',
    spanish: 'doy',
    english: 'I give (dar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Te ___ las gracias por todo.',
    sentenceEn: 'I give you thanks for everything.',
    sentenceEnLiteral: 'To-you I give the thanks by all.',
    hint: 'verb: dar (presente: yo)',
    frequencyRank: 44
  },
  {
    id: 'w-45',
    spanish: 'da',
    english: 'gives (dar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Ese árbol ___ mucha sombra en verano.',
    sentenceEn: 'That tree gives a lot of shade in summer.',
    sentenceEnLiteral: 'That tree gives much shade in summer.',
    hint: 'verb: dar (presente: él/ella)',
    frequencyRank: 45
  },
  {
    id: 'w-46',
    spanish: 'dio',
    english: 'gave (dar)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'El profesor nos ___ dos semanas más.',
    sentenceEn: 'The teacher gave us two more weeks.',
    sentenceEnLiteral: 'The teacher to-us gave two weeks more.',
    hint: 'verb: dar (pretérito: él/ella)',
    frequencyRank: 46
  },

  // 47-49: PONER (to put) - Conjugated
  {
    id: 'w-47',
    spanish: 'pongo',
    english: 'I put / I place (poner)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Siempre ___ la mesa antes de comer.',
    sentenceEn: 'I always set the table before eating.',
    sentenceEnLiteral: 'Always I put the table before of to eat.',
    hint: 'verb: poner (presente: yo)',
    frequencyRank: 47
  },
  {
    id: 'w-48',
    spanish: 'pone',
    english: 'puts / places (poner)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Ella se ___ la chaqueta porque hace frío.',
    sentenceEn: 'She puts on her jacket because it is cold.',
    sentenceEnLiteral: 'She herself puts the jacket because it makes cold.',
    hint: 'verb: poner (presente: él/ella)',
    frequencyRank: 48
  },
  {
    id: 'w-49',
    spanish: 'puse',
    english: 'I put / I placed (poner)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: '___ las llaves en el cajón.',
    sentenceEn: 'I put the keys in the drawer.',
    sentenceEnLiteral: 'I put the keys in the drawer.',
    hint: 'verb: poner (pretérito: yo)',
    frequencyRank: 49
  },

  // 50-52: HABLAR (to speak) - Conjugated
  {
    id: 'w-50',
    spanish: 'hablo',
    english: 'I speak (hablar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ un poco de español.',
    sentenceEn: 'I speak a little Spanish.',
    sentenceEnLiteral: 'I speak a little of spanish.',
    hint: 'verb: hablar (presente: yo)',
    frequencyRank: 50
  },
  {
    id: 'w-51',
    spanish: 'habla',
    english: 'speaks (hablar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Él ___ tres idiomas con fluidez.',
    sentenceEn: 'He speaks three languages fluently.',
    sentenceEnLiteral: 'He speaks three languages with fluency.',
    hint: 'verb: hablar (presente: él/ella)',
    frequencyRank: 51
  },
  {
    id: 'w-52',
    spanish: 'hablamos',
    english: 'we speak (hablar)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Nosotros ___ de fútbol a menudo.',
    sentenceEn: 'We speak about football often.',
    sentenceEnLiteral: 'We speak of soccer to often.',
    hint: 'verb: hablar (presente: nosotros)',
    frequencyRank: 52
  },

  // 53-55: COMER (to eat) - Conjugated
  {
    id: 'w-53',
    spanish: 'como',
    english: 'I eat (comer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Por las mañanas ___ fruta fresca.',
    sentenceEn: 'In the mornings I eat fresh fruit.',
    sentenceEnLiteral: 'By the mornings I eat fruit fresh.',
    hint: 'verb: comer (presente: yo)',
    frequencyRank: 53
  },
  {
    id: 'w-54',
    spanish: 'come',
    english: 'eats (comer)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Mi perro ___ dos veces al día.',
    sentenceEn: 'My dog eats twice a day.',
    sentenceEnLiteral: 'My dog eats two times to the day.',
    hint: 'verb: comer (presente: él/ella)',
    frequencyRank: 54
  },
  {
    id: 'w-55',
    spanish: 'comimos',
    english: 'we ate (comer)',
    partOfSpeech: 'verb',
    cefr: 'A2',
    sentenceEs: 'El domingo ___ una paella deliciosa.',
    sentenceEn: 'On Sunday we ate a delicious paella.',
    sentenceEnLiteral: 'The sunday we ate a paella delicious.',
    hint: 'verb: comer (pretérito: nosotros)',
    frequencyRank: 55
  },

  // 56-58: VIVIR (to live) - Conjugated
  {
    id: 'w-56',
    spanish: 'vivo',
    english: 'I live (vivir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Yo ___ en un apartamento en el centro.',
    sentenceEn: 'I live in an apartment in the center.',
    sentenceEnLiteral: 'I live in an apartment in the center.',
    hint: 'verb: vivir (presente: yo)',
    frequencyRank: 56
  },
  {
    id: 'w-57',
    spanish: 'vive',
    english: 'lives (vivir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: 'Su familia ___ cerca de la playa.',
    sentenceEn: 'His family lives near the beach.',
    sentenceEnLiteral: 'His family lives near of the beach.',
    hint: 'verb: vivir (presente: él/ella)',
    frequencyRank: 57
  },
  {
    id: 'w-58',
    spanish: 'viven',
    english: 'they live (vivir)',
    partOfSpeech: 'verb',
    cefr: 'A1',
    sentenceEs: '¿Dónde ___ tus padres?',
    sentenceEn: 'Where do your parents live?',
    sentenceEnLiteral: 'Where live your parents?',
    hint: 'verb: vivir (presente: ellos)',
    frequencyRank: 58
  },

  // 59-62: Essential Question Words
  {
    id: 'w-59',
    spanish: 'qué',
    english: 'what',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '¿___ quieres hacer este fin de semana?',
    sentenceEn: 'What do you want to do this weekend?',
    sentenceEnLiteral: 'What want you to to do this weekend?',
    hint: 'question word (with accent)',
    frequencyRank: 59
  },
  {
    id: 'w-60',
    spanish: 'cómo',
    english: 'how',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '¿___ te llamas?',
    sentenceEn: 'What is your name? (How do you call yourself?)',
    sentenceEnLiteral: 'How yourself you call?',
    hint: 'question word (with accent)',
    frequencyRank: 60
  },
  {
    id: 'w-61',
    spanish: 'dónde',
    english: 'where',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '¿___ está el baño, por favor?',
    sentenceEn: 'Where is the bathroom, please?',
    sentenceEnLiteral: 'Where is the bathroom, by favor?',
    hint: 'question word for place',
    frequencyRank: 61
  },
  {
    id: 'w-62',
    spanish: 'cuándo',
    english: 'when',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '¿___ llega tu vuelo?',
    sentenceEn: 'When does your flight arrive?',
    sentenceEnLiteral: 'When arrives your flight?',
    hint: 'question word for time',
    frequencyRank: 62
  },

  // 63-70: High-Frequency Everyday Essentials
  {
    id: 'w-63',
    spanish: 'gracias',
    english: 'thank you / thanks',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: 'Muchas ___ por toda tu ayuda.',
    sentenceEn: 'Many thanks for all your help.',
    sentenceEnLiteral: 'Many thanks by all your help.',
    hint: 'polite expression',
    frequencyRank: 63
  },
  {
    id: 'w-64',
    spanish: 'por favor',
    english: 'please',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: 'La cuenta, ___ .',
    sentenceEn: 'The check, please.',
    sentenceEnLiteral: 'The bill, please.',
    hint: 'polite request expression',
    frequencyRank: 64
  },
  {
    id: 'w-65',
    spanish: 'sí',
    english: 'yes',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '___ , estoy totalmente de acuerdo.',
    sentenceEn: 'Yes, I totally agree.',
    sentenceEnLiteral: 'Yes, I am totally of agreement.',
    hint: 'affirmation (with accent)',
    frequencyRank: 65
  },
  {
    id: 'w-66',
    spanish: 'no',
    english: 'no / not',
    partOfSpeech: 'expression',
    cefr: 'A1',
    sentenceEs: '___ tengo tiempo hoy.',
    sentenceEn: 'I do not have time today.',
    sentenceEnLiteral: 'Not I have time today.',
    hint: 'negation particle',
    frequencyRank: 66
  },
  {
    id: 'w-67',
    spanish: 'muy',
    english: 'very',
    partOfSpeech: 'adverb',
    cefr: 'A1',
    sentenceEs: 'Esta comida está ___ rica.',
    sentenceEn: 'This food is very tasty.',
    sentenceEnLiteral: 'This food is very rich.',
    hint: 'intensifier adverb',
    frequencyRank: 67
  },
  {
    id: 'w-68',
    spanish: 'mucho',
    english: 'a lot / much',
    partOfSpeech: 'adverb',
    cefr: 'A1',
    sentenceEs: 'Estudió ___ para aprobar el examen.',
    sentenceEn: 'He studied a lot to pass the exam.',
    sentenceEnLiteral: 'He studied much for to pass the exam.',
    hint: 'quantity adverb',
    frequencyRank: 68
  },
  {
    id: 'w-69',
    spanish: 'bien',
    english: 'well / fine',
    partOfSpeech: 'adverb',
    cefr: 'A1',
    sentenceEs: 'Todo está muy ___ por aquí.',
    sentenceEn: 'Everything is very well around here.',
    sentenceEnLiteral: 'All is very well around here.',
    hint: 'manner adverb',
    frequencyRank: 69
  },
  {
    id: 'w-70',
    spanish: 'ahora',
    english: 'now',
    partOfSpeech: 'adverb',
    cefr: 'A1',
    sentenceEs: 'Tenemos que salir ___ mismo.',
    sentenceEn: 'We have to leave right now.',
    sentenceEnLiteral: 'We have to exit now same.',
    hint: 'time adverb',
    frequencyRank: 70
  }
];

export function generateExpandedVocabulary(): SpanishWord[] {
  const dataset = [...INITIAL_SPANISH_WORDS];

  const additionalWords: Array<{
    es: string; en: string; pos: PartOfSpeech; level: CEFRLevel;
    sEs: string; sEn: string; hint: string;
  }> = [
    { es: 'hoy', en: 'today', pos: 'noun', level: 'A1', sEs: '___ hace un día hermoso.', sEn: 'Today is a beautiful day.', hint: 'present day' },
    { es: 'mañana', en: 'tomorrow', pos: 'noun', level: 'A1', sEs: 'Nos vemos ___ en clase.', sEn: 'See you tomorrow in class.', hint: 'next day' },
    { es: 'ayer', en: 'yesterday', pos: 'noun', level: 'A1', sEs: '___ fue un día largo.', sEn: 'Yesterday was a long day.', hint: 'past day' },
    { es: 'aquí', en: 'here', pos: 'adverb', level: 'A1', sEs: 'Ven ___ , por favor.', sEn: 'Come here, please.', hint: 'place adverb' },
    { es: 'allí', en: 'there', pos: 'adverb', level: 'A1', sEs: 'El hotel está ___ enfrente.', sEn: 'The hotel is right over there.', hint: 'place adverb' },
    { es: 'siempre', en: 'always', pos: 'adverb', level: 'A1', sEs: 'Él ___ dice la verdad.', sEn: 'He always tells the truth.', hint: 'frequency adverb' },
    { es: 'nunca', en: 'never', pos: 'adverb', level: 'A1', sEs: 'Yo ___ llego tarde.', sEn: 'I never arrive late.', hint: 'negative adverb' },
    { es: 'también', en: 'also / too', pos: 'adverb', level: 'A1', sEs: 'A mí ___ me gusta el café.', sEn: 'I also like coffee.', hint: 'addition adverb' },
    { es: 'tampoco', en: 'neither / not either', pos: 'adverb', level: 'A1', sEs: 'Yo ___ sé la respuesta.', sEn: 'I don’t know the answer either.', hint: 'negative addition' },
    { es: 'casa', en: 'house / home', pos: 'noun', level: 'A1', sEs: 'Voy a mi ___ a descansar.', sEn: 'I am going home to rest.', hint: 'feminine noun (la casa)' },
    { es: 'amigo', en: 'friend', pos: 'noun', level: 'A1', sEs: 'Carlos es mi mejor ___ .', sEn: 'Carlos is my best friend.', hint: 'masculine noun' },
    { es: 'tiempo', en: 'time / weather', pos: 'noun', level: 'A1', sEs: 'No tengo mucho ___ hoy.', sEn: 'I don’t have much time today.', hint: 'masculine noun' },
    { es: 'trabajo', en: 'job / work', pos: 'noun', level: 'A1', sEs: 'Ella tiene un buen ___ .', sEn: 'She has a good job.', hint: 'masculine noun' },
    { es: 'agua', en: 'water', pos: 'noun', level: 'A1', sEs: 'Un vaso de ___ , por favor.', sEn: 'A glass of water, please.', hint: 'noun (el agua)' },
    { es: 'comida', en: 'food / meal', pos: 'noun', level: 'A1', sEs: 'La ___ está muy rica.', sEn: 'The food is very tasty.', hint: 'feminine noun' },
    { es: 'grande', en: 'big / large', pos: 'adjective', level: 'A1', sEs: 'Tienen una casa muy ___ .', sEn: 'They have a very big house.', hint: 'size adjective' },
    { es: 'pequeño', en: 'small / little', pos: 'adjective', level: 'A1', sEs: 'El perro es muy ___ .', sEn: 'The dog is very small.', hint: 'size adjective' },
    { es: 'nuevo', en: 'new', pos: 'adjective', level: 'A1', sEs: 'Me compré un teléfono ___ .', sEn: 'I bought myself a new phone.', hint: 'masculine adjective' },
    { es: 'bueno', en: 'good', pos: 'adjective', level: 'A1', sEs: 'Es un ___ momento para hablar.', sEn: 'It is a good time to talk.', hint: 'quality adjective' },
    { es: 'malo', en: 'bad', pos: 'adjective', level: 'A1', sEs: 'No es un ___ plan.', sEn: 'It is not a bad plan.', hint: 'quality adjective' }
  ];

  additionalWords.forEach((item, index) => {
    dataset.push({
      id: `w-add-${index + 71}`,
      spanish: item.es,
      english: item.en,
      partOfSpeech: item.pos,
      cefr: item.level,
      sentenceEs: item.sEs,
      sentenceEn: item.sEn,
      hint: item.hint,
      frequencyRank: index + 71
    });
  });

  return dataset;
}
