import React, { useState } from "react";
import "./App.css";

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animationClass, setAnimationClass] = useState("fade-in");
  const [language, setLanguage] = useState("en");

  // 🌍 Tłumaczenia interfejsu
  const translations = {
    en: {
      title: "Sports Quiz",
      start: "Start Quiz",
      loading: "Loading questions...",
      error: "Failed to load questions. Please try again later.",
      tryAgain: "Try Again",
      next: "Next",
      finish: "Finish",
      finished: "Quiz Finished!",
      correct: "correct",
      restart: "Try Again",
      question: "Question",
      back: "← Back to Home",
    },
    pl: {
      title: "Quiz sportowy",
      start: "Rozpocznij quiz",
      loading: "Ładowanie pytań...",
      error: "Nie udało się pobrać pytań. Spróbuj ponownie później.",
      tryAgain: "Spróbuj ponownie",
      next: "Dalej",
      finish: "Zakończ",
      finished: "Koniec quizu!",
      correct: "poprawnych",
      restart: "Zagraj ponownie",
      question: "Pytanie",
      back: "← Powrót na stronę główną",
    },
  };

  // 🎯 Pobieranie pytań
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    setQuizStarted(false);
    setShowResult(false);
    setQuestions([]);

    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&category=21&type=multiple"
      );
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No questions received");
      }

      const formatted = data.results.map((q) => ({
        question: decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        answers: shuffleArray([
          ...q.incorrect_answers.map(decodeHTML),
          decodeHTML(q.correct_answer),
        ]),
      }));

      setQuestions(formatted);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuizStarted(true);
    } catch (err) {
      console.error(err);
      setError(translations[language].error);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Pomocnicze funkcje
  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleAnswerClick = (answer) => {
    if (!selectedAnswer) {
      setSelectedAnswer(answer);
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentIndex];
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore((prev) => prev + 1);
    }

    setAnimationClass("fade-out");
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setAnimationClass("fade-in");
      } else {
        setShowResult(true);
      }
    }, 400);
  };

  return (
    <div className="quiz-container">
      <div className="header">
        <a href="#" className="back-btn">
          {translations[language].back}
        </a>

        <h1>{translations[language].title}</h1>

        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">🇬🇧 English</option>
          <option value="pl">🇵🇱 Polski</option>
        </select>
      </div>

      {/* EKRAN STARTOWY */}
      {!quizStarted && !loading && !error && !showResult && (
        <button className="start-btn" onClick={fetchQuestions}>
          {translations[language].start}
        </button>
      )}

      {/* ŁADOWANIE */}
      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>{translations[language].loading}</p>
        </div>
      )}

      {/* BŁĄD */}
      {error && (
        <div className="error-screen">
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={fetchQuestions}>
            {translations[language].tryAgain}
          </button>
        </div>
      )}

      {/* PYTANIA */}
      {!loading && quizStarted && !showResult && questions.length > 0 && (
        <div className={`question-card ${animationClass}`}>
          <h3>
            {translations[language].question} {currentIndex + 1} /{" "}
            {questions.length}
          </h3>
          <div className="question-text">
            {questions[currentIndex].question}
          </div>

          <div className="answers-grid">
            {questions[currentIndex].answers.map((answer, i) => (
              <button
                key={i}
                className={`answer-btn ${
                  selectedAnswer
                    ? answer === questions[currentIndex].correct_answer
                      ? "correct"
                      : answer === selectedAnswer
                      ? "wrong"
                      : ""
                    : ""
                } ${selectedAnswer === answer ? "selected" : ""}`}
                onClick={() => handleAnswerClick(answer)}
                disabled={!!selectedAnswer}
              >
                {answer}
              </button>
            ))}
          </div>

          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            {currentIndex + 1 === questions.length
              ? translations[language].finish
              : translations[language].next}
          </button>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* WYNIK */}
      {showResult && (
        <div className="result-card fade-in">
          <h2>{translations[language].finished}</h2>
          <p>
            {score} / {questions.length} {translations[language].correct}
          </p>
          <p>{Math.round((score / questions.length) * 100)}%</p>

          <button
            className="restart-btn"
            onClick={() => window.location.reload()}
          >
            {translations[language].restart}
          </button>
        </div>
      )}
    </div>
  );
}
