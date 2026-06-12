import type { HanziData } from '@/types/global';

function q(
  id: string,
  type: 'match' | 'fill' | 'puzzle',
  question: string,
  options: string[],
  answer: string,
  hint?: string
) {
  return { id, type, question, options, answer, hint };
}

function phrase(
  char: string,
  pinyin: string,
  meaning: string,
  emoji: string,
  examples: string[],
  sentences: string[],
  practiceQ: Array<[string, string, string[], string]>
): HanziData {
  return {
    char,
    level: 'EN4',
    pinyin,
    meaning,
    emoji,
    examples,
    sentences,
    practice: practiceQ.map(([id, question, options, answer]) => q(id, 'match', question, options, answer)),
  };
}

export const EN4_DATA: HanziData[] = [
  phrase('good morning', '/ɡʊd ˈmɔːnɪŋ/', 'A polite hello when the sun rises', '🌅',
    ['say good morning', 'good morning, mom!', 'a good morning walk'],
    ['Good morning, friends!', 'I say good morning to my teacher.'],
    [
      ['en4-gm-1', 'What do you say when you wake up?', ['good morning', 'good night', 'good bye'], 'good morning'],
      ['en4-gm-2', '___, dad!', ['Good morning', 'Good night', 'Good job'], 'Good morning'],
      ['en4-gm-3', 'Sun rises. Time to say:', ['good morning', 'good night', 'hello'], 'good morning'],
    ]),
  phrase('thank you', '/θæŋk juː/', 'A polite way to say you are grateful', '🙏',
    ['thank you very much', 'say thank you', 'thank you for the gift'],
    ['Thank you for the cookie.', 'I say thank you to my friend.'],
    [
      ['en4-ty-1', 'Someone gives you a gift. You say:', ['thank you', 'good bye', 'I’m sorry'], 'thank you'],
      ['en4-ty-2', '___ for helping me.', ['Thank you', 'Good night', 'Good morning'], 'Thank you'],
      ['en4-ty-3', 'A polite way to show thanks:', ['thank you', 'no', 'run'], 'thank you'],
    ]),
  phrase('I love you', '/aɪ lʌv juː/', 'Telling someone you care deeply', '❤️',
    ['I love you, mom.', 'I love you, dad.', 'Say I love you.'],
    ['I love you, grandma.', 'My mom says "I love you" every night.'],
    [
      ['en4-ily-1', 'What do you say to show love?', ['I love you', 'good morning', 'hello'], 'I love you'],
      ['en4-ily-2', '___, my dear friend.', ['I love you', 'Good night', 'The cat'], 'I love you'],
      ['en4-ily-3', 'Three words: I, love, ___', ['you', 'me', 'the'], 'you'],
    ]),
  phrase('how are you', '/haʊ ɑːr juː/', 'A friendly question to ask someone', '🤗',
    ['how are you today?', 'say how are you', 'how are you doing?'],
    ['Hi, how are you?', 'She asks "how are you?".'],
    [
      ['en4-hay-1', 'A friendly way to start a talk:', ['how are you', 'good night', 'no way'], 'how are you'],
      ['en4-hay-2', 'Hello! ___ today?', ['How are you', 'Good bye', 'Eat cake'], 'How are you'],
      ['en4-hay-3', 'how ___ you', ['are', 'is', 'it'], 'are'],
    ]),
  phrase('nice to meet you', '/naɪs tə miːt juː/', 'Said when you meet someone new', '👋',
    ['nice to meet you too', 'say nice to meet you', 'nice to meet you, friend!'],
    ['My name is Tom. Nice to meet you.', 'She says "nice to meet you".'],
    [
      ['en4-ntmy-1', 'First time meeting: you say:', ['nice to meet you', 'good night', 'run away'], 'nice to meet you'],
      ['en4-ntmy-2', 'Hi, I’m Lina. ___.', ['Nice to meet you', 'Good morning', 'I’m hungry'], 'Nice to meet you'],
      ['en4-ntmy-3', 'nice to ___ you', ['meet', 'eat', 'run'], 'meet'],
    ]),
  phrase('good night', '/ɡʊd naɪt/', 'A polite bye before bed', '🌙',
    ['say good night', 'good night, moon!', 'good night, sleep tight'],
    ['Good night, sweet dreams.', 'Mom says good night to me.'],
    [
      ['en4-gn-1', 'Before bed you say:', ['good night', 'good morning', 'hello'], 'good night'],
      ['en4-gn-2', '___, sleep tight!', ['Good night', 'Good morning', 'Thank you'], 'Good night'],
      ['en4-gn-3', 'Stars shine. Time to say:', ['good night', 'good morning', 'no'], 'good night'],
    ]),
  phrase('let’s play', '/lets pleɪ/', 'An invitation to have fun', '🎈',
    ['let’s play a game', 'let’s play together', 'come on, let’s play!'],
    ['Let’s play in the park.', 'Let’s play a fun game.'],
    [
      ['en4-lp-1', 'Invite a friend to a game:', ['let’s play', 'good bye', 'eat dinner'], 'let’s play'],
      ['en4-lp-2', '___ a board game!', ['Let’s play', 'Good night', 'The sun'], 'Let’s play'],
      ['en4-lp-3', 'let ___ play', ['’s', 'is', 'it'], '’s'],
    ]),
  phrase('I’m hungry', '/aɪm ˈhʌŋɡri/', 'Your body wants food', '🍽️',
    ['I’m hungry now', 'are you hungry?', 'hungry for lunch'],
    ['I’m hungry — can we eat?', 'He says he is hungry.'],
    [
      ['en4-ih-1', 'Your tummy rumbles. You say:', ['I’m hungry', 'I’m sleepy', 'I’m happy'], 'I’m hungry'],
      ['en4-ih-2', '___. Let’s have lunch.', ['I’m hungry', 'Good night', 'How are you'], 'I’m hungry'],
      ['en4-ih-3', 'I’m ___.', ['hungry', 'run', 'big'], 'hungry'],
    ]),
  phrase('good job', '/ɡʊd dʒɒb/', 'Praise for something done well', '⭐',
    ['good job!', 'say good job', 'a good job on the test'],
    ['You finished! Good job!', 'Dad says "good job" to me.'],
    [
      ['en4-gj-1', 'Someone does well. You say:', ['good job', 'good night', 'no'], 'good job'],
      ['en4-gj-2', 'You passed! ___.', ['Good job', 'Good morning', 'I’m hungry'], 'Good job'],
      ['en4-gj-3', 'good ___', ['job', 'run', 'eat'], 'job'],
    ]),
  phrase('see you later', '/siː juː ˈleɪtər/', 'A friendly "until next time"', '👋',
    ['see you later, alligator', 'say see you later', 'see you later, friend'],
    ['See you later. Bye bye!', 'I say "see you later" at the door.'],
    [
      ['en4-syl-1', 'A friendly goodbye:', ['see you later', 'good morning', 'eat cake'], 'see you later'],
      ['en4-syl-2', 'Time to go. ___.', ['See you later', 'I love you', 'How are you'], 'See you later'],
      ['en4-syl-3', 'see you ___', ['later', 'today', 'now'], 'later'],
    ]),
  phrase('happy birthday', '/ˈhæpi ˈbɜːθdeɪ/', 'A wish on someone’s special day', '🎂',
    ['happy birthday to you', 'say happy birthday', 'happy birthday card'],
    ['Happy birthday, Tom!', 'I made a happy birthday card.'],
    [
      ['en4-hb-1', 'On a friend’s special day you say:', ['happy birthday', 'good night', 'hello'], 'happy birthday'],
      ['en4-hb-2', '___, Lina! Here’s a gift.', ['Happy birthday', 'Good morning', 'I’m hungry'], 'Happy birthday'],
      ['en4-hb-3', 'happy ___', ['birthday', 'day', 'job'], 'birthday'],
    ]),
  phrase('once upon a time', '/wʌns əˌpɒn ə taɪm/', 'Classic start of a story', '📖',
    ['once upon a time...', 'start a fairy tale with', 'once upon a time there was'],
    ['Once upon a time, there was a little cat.', 'Stories often begin with "once upon a time".'],
    [
      ['en4-out-1', 'Stories often start with:', ['once upon a time', 'good night', 'thank you'], 'once upon a time'],
      ['en4-out-2', '___, a princess lived in a castle.', ['Once upon a time', 'Good morning', 'I love you'], 'Once upon a time'],
      ['en4-out-3', 'once ___ a time', ['upon', 'on', 'in'], 'upon'],
    ]),
  phrase('I can do it', '/aɪ kæn duː ɪt/', 'A brave saying to keep trying', '💪',
    ['I can do it!', 'believe you can do it', 'yes, I can do it!'],
    ['Don’t worry. I can do it.', 'She tells herself "I can do it".'],
    [
      ['en4-icdi-1', 'A brave saying before a test:', ['I can do it', 'good night', 'no way'], 'I can do it'],
      ['en4-icdi-2', 'Try again! ___.', ['I can do it', 'Good morning', 'I’m hungry'], 'I can do it'],
      ['en4-icdi-3', 'I ___ do it', ['can', 'is', 'it'], 'can'],
    ]),
  phrase('the end', '/ðə end/', 'Last words of a story', '🎬',
    ['the end.', 'read until the end', 'happily ever after — the end'],
    ['The story says "the end".', 'And they lived happily. The end.'],
    [
      ['en4-te-1', 'Stories end with:', ['the end', 'good morning', 'hello'], 'the end'],
      ['en4-te-2', 'And they lived happily ever after. ___.', ['The end', 'Thank you', 'Good job'], 'The end'],
      ['en4-te-3', 'the ___', ['end', 'and', 'it'], 'end'],
    ]),
];

export const EN4_CHARS = EN4_DATA.map((h) => h.char);
