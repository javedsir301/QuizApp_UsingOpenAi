document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startQuiz');
    const topicInput = document.getElementById('topicInput');
    const loadingDiv = document.getElementById('loading');

    startButton.addEventListener('click', async () => {
        const topic = topicInput.value.trim();

        if (!topic) {
            alert('Please enter a topic');
            return;
        }

        startButton.disabled = true;
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch('${process.env.REACT_APP_API_BACKEND}/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) throw new Error('Server error');

            const questions = await response.json();

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('No questions returned from the server');
            }

            localStorage.setItem('quizQuestions', JSON.stringify(questions));
            localStorage.setItem('currentQuestionIndex', '0');
            localStorage.setItem('score', '0');

            window.location.href = 'quiz.html';
        } catch (err) {
            console.error('Error:', err.message);
            alert('Failed to generate quiz. Please try a different topic.');
        } finally {
            startButton.disabled = false;
            loadingDiv.classList.add('hidden');
        }
    });

    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startButton.click();
    });
});
