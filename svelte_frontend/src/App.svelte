<script>
  import { onMount } from 'svelte';

  // Quiz state
  let questions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let timeLeft = 1.0;
  let selectedAnswerIndex = null;
  let isAnsweredCorrectly = null;
  let loading = true;
  let error = null;

  // Reactive current question
  $: currentQuestion = questions[currentQuestionIndex];
  $: questionNumber = currentQuestionIndex + 1;

  // Load questions and start timer
  onMount(async () => {
    try {
      const response = await fetch('/questions.json');
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      questions = await response.json();
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
      console.error('Error loading questions:', err);
    }

    // Timer simulation
    const timer = setInterval(() => {
      // Stop timer if question has been answered
      if (selectedAnswerIndex !== null) {
        return;
      }

      timeLeft = Math.max(0, timeLeft - 0.01);

      // Auto advance when time runs out
      if (timeLeft <= 0 && selectedAnswerIndex === null) {
        handleTimeUp();
      }
    }, 100);

    return () => clearInterval(timer);
  });

  function handleAnswerSelected(index) {
    selectedAnswerIndex = index;
    const correct = index === currentQuestion.answer;
    isAnsweredCorrectly = correct;

    if (correct) {
      // Score based on time remaining and difficulty
      const timeBonus = Math.round(timeLeft * 100);
      const difficultyBonus = getDifficultyBonus(currentQuestion.difficulty);
      score += timeBonus + difficultyBonus;
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  }

  function handleTimeUp() {
    selectedAnswerIndex = -1; // Mark as time up
    isAnsweredCorrectly = false;

    setTimeout(() => {
      nextQuestion();
    }, 1000);
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      selectedAnswerIndex = null;
      isAnsweredCorrectly = null;
      timeLeft = 1.0; // Reset timer
    } else {
      // Quiz finished
      alert(`Quiz Complete! Final Score: ${score}`);
    }
  }

  function getDifficultyBonus(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 50;
      case 'medium': return 100;
      case 'hard': return 150;
      case 'expert': return 200;
      default: return 100;
    }
  }

  function getDifficultyColors(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      case 'expert': return 'bg-purple-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  }

  function getProgressColor() {
    if (timeLeft > 0.6) return 'bg-blue-600';
    if (timeLeft > 0.3) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function getButtonColors(index) {
    if (selectedAnswerIndex === index && isAnsweredCorrectly === true) {
      return 'bg-green-500 text-white shadow-lg transform scale-105';
    }
    if (selectedAnswerIndex === index && isAnsweredCorrectly === false) {
      return 'bg-red-500 text-white';
    }
    if (currentQuestion && index === currentQuestion.answer && isAnsweredCorrectly === false) {
      return 'bg-green-500 text-white shadow-lg transform scale-105';
    }
    return 'bg-white text-gray-800 hover:bg-gray-50';
  }

  function getBoxColors(index) {
    if (selectedAnswerIndex === index && isAnsweredCorrectly === true) {
      return 'bg-green-500';
    }
    if (selectedAnswerIndex === index && isAnsweredCorrectly === false) {
      return 'bg-red-500';
    }
    if (currentQuestion && index === currentQuestion.answer && isAnsweredCorrectly === false) {
      return 'bg-green-500';
    }
    return 'bg-blue-600';
  }
</script>

<div class="min-h-screen bg-gray-50 p-5">
  <div class="max-w-2xl mx-auto space-y-6">

    {#if loading}
      <div class="text-center py-12">
        <div class="text-xl font-semibold text-gray-600">Loading questions...</div>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <div class="text-xl font-semibold text-red-600">Error: {error}</div>
        <p class="text-gray-600 mt-2">Make sure you have a questions.json file in your public folder.</p>
      </div>
    {:else if currentQuestion}

      <!-- Score Card -->
      <div class="w-full bg-blue-100 rounded-xl shadow-lg p-4">
        <div class="flex items-center justify-center gap-2">
          <svg class="w-6 h-6 text-blue-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <div class="text-xl font-black text-black">
            Score: {score.toLocaleString()}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-full">
        <div class="flex justify-between mb-1">
          <span class="text-sm text-gray-600">Time Left</span>
          <span class="text-sm text-gray-600">{Math.round(timeLeft * 100)}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
                  class="h-2 rounded-full transition-all duration-100 {getProgressColor()}"
                  style="width: {timeLeft * 100}%"
          ></div>
        </div>
      </div>

      <!-- Question Header -->
      <div class="flex justify-between items-center">
        <span class="text-blue-600 font-semibold">Question {questionNumber} of {questions.length}</span>
        <div class="px-3 py-1 rounded-xl text-xs font-medium {getDifficultyColors(currentQuestion.difficulty)}">
          {currentQuestion.difficulty.toUpperCase()}
        </div>
      </div>

      <!-- Question Card -->
      <div class="w-full bg-white rounded-xl shadow-lg p-5">
        <h2 class="text-xl font-medium text-center text-gray-800 leading-7">
          {currentQuestion.question}
        </h2>
      </div>

      <!-- Answer Options -->
      <div class="space-y-3 pb-8">
        {#each currentQuestion.options as option, index}
          <button
                  on:click={() => selectedAnswerIndex === null && handleAnswerSelected(index)}
                  disabled={selectedAnswerIndex !== null}
                  class="w-full min-h-[56px] p-4 rounded-2xl shadow-md transition-all duration-200 {getButtonColors(index)} {selectedAnswerIndex === null ? 'hover:shadow-lg active:scale-98' : 'cursor-default'}"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center {getBoxColors(index)}">
                <span class="text-white font-black text-sm">{['A', 'B', 'C', 'D'][index]}</span>
              </div>
              <span class="flex-1 text-left text-base leading-5">
              {option}
            </span>
            </div>
          </button>
        {/each}
      </div>

    {/if}

  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }
</style>