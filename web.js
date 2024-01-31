let questionCounter = 0;

function addQuestion() {
    questionCounter++;
    const questionsContainer = document.getElementById('questionsContainer');

    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    const input = document.createElement('input');
    input.type = 'text';
    input.name = `question${questionCounter}`;
    input.placeholder = `Enter Question ${questionCounter}`;
    questionDiv.appendChild(input);

    questionsContainer.appendChild(questionDiv);
}

function displayQuestions() {
    const questionsForm = document.getElementById('questions');
    const questions = questionsForm.querySelectorAll('input[type="text"]');
    const resultContainer = document.getElementById('result');

    resultContainer.innerHTML = '<h2>Your Questions:</h2>';

    questions.forEach((question, index) => {
        const questionText = question.value.trim();
        if (questionText !== '') {
            const questionResult = document.createElement('p');
            questionResult.textContent = `Question ${index + 1}: ${questionText}`;
            resultContainer.appendChild(questionResult);
        }
    });
}
