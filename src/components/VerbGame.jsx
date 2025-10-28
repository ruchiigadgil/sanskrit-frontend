import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, tokenManager } from "../services/api";

const TOTAL_QUESTIONS = 5;

const VerbGame = ({ score: propScore }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const globalScore = location.state?.score ?? propScore ?? 0;
  const [sessionScore, setSessionScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [hint, setHint] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [qCount, setQCount] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [error, setError] = useState(null);

  const isValidSanskritForm = (form) => {
    if (!form || typeof form !== "string") return false;
    return /^[\u0900-\u097F]+$/.test(form);
  };

  const updateScore = async (gameName, scoreIncrement) => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error("No token found, please log in again");
      }
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.id) {
        throw new Error("No user data found, please log in again");
      }
      const response = await authAPI.updateScore({
        user_id: userData.id,
        score: scoreIncrement,
        game_type: gameName,
      });
      return response.score;
    } catch (err) {
      setError(err.message || "Failed to update score");
      throw err;
    }
  };

  const shuffleArray = useMemo(() => {
    return (arr) => [...arr].sort(() => Math.random() - 0.5);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const fetchedQuestions = [];
      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const data = await authAPI.getVerbGame();
        if (
          !data.sentence ||
          !data.correct ||
          !isValidSanskritForm(data.correct) ||
          !data.options ||
          !Array.isArray(data.options) ||
          data.options.length < 3 ||
          data.options.some((opt) => !isValidSanskritForm(opt))
        ) {
          console.warn(`Invalid question data for question ${i + 1}:`, data);
          continue;
        }
        const validOptions = data.options.filter(
          (opt) => opt !== data.correct && isValidSanskritForm(opt)
        );
        if (validOptions.length < 2) {
          console.warn(
            `Insufficient valid distractors for question ${i + 1}:`,
            validOptions
          );
          continue;
        }
        const allOptions = shuffleArray([
          data.correct,
          ...validOptions.slice(0, 2),
        ]);
        fetchedQuestions.push({
          sentence: data.sentence,
          correct: data.correct,
          options: allOptions,
          hint: data.hint || "No hint available",
          explanation: data.explanation || "No explanation available",
        });
      }
      if (fetchedQuestions.length === 0) {
        throw new Error("No valid questions received from server");
      }
      console.log(
        "Processed questions:",
        JSON.stringify(fetchedQuestions, null, 2)
      );
      setQuestions(fetchedQuestions);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error.message, error.stack);
      setQuestions([]);
      setResult("❌ Failed to load questions. Using mock data.");
      setError("Failed to load questions. Using mock data.");
      const mockQuestion = {
        sentence: "रामः _____",
        correct: "गच्छति",
        options: ["गच्छति", "गच्छतः", "गच्छन्ति"],
        hint: "Subject 'रामः' is Third person singular in present tense.",
        explanation:
          "The verb 'गच्छति' is the correct form for third person singular in present tense.",
      };
      setQuestions([mockQuestion]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only reset score and fetch questions on initial mount or when restarting
    localStorage.removeItem("verbGameScore");
    setSessionScore(0);
    fetchQuestions();
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    if (roundFinished) {
      localStorage.setItem("verbGameScore", sessionScore.toString());
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.id) {
        authAPI
          .saveScore({
            user_id: userData.id,
            score: sessionScore,
          })
          .catch((err) => {
            console.error("Failed to save final score:", err);
            setError("Failed to save final score");
          });
      }
      console.log("Final sessionScore saved:", sessionScore); // Debug log
    }
  }, [roundFinished, sessionScore]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (!selected || !currentQuestion) return;
    setSubmitLoading(true);

    if (selected === currentQuestion.correct) {
      setResult(`✅ Correct!\n${currentQuestion.explanation}`);
      setHint("");
      if (attempt === 0) {
        setSessionScore((prev) => {
          const newScore = prev + 1;
          console.log("Updated sessionScore:", newScore); // Debug log
          return newScore;
        });
        try {
          await updateScore("verb_game", 1);
        } catch (err) {
          console.error("Score update failed:", err);
        }
      }
      setShowNext(true);
    } else {
      const nextAttempt = attempt + 1;
      setAttempt(nextAttempt);

      if (nextAttempt === 1) {
        setResult("❌ Wrong! Try again.");
      } else {
        setResult(
          `❌ Wrong again! Correct answer: ${currentQuestion.correct}\n${currentQuestion.explanation}`
        );
        setHint(`💡 ${currentQuestion.hint}`);
        setShowNext(true);
      }
    }
    setSubmitLoading(false);
  };

  const handleNext = () => {
    if (qCount + 1 === TOTAL_QUESTIONS) {
      setQCount(TOTAL_QUESTIONS);
      setRoundFinished(true);
    } else {
      setQCount((prev) => prev + 1);
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected("");
      setResult("");
      setHint("");
      setAttempt(0);
      setShowNext(false);
    }
  };

  const handlePlayAgain = () => {
    setSessionScore(0);
    setQCount(0);
    setCurrentQuestionIndex(0);
    setRoundFinished(false);
    localStorage.removeItem("verbGameScore");
    fetchQuestions();
  };

  return (
    <div className="verb-game-wrapper">
      <div className="verb-card">
        <h2 className="game-title">Fill in the Verb</h2>

        <div className="controls">
          <button
            className="back-btn"
            onClick={() =>
              navigate("/dashboard", {
                state: { score: globalScore + sessionScore },
              })
            }
          >
            ← Back to Dashboard
          </button>
          <button
            className="back-btn"
            onClick={() => navigate("/learning-module")}
          >
            Back to Learning
          </button>
        </div>

        {!roundFinished && (
          <div className="info-panel">
            <div className="question-count">
              Question {qCount + 1} / {TOTAL_QUESTIONS}
            </div>
            <div className="session-score">Score: {sessionScore}</div>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {loading ? (
          <div className="sentence-box">Loading questions...</div>
        ) : roundFinished ? (
          <div>
            <p className="result" style={{ fontSize: "1.3rem" }}>
              Final Score: {sessionScore} / {TOTAL_QUESTIONS}
            </p>
            <button className="submit-btn" onClick={handlePlayAgain}>
              Play Again
            </button>
          </div>
        ) : currentQuestion ? (
          <>
            <div className="sentence-box">{currentQuestion.sentence}</div>

            <div className="options">
              {currentQuestion.options.map((opt, index) => (
                <label key={`${opt}-${index}`} className="option">
                  <input
                    type="radio"
                    name="verb"
                    value={opt}
                    checked={selected === opt}
                    onChange={() => setSelected(opt)}
                    disabled={submitLoading}
                  />
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>

            {!showNext && (
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!selected || submitLoading}
              >
                {submitLoading
                  ? "Processing..."
                  : attempt === 1
                  ? "Try Again"
                  : "Submit"}
              </button>
            )}

            {result && <p className="result">{result}</p>}
            {hint && <p className="result hint">{hint}</p>}

            {showNext && (
              <button className="next-btn" onClick={handleNext}>
                Next
              </button>
            )}
          </>
        ) : (
          <p>⚠️ No question available.</p>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

          body {
            margin: 0;
            font-family: 'Noto Sans Devanagari', sans-serif;
            background: linear-gradient(135deg, #d76d2b, #f0c14b);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }

          .verb-game-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
          }

          .verb-card {
            background: linear-gradient(to bottom right, #fff8e1, #ffe4b5);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            width: 100%;
            max-width: 700px;
            color: #2c2c2c;
            border: 1px solid rgba(0, 0, 0, 0.1);
          }

          .game-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #2c2c2c;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .controls {
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .back-btn {
            background-color: #cd853f;
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: background-color 0.3s, transform 0.2s;
          }

          .back-btn:hover {
            background-color: #b86b2c;
            transform: scale(1.05);
          }

          .info-panel {
            margin: 1rem 0 1.5rem 0;
            padding: 1rem;
            background-color: rgba(205, 133, 63, 0.15);
            border-radius: 10px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            gap: 1rem;
          }

          .question-count, .session-score {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c2c2c;
          }

          .error-message {
            margin-top: 1rem;
            color: #dc2626;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .sentence-box {
            font-size: 1.4rem;
            padding: 1.2rem;
            background-color: #fffdf5;
            border: 2px solid #ffd700;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            color: #2c2c2c;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            width: 100%;
          }

          .option {
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #2c2c2c;
            padding: 0.8rem 1rem;
            border: 2px solid #cd853f;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: rgba(255, 255, 255, 0.5);
          }

          .option:hover {
            background-color: rgba(205, 133, 63, 0.2);
            transform: translateX(5px);
          }

          .option input[type="radio"] {
            cursor: pointer;
          }

          .option-text {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 1.2rem;
          }

          .submit-btn,
          .next-btn {
            background-color: #cd853f;
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            margin: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .submit-btn:hover:not(:disabled),
          .next-btn:hover {
            background-color: #b86b2c;
            transform: scale(1.05);
          }

          .submit-btn:disabled {
            background-color: #d3d3d3;
            cursor: not-allowed;
            transform: none;
          }

          .result {
            margin-top: 1rem;
            padding: 1rem;
            white-space: pre-wrap;
            font-weight: 600;
            color: #2c2c2c;
            font-size: 1rem;
            line-height: 1.6;
            background-color: rgba(205, 133, 63, 0.1);
            border-radius: 8px;
          }

          .hint {
            color: #e67e22;
            font-style: italic;
          }

          @media (max-width: 600px) {
            .verb-card {
              padding: 1.5rem;
            }
            .game-title {
              font-size: 1.5rem;
            }
            .sentence-box {
              font-size: 1.2rem;
              padding: 1rem;
            }
            .option {
              font-size: 1rem;
              padding: 0.6rem 0.8rem;
            }
            .controls {
              flex-direction: column;
            }
            .submit-btn, .next-btn {
              padding: 0.6rem 1.5rem;
              font-size: 0.9rem;
            }
            .info-panel {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VerbGame;
