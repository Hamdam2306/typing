const WORDS = ['the','few', 'it', 'but', 'during', 'also', 'call', 'govern', 'who', 'when', 'back', 'own', 'too', 'still', 'child', 'have', 'back', 'follow', 'thing', 'line', 'good', 'both', 'against', 'child', 'there', 'number', 'line', 'head', 'one', 'person', 'feel', 'it', 'take', 'number', 'each', 'order', 'to', 'help', 'also','many', 'face', 'number', 'at', 'here', 'over', 'against', 'life', 'also', 'child', 'for', 'time', 'down', 'it', 'to', 'here', 'how', 'change', 'general', 'line', 'how', 'only', 'home', 'late', 'child', 'become', 'eye', 'not', 'then', 'than', 'little', 'to', 'world', 'it', 'one', 'just', 'from', 'own', 'be', 'of', 'he', 'day', 'set', 'house', 'fact', 'like', 'and', 'need', 'there', 'stand', 'long', 'time', 'out', 'before', 'most', 'some', 'phone', 'cat', 'many', 'cost', 'tea', 'size', 'world', 'need', 'food', 'say', 'would', 'right', 'set', 'could', 'down', 'can', 'about', 'course', 'we', 'number', 'develop' , 'only', 'man', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'to', 'run', 'feel', 'because', 'if', 'line', 'she', 'open', 'if', 'back', 'show', 'out', 'year', 'world', 'call', 'more', 'such', 'as', 'fruit', 'charge', 'show', 'more', 'or', 'few', 'face', 'too', 'world', 'into', 'where', 'part', 'out', 'people', 'little', 'or', 'very', 'post', 'eye', 'work', 'get', 'we', 'face', 'tell', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'time', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these', 'know', 'see', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'back', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'place', 'little', 'world', 'very', 'still', 'nation', 'hand', 'old', 'life', 'tell', 'write', 'become', 'here', 'show', 'house', 'both', 'between', 'need', 'mean', 'call', 'develop', 'under', 'last', 'right', 'move', 'thing', 'general', 'school', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off', 'child', 'few', 'small', 'since', 'against', 'ask', 'late', 'home', 'interest', 'large', 'person', 'end', 'open', 'public', 'follow', 'during', 'present', 'without', 'again', 'hold', 'govern', 'around', 'possible', 'head', 'consider', 'word', 'program', 'problem', 'however', 'lead', 'system', 'set', 'order', 'eye', 'plan', 'run', 'keep', 'face', 'fact', 'group', 'play', 'stand', 'increase', 'early', 'course', 'change', 'help', 'line'];


// let str = "it but during also call govern who when back own too still child have back follow thing line good both against child there number line head one person feel it take number each order to help also"
// let wordss = str.split(" ")

// let arr = []

// for(let i = 0; i < wordss.length; i++){
//   arr.push(`${wordss[i]}`)
// }
// console.log(arr)

export const generateWord = (count: number = 40): string[] => {
  return Array.from({ length: count }, () => {
    const index = Math.floor(Math.random() * WORDS.length);
    return WORDS[index];
  });
};
