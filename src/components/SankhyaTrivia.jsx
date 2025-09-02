
import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, tokenManager } from "../services/api";

const TOTAL_QUESTIONS = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // 500ms delay for retries

const initialState = {
  sentence: null,
  guess: { person: "", number: "" },
  result: "",
  showNext: false,
  showHint: false,
  wrongAttempts: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        ...state,
        sentence: action.payload,
        guess: { person: "", number: "" },
        result: "",
        showNext: false,
        showHint: false,
        wrongAttempts: 0,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        sentence: null,
        result: `❌ Failed to load sentence: ${action.payload}`,
      };
    case "UPDATE_GUESS":
      return { ...state, guess: { ...state.guess, ...action.payload } };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        result: "✅ Correct!",
        showNext: true,
        showHint: false,
        wrongAttempts: 0,
      };
    case "SUBMIT_FAIL":
      return {
        ...state,
        result: action.payload.join("\n"),
        showNext: false,
        wrongAttempts: state.wrongAttempts + 1,
      };
    case "SHOW_HINT":
      return {
        ...state,
        showHint: true,
        result: action.payload,
      };
    default:
      return state;
  }
};

const SankhyaTrivia = ({ score: propScore }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [qCount, setQCount] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [sentences, setSentences] = useState([]);
  const { sentence, guess, result, showNext, showHint, wrongAttempts } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const globalScore = location.state?.score ?? propScore ?? 0;
  const personOptions = ["first", "second", "third"];
  const numberOptions = ["singular", "dual", "plural"];

  const personMap = {
    1: "first",
    2: "second",
    3: "third",
    first: "first",
    second: "second",
    third: "third",
  };
  const numberMap = {
    sg: "singular",
    du: "dual",
    pl: "plural",
    singular: "singular",
    dual: "dual",
    plural: "plural",
  };

  const feedbackSentenceMap = {
    first: {
      singular: { subject: "aham", verb: "gacchāmi" },
      dual: { subject: "āvām", verb: "gacchāvaḥ" },
      plural: { subject: "vayam", verb: "gacchāmaḥ" },
    },
    second: {
      singular: { subject: "tvam", verb: "gacchasi" },
      dual: { subject: "yuvām", verb: "gacchathaḥ" },
      plural: { subject: "yūyam", verb: "gacchatha" },
    },
    third: {
      singular: { subject: "saḥ", verb: "gacchati" },
      dual: { subject: "tau", verb: "gacchataḥ" },
      plural: { subject: "te", verb: "gacchanti" },
    },
  };

  const contextClues = {
    person: {
      first: "The subject refers to someone speaking (e.g., 'I' or 'we').",
      second: "The subject refers to someone being addressed (e.g., 'you').",
      third: "The subject refers to someone or something else (e.g., 'he', 'she', 'they').",
    },
    number: {
      singular: "The subject involves a single entity.",
      dual: "The subject involves exactly two entities.",
      plural: "The subject involves more than two entities.",
    },
  };

  // Fetch all sentences at once
  const fetchSentences = async () => {
    setLoading(true);
    let retries = 0;
    let success = false;
    let fetchedSentences = [];

    while (retries < MAX_RETRIES && !success) {
      try {
        const response = await authAPI.getNumberGames(TOTAL_QUESTIONS);
        fetchedSentences = response.map((data) => {
          if (!data.sentence || !data.subject || !data.verb) {
            console.warn("Invalid sentence data:", data);
            return null;
          }
          return {
            ...data,
            subject: {
              ...data.subject,
              person: personMap[data.subject.person] || data.subject.person,
              number: numberMap[data.subject.number] || data.subject.number,
            },
          };
        }).filter((s) => s !== null);

        if (fetchedSentences.length === 0) {
          throw new Error("No valid sentences received from server");
        }
        success = true;
      } catch (error) {
        retries++;
        if (retries < MAX_RETRIES) {
          console.log(`Retrying fetch sentences (${retries + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        console.error("Fetch error:", error.message, error.stack);
        setSentences([]);
        dispatch({
          type: "FETCH_ERROR",
          payload: "Failed to load sentences. Using mock data.",
        });
        const mockSentence = {
          sentence: "रामः गच्छति",
          subject: { form: "रामः", person: "third", number: "singular" },
          verb: { form: "गच्छति", root: "गम्", class: "1P" },
        };
        setSentences([mockSentence]);
        dispatch({ type: "FETCH_SUCCESS", payload: mockSentence });
        setLoading(false);
        return;
      }
    }

    console.log("Processed sentences:", JSON.stringify(fetchedSentences, null, 2));
    setSentences(fetchedSentences);
    dispatch({ type: "FETCH_SUCCESS", payload: fetchedSentences[0] });
    setLoading(false);
  };

  // Clear localStorage and reset session score on mount
  useEffect(() => {
    localStorage.removeItem("sankhyaGameScore");
    setSessionScore(0);
    fetchSentences();
  }, []);

  // Update current sentence when qCount changes
  useEffect(() => {
    if (sentences.length > 0 && qCount < sentences.length) {
      dispatch({ type: "FETCH_SUCCESS", payload: sentences[qCount] });
    }
  }, [qCount, sentences]);

  // Save final score when round is finished
  useEffect(() => {
    if (roundFinished) {
      localStorage.setItem("sankhyaGameScore", sessionScore.toString());
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData && userData.id) {
        authAPI
          .saveScore({
            user_id: userData.id,
            score: sessionScore,
          })
          .catch((err) => {
            console.error("Failed to save final score:", err);
            dispatch({
              type: "FETCH_ERROR",
              payload: "Failed to save final score",
            });
          });
      }
    }
  }, [roundFinished, sessionScore]);

  const updateScore = async (gameName, scoreIncrement) => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error("No token found, please log in again");
      }
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
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
      dispatch({
        type: "FETCH_ERROR",
        payload: err.message || "Failed to update score",
      });
      throw err;
    }
  };

  const constructFeedbackSentence = () => {
    if (!guess.person || !guess.number || !feedbackSentenceMap[guess.person]?.[guess.number]) {
      return "Invalid selection. Try again!";
    }
    const { subject, verb } = feedbackSentenceMap[guess.person][guess.number];
    const personClue = contextClues.person[guess.person] || "Unknown person context.";
    const numberClue = contextClues.number[guess.number] || "Unknown number context.";
    return `With your selected person (${guess.person}) and number (${guess.number}), the sentence would be "${subject} ${verb}". Try again! ${personClue} ${numberClue}`;
  };

  const handleSubmit = async () => {
    if (!guess.person || !guess.number || !sentence?.subject) {
      return;
    }
    setSubmitLoading(true);

    const correctPerson = sentence.subject.person === guess.person;
    const correctNumber = sentence.subject.number === guess.number;

    if (correctPerson && correctNumber) {
      dispatch({ type: "SUBMIT_SUCCESS" });
      if (wrongAttempts === 0) {
        setSessionScore((prev) => prev + 2);
        await updateScore("sankhyaTrivia", 2);
      }
    } else {
      const feedback = [];
      if (!correctPerson) feedback.push(`❌ Person is incorrect`);
      if (!correctNumber) feedback.push(`❌ Number is incorrect`);
      if (correctPerson || correctNumber) {
        feedback.unshift("🟡 Partially correct.");
        if (wrongAttempts === 0) {
          setSessionScore((prev) => prev + 1);
          await updateScore("sankhyaTrivia", 1);
        }
      } else {
        feedback.unshift("❌ Both incorrect.");
      }
      feedback.push(constructFeedbackSentence());
      dispatch({ type: "SUBMIT_FAIL", payload: feedback });
    }
    setSubmitLoading(false);
  };

  const handleNext = () => {
    if (qCount + 1 === TOTAL_QUESTIONS) {
      setQCount(TOTAL_QUESTIONS);
      setRoundFinished(true);
    } else {
      setQCount((prev) => prev + 1);
    }
  };

  const handlePlayAgain = () => {
    setSessionScore(0);
    setQCount(0);
    setRoundFinished(false);
    localStorage.removeItem("sankhyaGameScore");
    fetchSentences();
  };

  const handleHint = () => {
    if (!sentence || !sentence.subject || !sentence.verb) return;
    dispatch({
      type: "SHOW_HINT",
      payload: `💡 Hint: Look at the ending of the subject ("${sentence.subject.form}") and the verb ("${sentence.verb.form}").`,
    });
  };

  return (
    <div className="sankhya-game-wrapper">
      <div className="sankhya-card">
        <h2 className="game-title">Sanskrit Sankhya Trivia</h2>
        <div className="controls">
          <button
            className="back-btn"
            onClick={() =>
              navigate("/dashboard", { state: { score: globalScore + sessionScore } })
            }
          >
            ← Back to Dashboard
          </button>
          <button
            className="back-btn"
            onClick={() =>
              navigate("/learning-module", { state: { fromGame: true } })
            }
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
          </div>
        )}

        {loading ? (
          <div className="sentence-box">Loading...</div>
        ) : roundFinished ? (
          <div>
            <p className="result" style={{ fontSize: "1.3rem" }}>
              Final Score: {sessionScore} / {TOTAL_QUESTIONS * 2}
            </p>
            <button className="submit-btn" onClick={handlePlayAgain}>
              Play Again
            </button>
          </div>
        ) : sentence && sentence.subject && sentence.verb ? (
          <>
            <div className="sentence-box">
              {sentence.subject.form} {sentence.verb.form}
            </div>

            <div className="options">
              <div className="option-group">
                <label className="option-label">Person:</label>
                <div className="option-buttons">
                  {personOptions.map((person) => (
                    <label key={person} className="option">
                      <input
                        type="radio"
                        name="person"
                        value={person}
                        checked={guess.person === person}
                        onChange={() =>
                          dispatch({
                            type: "UPDATE_GUESS",
                            payload: { person },
                          })
                        }
                        disabled={submitLoading}
                      />
                      {person.charAt(0).toUpperCase() + person.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label className="option-label">Number:</label>
                <div className="option-buttons">
                  {numberOptions.map((number) => (
                    <label key={number} className="option">
                      <input
                        type="radio"
                        name="number"
                        value={number}
                        checked={guess.number === number}
                        onChange={() =>
                          dispatch({
                            type: "UPDATE_GUESS",
                            payload: { number },
                          })
                        }
                        disabled={submitLoading}
                      />
                      {number.charAt(0).toUpperCase() + number.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="button-group">
              {!showNext && (
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!guess.person || !guess.number || submitLoading}
                >
                  {submitLoading ? "Processing..." : "Submit"}
                </button>
              )}

              {!showNext && result && wrongAttempts > 0 && (
                <button
                  className="hint-btn"
                  onClick={handleHint}
                  disabled={submitLoading}
                >
                  Hint
                </button>
              )}

              {showNext && (
                <button className="next-btn" onClick={handleNext}>
                  Next
                </button>
              )}
            </div>

            {result && <p className="result">{result}</p>}
          </>
        ) : (
          <p>⚠️ No sentence available.</p>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

          body {
            margin: 0;
            font-family: 'Noto Sans Devanagari', sans-serif;
            background: linear-gradient(to bottom right, #f5d7a2, #d76d2b);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sankhya-game-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
          }

          .sankhya-card {
            background: linear-gradient(to bottom right, #fff8e1, #ffe4b5);
            padding: 1.5rem 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            text-align: center;
            width: 100%;
            max-width: 800px;
            min-height: 350px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
          }

          .sankhya-card:hover {
            transform: translateY(-5px);
          }

          .game-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #2c2c2c;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .controls {
            display: flex;
            gap: 1rem;
            justify-content: flex-start;
            margin-bottom: 0.5rem;
          }

          .back-btn {
            background-color: #c06c2c;
            color: white;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95rem;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, transform 0.2s;
          }

          .back-btn:hover {
            background-color: #a85a24;
            transform: scale(1.05);
          }

          .info-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .question-count,
          .session-score {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2c2c2c;
          }

          .sentence-box {
            font-size: 1.4rem;
            padding: 1rem;
            background-color: #fffdf5;
            border: 1px solid #ffd700;
            border-radius: 8px;
            color: #2c2c2c;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .options {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1rem;
          }

          .option-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .option-label {
            font-size: 1rem;
            font-weight: 600;
            color: #2c2c2c;
            margin-right: 0.5rem;
            white-space: nowrap;
          }

          .option-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .option {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.95rem;
            color: #2c2c2c;
            padding: 0.4rem 0.8rem;
            border: 1px solid #c06c2c;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.2s;
            white-space: nowrap;
          }

          .option:hover {
            background-color: rgba(192, 108, 44, 0.1);
            transform: scale(1.03);
          }

          .option input {
            margin-right: 0.3rem;
          }

          .button-group {
            display: flex;
            gap: 0.8rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .submit-btn,
          .next-btn,
          .hint-btn {
            background-color: #c06c2c;
            color: white;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-size: 0.95rem;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          }

          .submit-btn:hover:not(:disabled),
          .next-btn:hover,
          .hint-btn:hover:not(:disabled) {
            background-color: #a85a24;
            transform: scale(1.05);
          }

          .submit-btn:disabled,
          .hint-btn:disabled {
            background-color: #d3d3d3;
            cursor: not-allowed;
          }

          .result {
            margin-top: 1rem;
            white-space: pre-wrap;
            font-weight: 600;
            color: #2c2c2c;
            font-size: 0.95rem;
            line-height: 1.4;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SankhyaTrivia;