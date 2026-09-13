export const glossary = [
  { term: '純米', aliases: ['純米酒', '純米'], category: '原料' },
  { term: '吟醸', aliases: ['大吟醸', '吟醸酒', '吟醸'], category: '造り' },
  { term: '純米吟醸', aliases: ['純米大吟醸', '純米吟醸'], category: '特定名称' },
  { term: '本醸造', aliases: ['特別本醸造', '本醸造'], category: '特定名称' },
  { term: '生酒', aliases: ['生原酒', '生酒', 'なまざけ'], category: '保存' },
  { term: '生詰め', aliases: ['ひやおろし', '生詰め'], category: '造り' },
  { term: '生貯蔵酒', aliases: ['生貯蔵酒'], category: '造り' },
  { term: '原酒', aliases: ['無加水', '原酒'], category: '仕上げ' },
  { term: '生酛', aliases: ['生もと', '生酛'], category: '酒母' },
  { term: '山廃', aliases: ['山廃仕込', '山廃仕込み', '山廃'], category: '酒母' },
  { term: '精米歩合', aliases: ['精米歩合'], category: '数値' },
  { term: '日本酒度', aliases: ['日本酒度'], category: '数値' },
  { term: '酸度', aliases: ['酸度'], category: '数値' },
  { term: '無濾過', aliases: ['無ろ過', '無濾過'], category: '仕上げ' },
  { term: 'にごり酒', aliases: ['うすにごり', 'おりがらみ', 'にごり酒'], category: '仕上げ' },
  { term: '火入れ', aliases: ['一回火入れ', '火入れ'], category: '保存' },
  { term: '酒米', aliases: ['酒造好適米', '酒米', '山田錦', '五百万石', '雄町'], category: '原料' },
  { term: 'BY', aliases: ['BY'], category: '表示' }
]

export function findTerms(text) {
  const normalized = text.replace(/\s+/g, '')
  return glossary
    .map(entry => ({ entry, alias: entry.aliases.find(alias => normalized.toLowerCase().includes(alias.toLowerCase())) }))
    .filter(item => item.alias)
}
