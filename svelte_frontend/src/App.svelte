<script>
  import { onMount } from 'svelte';
  import { Play, Settings, Check, X, ArrowLeft, Volume2, Home, ThumbsUp } from 'lucide-svelte';

  // Navigation state
  let currentScreen = 'home'; // 'home', 'quiz', 'settings', 'finished', 'loading'

  // Quiz state
  let questions = [];
  let currentQuestionIndex = 0;
  let questionsCorrect = 0;
  let basePoints = 0;
  let timeBonus = 0;
  let timeLeft = 1.0;
  let selectedAnswerIndex = null;
  let isAnsweredCorrectly = null;
  let loading = true;
  let error = null;

  // Reactive total score and percentage
  $: totalScore = basePoints + timeBonus;
  $: percentage = Math.round((questionsCorrect / 10) * 100);
  $: performanceMessage = getPerformanceMessage(percentage);

  // Settings state
  let soundEnabled = true;

  // Loading screen state
  let currentTipIndex = 0;
  let tipInterval = null;

  // Reactive current question
  $: currentQuestion = questions[currentQuestionIndex];
  $: questionNumber = currentQuestionIndex + 1;

  // Load questions when entering quiz
  async function loadQuestions() {
    if (questions.length > 0) return; // Already loaded

    loading = true;
    error = null;

    try {
      const response = await fetch('/questions.json');
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      questions = await response.json();
      questions = shuffleArray(questions);
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
      console.error('Error loading questions:', err);
    }
  }

  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  // Navigation functions
  function showHome() {
    stopTipCycling(); // Clean up any running intervals
    currentScreen = 'home';
  }

  async function showQuiz() {
    // Show loading screen first
    showLoading();

    // Reset quiz state
    currentQuestionIndex = 0;
    questionsCorrect = 0;
    basePoints = 0;
    timeBonus = 0;
    timeLeft = 1.0;
    selectedAnswerIndex = null;
    isAnsweredCorrectly = null;

    // Load questions with simulated delay
    await loadQuestions();

    // Simulate minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Stop tip cycling and show quiz
    stopTipCycling();
    currentScreen = 'quiz';
  }

  function showSettings() {
    currentScreen = 'settings';
  }

  function showFinished() {
    currentScreen = 'finished';
  }

  function showLoading() {
    currentScreen = 'loading';
    currentTipIndex = 0;
    startTipCycling();
  }

  // Loading screen functions
  function startTipCycling() {
    const tips = [
      "Every question is an opportunity to learn",
      "Read each question carefully",
      "But be quick!",
      "Trust your first instinct"
    ];

    tipInterval = setInterval(() => {
      currentTipIndex = (currentTipIndex + 1) % tips.length;
    }, 2000);
  }

  function stopTipCycling() {
    if (tipInterval) {
      clearInterval(tipInterval);
      tipInterval = null;
    }
  }

  // Settings functions
  function toggleSound() {
    soundEnabled = !soundEnabled;
  }

  function handleAnswerSelected(index) {
    selectedAnswerIndex = index;
    const correct = index === currentQuestion.answer;
    isAnsweredCorrectly = correct;

    if (correct) {
      // Increment questions correct
      questionsCorrect++;

      // Add base points based on difficulty
      const difficultyPoints = getDifficultyPoints(currentQuestion.difficulty);
      basePoints += difficultyPoints;

      // Add time bonus based on speed only
      const speedBonus = Math.round(timeLeft * 50); // Max 50 points for speed
      timeBonus += speedBonus;
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
    if (currentQuestionIndex < 9) { // Stop at 10 questions (0-9)
      currentQuestionIndex++;
      selectedAnswerIndex = null;
      isAnsweredCorrectly = null;
      timeLeft = 1.0; // Reset timer
    } else {
      // Quiz finished after 10 questions - show results screen
      showFinished();
    }
  }

  function getDifficultyPoints(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 50;
      case 'medium': return 100;
      case 'hard': return 150;
      case 'expert': return 200;
      default: return 100;
    }
  }

  function getPerformanceMessage(percentage) {
    if (percentage >= 90) return "🏆 Excellent! Python Master!";
    if (percentage >= 80) return "🎉 Great job! Well done!";
    if (percentage >= 70) return "👍 Good work! Keep it up!";
    if (percentage >= 60) return "📚 Not bad! Study more!";
    return "💪 Keep practicing! You'll get there!";
  }

  function getDifficultyColors(difficulty) {
    switch (difficulty.towerCase()) {
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

  // Timer management and cleanup
  onMount(() => {
    const timer = setInterval(() => {
      // Only run timer if on quiz screen and question not answered
      if (currentScreen !== 'quiz' || selectedAnswerIndex !== null) {
        return;
      }

      timeLeft = Math.max(0, timeLeft - 0.01);

      // Auto advance when time runs out
      if (timeLeft <= 0 && selectedAnswerIndex === null) {
        handleTimeUp();
      }
    }, 100);

    // Cleanup function
    return () => {
      clearInterval(timer);
      stopTipCycling();
    };
  });
</script>

<div class="min-h-screen">

  {#if currentScreen === 'home'}
    <!-- Home Screen -->
    <div class="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">

      <!-- Decorative Background Circles -->
      <div class="absolute -top-12 -left-12 w-44 h-44 bg-blue-600 bg-opacity-10 rounded-full"></div>
      <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500 bg-opacity-15 rounded-full"></div>
      <div class="absolute top-36 -right-5 w-20 h-20 bg-green-500 bg-opacity-12 rounded-full"></div>

      <!-- Main Content -->
      <div class="flex flex-col items-center justify-center min-h-screen p-8">

        <!-- Header Card -->
        <div class="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 mb-12">
          <div class="flex flex-col items-center">

            <!-- App Icon -->
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg flex items-center justify-center mb-4">
              <Check class="w-10 h-10 text-white" />
            </div>

            <!-- App Title -->
            <h1 class="text-3xl font-bold text-gray-800 text-center mb-2">
              Python Quiz
            </h1>

            <!-- Subtitle -->
            <p class="text-gray-600 text-center text-lg">
              Challenge your knowledge!
            </p>

          </div>
        </div>

        <!-- Action Buttons -->
        <div class="w-full max-w-md space-y-4">

          <!-- Start Quiz Button -->
          <button
                  on:click={showQuiz}
                  class="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 active:scale-98"
          >
            <Play class="w-7 h-7 fill-white" />
            <span class="text-lg font-bold">Start Quiz</span>
          </button>

          <!-- Settings Button -->
          <button
                  on:click={showSettings}
                  class="w-full h-16 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 active:scale-98"
          >
            <Settings class="w-6 h-6" />
            <span class="text-lg font-medium">Settings</span>
          </button>

        </div>

      </div>
    </div>

  {:else if currentScreen === 'settings'}
    <!-- Settings Screen -->
    <div class="min-h-screen bg-gray-50">

      <!-- Top App Bar -->
      <div class="bg-white shadow-sm">
        <div class="max-w-2xl mx-auto px-4 py-3">
          <div class="flex items-center">
            <button
                    on:click={showHome}
                    class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft class="w-6 h-6 text-gray-700" />
            </button>
            <h1 class="text-xl font-medium text-gray-900 ml-2">Settings</h1>
          </div>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="max-w-2xl mx-auto p-4">

        <!-- Audio Settings Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4">

            <!-- Section Header -->
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Audio</h2>

            <!-- Sound Effects Toggle -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-6 h-6 mr-3 text-blue-600">
                  {#if soundEnabled}
                    <Check class="w-6 h-6" />
                  {:else}
                    <X class="w-6 h-6" />
                  {/if}
                </div>
                <div>
                  <div class="text-base font-medium text-gray-900">Sound Effects</div>
                  <div class="text-sm text-gray-500">
                    {soundEnabled ? 'On' : 'Off'}
                  </div>
                </div>
              </div>

              <!-- Toggle Switch -->
              <button
                      on:click={toggleSound}
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {soundEnabled ? 'bg-blue-600' : 'bg-gray-200'}"
              >
              <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {soundEnabled ? 'translate-x-6' : 'translate-x-1'}"
              />
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>

  {:else if currentScreen === 'loading'}
    <!-- Loading Screen -->
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div class="text-center p-8">

        <!-- Animated Loading Indicator -->
        <div class="relative mb-8 flex justify-center">
          <!-- Outer rotating ring -->
          <div class="relative w-20 h-20">
            <!-- Background circle -->
            <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <!-- Animated arc -->
            <div class="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>

            <!-- Inner progress indicator -->
            <div class="absolute top-2 left-2 w-16 h-16 border-3 border-gray-300 border-t-blue-400 rounded-full animate-spin" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
          </div>

          <!-- Pulsing overlay effect -->
          <div class="absolute inset-0 w-20 h-20 border-2 border-blue-300 rounded-full animate-pulse opacity-30"></div>
        </div>

        <!-- Main loading text -->
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Loading Quiz...</h2>

        <!-- Animated tips -->
        <div class="mb-6 h-12 flex items-center justify-center">
          {#key currentTipIndex}
            <p class="text-gray-600 text-center px-4 animate-fade-in">
              💡 {["Every question is an opportunity to learn", "Read each question carefully", "But be quick!", "Trust your first instinct"][currentTipIndex]}
            </p>
          {/key}
        </div>

        <!-- Progress dots -->
        <div class="flex justify-center gap-2">
          {#each Array(4) as _, index}
            <div
                    class="w-2 h-2 rounded-full transition-all duration-300 {index === currentTipIndex ? 'bg-blue-600' : 'bg-gray-300'}"
            ></div>
          {/each}
        </div>

      </div>
    </div>

  {:else if currentScreen === 'quiz'}
    <!-- Quiz Screen -->
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
            <button
                    on:click={showHome}
                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        {:else if currentQuestion}

          <!-- Back Button -->
          <div class="flex items-center mb-6">
            <button
                    on:click={showHome}
                    class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft class="w-6 h-6" />
            </button>
          </div>

          <!-- Score Card -->
          <div class="w-full bg-blue-100 rounded-xl shadow-lg p-4">
            <div class="flex items-center justify-center gap-2">
              <div class="text-center">
                <div class="text-lg font-black text-black">
                  Total: {totalScore.toLocaleString()}
                </div>
                <div class="text-sm text-gray-600">
                  Correct: {questionsCorrect} | Difficulty Points: {basePoints} | Time Bonus: {timeBonus}
                </div>
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
            <span class="text-blue-600 font-semibold">Question {questionNumber} of 10</span>
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

  {:else if currentScreen === 'finished'}
    <!-- Finished Screen -->
    <div class="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">

      <!-- Decorative Background Circles -->
      <div class="absolute -top-12 -left-12 w-44 h-44 bg-blue-600 bg-opacity-10 rounded-full"></div>
      <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500 bg-opacity-15 rounded-full"></div>
      <div class="absolute top-36 -right-5 w-20 h-20 bg-green-500 bg-opacity-12 rounded-full"></div>

      <!-- Main Content -->
      <div class="flex flex-col items-center justify-center min-h-screen p-8">

        <!-- Results Card -->
        <div class="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 mb-12">
          <div class="flex flex-col items-center">

            <!-- Trophy Icon -->
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg flex items-center justify-center mb-6">
              <ThumbsUp class="w-10 h-10 text-white" />
            </div>

            <!-- Title -->
            <h1 class="text-3xl font-bold text-gray-800 text-center mb-2">
              Quiz Complete!
            </h1>

            <!-- Performance Message -->
            <p class="text-blue-600 text-center text-lg font-medium mb-4">
              {performanceMessage}
            </p>

            <!-- Score Label -->
            <p class="text-gray-600 text-center text-lg mb-4">
              Your Results
            </p>

            <!-- Score Breakdown -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Questions Correct: </span>
                <span class="font-semibold text-gray-800">{questionsCorrect}/10 ({percentage}%)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Base Points:</span>
                <span class="font-semibold text-gray-800">{(questionsCorrect * 100).toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Time Bonus:</span>
                <span class="font-semibold text-gray-800">{timeBonus.toLocaleString()}</span>
              </div>
              <div class="border-t pt-2 flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-800">Total Score:</span>
                <span class="text-2xl font-black text-blue-600">{totalScore.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Action Button -->
        <div class="w-full max-w-md">
          <!-- Finished Button -->
          <button
                  on:click={showHome}
                  class="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 active:scale-98"
          >
            <Home class="w-7 h-7" />
            <span class="text-lg font-bold">Finished</span>
          </button>
        </div>

      </div>
    </div>

  {/if}

</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }

  /* Custom spinning animations */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 2s linear infinite;
  }

  /* Pulse animation */
  @keyframes pulse {
    0%, 100% {
      transform: scale(0.95);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .animate-pulse {
    animation: pulse 1s ease-in-out infinite;
  }
</style>