document.addEventListener('DOMContentLoaded', () => {
    const questions = JSON.parse(localStorage.getItem('quizQuestions') || '[]');
    if (!questions.length) {
        alert('No quiz found. Please start a quiz from the homepage.');
        window.location.href = 'index.html';
        return;
    }

    let currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex')) || 0;
    let score = parseInt(localStorage.getItem('score')) || 0;

    const questionTextElement = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const timeElement = document.getElementById('time');
    const feedbackElement = document.getElementById('feedback');
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressBarContainer = document.querySelector('.quiz-progress-bar-container');

    let timer, timeLeft = 15;
    const total = questions.length;
    totalQuestionsElement.textContent = total;
    currentQuestionElement.textContent = currentQuestionIndex + 1;

    displayQuestion();
    startTimer();

    function displayQuestion() {
        const current = questions[currentQuestionIndex];
        questionTextElement.textContent = current.question;
        optionsContainer.innerHTML = '';
        feedbackElement.classList.add('hidden');
        feedbackElement.textContent = '';

        const labels = ['A', 'B', 'C', 'D'];

        current.options.forEach((option, idx) => {
            const div = document.createElement('div');
            div.className = 'option';
            div.textContent = option;
            div.setAttribute('data-label', labels[idx]);
            div.dataset.index = idx;
            div.addEventListener('click', selectOption);
            optionsContainer.appendChild(div);
        });

        updateProgressBar();
    }

    function updateProgressBar() {
        const percent = ((currentQuestionIndex) / (questions.length - 1)) * 100;
        progressBar.style.width = `${Math.min(percent, 100)}%`;
    }

    function selectOption(e) {
        clearInterval(timer);
        const selected = parseInt(e.target.dataset.index);
        const correct = questions[currentQuestionIndex].correctAnswer;
        const options = document.querySelectorAll('.option');

        options.forEach(opt => {
            opt.removeEventListener('click', selectOption);
            opt.style.cursor = 'default';
        });

        if (selected === correct) {
            e.target.classList.add('correct');
            score++;
        } else {
            e.target.classList.add('incorrect');
            options[correct].classList.add('correct');
        }

        localStorage.setItem('score', score);

        setTimeout(() => {
            currentQuestionIndex++;
            localStorage.setItem('currentQuestionIndex', currentQuestionIndex);

            if (currentQuestionIndex < questions.length) {
                timeLeft = 15;
                displayQuestion();
                startTimer();
                currentQuestionElement.textContent = currentQuestionIndex + 1;
            } else {
                showResults();
            }
        }, 2000);
    }

    function startTimer() {
        timeLeft = 15;
        updateTimeDisplay();

        timer = setInterval(() => {
            timeLeft--;
            updateTimeDisplay();

            if (timeLeft === 0) {
                clearInterval(timer);
                const options = document.querySelectorAll('.option');
                options.forEach(opt => opt.removeEventListener('click', selectOption));
                options[questions[currentQuestionIndex].correctAnswer].classList.add('correct');

                setTimeout(() => {
                    currentQuestionIndex++;
                    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);

                    if (currentQuestionIndex < questions.length) {
                        displayQuestion();
                        startTimer();
                        currentQuestionElement.textContent = currentQuestionIndex + 1;
                    } else {
                        showResults();
                    }
                }, 2000);
            }
        }, 1000);
    }

    function updateTimeDisplay() {
        timeElement.textContent = timeLeft;
        const sText = timeElement.parentElement;
        if (timeLeft <= 5) {
            timeElement.style.color = 'red';
            sText.style.color = 'red';
        } else {
            timeElement.style.color = '#2c3e50';
            sText.style.color = '#2c3e50';
        }
    }


    function showResults() {
        localStorage.clear();
        questionTextElement.textContent = '🎉 Quiz Completed!';
        optionsContainer.innerHTML = `
            <div class="quiz-result" >
                <h2>🎯 Your Score: ${Math.round((score / questions.length) * 100)} / 100</h2>
                <p class="correct">✅ Correct Answers: ${score}</p>
                <p class="incorrect">❌ Incorrect Answers: ${questions.length - score}</p>
                <button onclick="window.location.href='index.html'">Try Again</button>
            </div>
        `;
        timeElement.textContent = '0';
        feedbackElement.classList.add('hidden');
    
        if (progressBarContainer) {
            progressBarContainer.style.display = 'none';
        }
    
        document.querySelector('.quiz-header').style.display = 'none';
    }
    
});
