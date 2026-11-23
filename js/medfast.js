const fold = document.querySelector('#the-med-fast');
const examples = {
  soap: {
    question: 'No exercício, a pessoa relata febre. Isso entra no Objetivo?',
    answer: 'O relato entra em Subjetivo. O exercício informa alguma temperatura medida?',
    tag: 'CONTEXTO ANTES DA CONCLUSÃO',
    insight: 'A conversa ajuda a distinguir o que foi relatado do que foi medido.'
  },
  study: {
    question: 'Quero revisar o método SOAP. Por onde começo?',
    answer: 'Podemos começar pela estrutura: Subjetivo, Objetivo, Avaliação e Plano. Você prefere entender cada parte ou organizar um relato de exemplo?',
    tag: 'SEU ESTUDO, NO SEU RITMO',
    insight: 'Você escolhe o próximo passo e aprofunda o assunto na mesma conversa.'
  }
};
fold?.querySelectorAll('[data-fast-example]').forEach(button => {
  button.addEventListener('click', () => {
    const example = examples[button.dataset.fastExample];
    if (!example) return;
    fold.querySelectorAll('[data-fast-example]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const [key, value] of Object.entries(example)) fold.querySelector(`[data-fast-${key}]`).textContent = value;
  });
});
