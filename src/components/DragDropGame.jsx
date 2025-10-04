import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Award, BookOpen, RotateCcw } from "lucide-react";

const TOTAL_QUESTIONS = 5;
const API_URL = "https://sanskrit-backend-4cpp.onrender.com/api/get-sentence-game";

const DragDropGame = () => {
  const [sessionScore, setSessionScore] = useState(0);
  const [qCount, setQCount] = useState(1);
  const [roundFinished, setRoundFinished] = useState(false);
  const [currentSentence, setCurrentSentence] = useState({});
  const [words, setWords] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [hintsShown, setHintsShown] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [hints, setHints] = useState({
    subject: "",
    object: "",
    verb: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [wordAnalysisType, setWordAnalysisType] = useState("");
  const [currentWordAnalysis, setCurrentWordAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("root");
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const [mcqHints, setMcqHints] = useState({});
  const [droppedWords, setDroppedWords] = useState({
    subject: "",
    object: "",
    verb: "",
  });
  const [isScored, setIsScored] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const draggedElement = useRef(null);

  useEffect(() => {
    localStorage.removeItem("dragDropGameScore");
    setSessionScore(0);
    initGame();
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initGame = async () => {
    clearDropZones();
    setIsScored(false);
    setShowReset(false);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch sentence game data from API");
      }
      const data = await response.json();

      setCurrentSentence(data);
      setWords(shuffleArray(data.words));
      setCorrectAnswers(data.correct_answers);
      setHintsShown(false);
      clearHints();
      setFeedback("");
      setFeedbackColor("");
    } catch (error) {
      console.error("Error fetching game data:", error);
      setFeedback("Failed to load data from API. Please try again later.");
      setFeedbackColor("#dc2626");
    }
  };

  const handleNextSentence = () => {
    if (qCount === TOTAL_QUESTIONS) {
      setRoundFinished(true);
      return;
    }
    setQCount((prev) => prev + 1);
    initGame();
  };

  const handlePlayAgain = () => {
    setSessionScore(0);
    setQCount(1);
    setRoundFinished(false);
    localStorage.removeItem("dragDropGameScore");
    initGame();
  };

  const handleReset = () => {
    const allWords = [
      droppedWords.subject,
      droppedWords.object,
      droppedWords.verb,
    ].filter(Boolean);
    setWords((prev) => [...prev, ...allWords]);
    clearDropZones();
    setFeedback("");
    setFeedbackColor("");
    setShowReset(false);
  };

  const clearDropZones = () => {
    setDroppedWords({
      subject: "",
      object: "",
      verb: "",
    });
  };

  const clearHints = () => {
    setHints({
      subject: "",
      object: "",
      verb: "",
    });
  };

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData("text/plain", word);
    draggedElement.current = word;
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";

    const word = e.dataTransfer.getData("text/plain");
    const newDroppedWords = { ...droppedWords };
    Object.keys(newDroppedWords).forEach((key) => {
      if (newDroppedWords[key] === word) newDroppedWords[key] = "";
    });
    newDroppedWords[dropZone] = word;
    setDroppedWords(newDroppedWords);
    setWords((prev) => prev.filter((w) => w !== word));
    setShowReset(true);
    setTimeout(() => checkCompletion(newDroppedWords), 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#4ade80";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  };

  const checkCompletion = (droppedWordsState) => {
    if (droppedWordsState.subject && droppedWordsState.verb) {
      const isSubjectCorrect =
        droppedWordsState.subject ===
        (correctAnswers.subject ? correctAnswers.subject.form : null);
      const isObjectCorrect = droppedWordsState.object
        ? droppedWordsState.object ===
          (correctAnswers.object ? correctAnswers.object.form : null)
        : correctAnswers.object === null;
      const isVerbCorrect =
        droppedWordsState.verb ===
        (correctAnswers.verb ? correctAnswers.verb.form : null);

      if (isSubjectCorrect && isObjectCorrect && isVerbCorrect && !isScored) {
        showFeedback("Correct! Well done!", "#16a34a");
        setSessionScore((prev) => prev + 1);
        setIsScored(true);
      } else if (!isSubjectCorrect || !isObjectCorrect || !isVerbCorrect) {
        showFeedback("Not quite right. Try again or check hints.", "#dc2626");
      }
    }
  };

  const showFeedback = (message, color) => {
    setFeedback(message);
    setFeedbackColor(color);
  };

  const handleShowHints = () => {
    if (!hintsShown) {
      setHintsShown(true);
      const newHints = {
        subject: correctAnswers.subject
          ? `Gender: ${correctAnswers.subject.gender}, Number: ${correctAnswers.subject.number}`
          : "No subject in this sentence",
        object: correctAnswers.object
          ? `Gender: ${correctAnswers.object.gender}, Number: ${correctAnswers.object.number}`
          : "No object in this sentence",
        verb: `Class: ${correctAnswers.verb.class}, Meaning: "${correctAnswers.verb.meaning}", Person: ${correctAnswers.verb.person}, Number: ${correctAnswers.verb.number}`,
      };
      setHints(newHints);
    }
  };

  const initWordAnalysis = (wordData, type) => {
    setCurrentWordAnalysis(wordData);
    setWordAnalysisType(type);
    setActiveTab("root");
    setMcqAnswers({});
    setMcqFeedback({});
    setMcqHints({});
    setModalOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMcqFeedback((prev) => ({ ...prev, [tab]: "" }));
    setMcqHints((prev) => ({ ...prev, [tab]: "" }));
  };

  const handleMcqSelect = (tab, option) => {
    let isCorrect = false;
    let hint = "";
    const isVerb = wordAnalysisType === "Verb";

    switch (tab) {
      case "root":
        isCorrect = String(option) === String(currentWordAnalysis.root);
        hint = isVerb
          ? `The root is the base form of the verb, e.g., "${currentWordAnalysis.root}" for "${currentWordAnalysis.form}".`
          : `The root is the base form of the noun, e.g., "${currentWordAnalysis.root}" for "${currentWordAnalysis.form}".`;
        break;
      case "person":
        isCorrect = String(option) === String(currentWordAnalysis.person);
        hint = isVerb
          ? `The person indicates who is performing the action: 1st (I/we), 2nd (you), 3rd (he/she/they). Correct: ${currentWordAnalysis.person}.`
          : `The person indicates the grammatical person: 1st (I/we), 2nd (you), 3rd (he/she/they). Correct: ${currentWordAnalysis.person}.`;
        break;
      case "number":
        isCorrect = String(option) === String(currentWordAnalysis.number);
        hint = `The number indicates singular, dual, or plural. Correct: ${currentWordAnalysis.number}.`;
        break;
      case "gender":
        isCorrect = String(option) === String(currentWordAnalysis.gender);
        hint = `The gender is masculine, feminine, or neuter. Correct: ${currentWordAnalysis.gender}.`;
        break;
      case "tense":
        isCorrect = String(option) === String(currentSentence.tense);
        hint = `The tense indicates the time of the action: past, present, or future. Correct: ${currentSentence.tense}.`;
        break;
      default:
        break;
    }

    setMcqAnswers((prev) => ({ ...prev, [tab]: option }));
    setMcqFeedback((prev) => ({
      ...prev,
      [tab]: isCorrect ? "Correct! Well done!" : "Incorrect. Try again or check the hint.",
    }));
    setMcqHints((prev) => ({ ...prev, [tab]: isCorrect ? "" : hint }));

    if (isCorrect) {
      setSessionScore((prev) => prev + 1);
    }
  };

  const getMcqOptions = (tab) => {
    const isVerb = wordAnalysisType === "Verb";
    if (tab === "root") {
      return currentSentence.mcq_options?.[wordAnalysisType.toLowerCase()] || [];
    }
    if (tab === "person") return ["1", "2", "3"];
    if (tab === "number") return ["sg", "du", "pl"];
    if (tab === "gender") return ["masc", "fem", "neut"];
    if (tab === "tense" && isVerb) return ["past", "present", "future"];
    return [];
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #d4883f 0%, #d89554 25%, #e0a068 50%, #d89554 75%, #d4883f 100%)",
        color: "#fff8dc",
        padding: "2rem",
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        display: "flex",
        flexDirection: "column",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            color: "#fff8dc",
          }}
        >
          संस्कृतमणिः
        </div>
        {!roundFinished && (
          <div
            style={{
              backgroundColor: "#f4d4a8",
              backdropFilter: "blur(12px)",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#8b5a2b",
                fontWeight: "bold",
              }}
            >
              <Award style={{ width: "1.2rem", height: "1.2rem" }} />
              <span style={{ fontSize: "1rem" }}>Score: {sessionScore}</span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              marginBottom: "1rem",
              color: "#fff8dc",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
            }}
          >
            Sanskrit Sentence Analyzer
          </h1>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.8rem 1.5rem",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#b86b2c"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#cd853f"; }}
              onClick={() => window.history.back()}
            >
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.8rem 1.5rem",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#b86b2c"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#cd853f"; }}
              onClick={() => window.history.back()}
            >
              <BookOpen style={{ width: "1rem", height: "1rem" }} /> Learning
            </button>
          </div>
        </div>

        {!roundFinished && (
          <div
            style={{
              backgroundColor: "rgba(244, 212, 168, 0.3)",
              backdropFilter: "blur(10px)",
              borderRadius: "0.5rem",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#fff8dc",
              }}
            >
              Question {qCount} / {TOTAL_QUESTIONS}
            </div>
          </div>
        )}

        {roundFinished ? (
          <div
            style={{
              backgroundColor: "#f4d4a8",
              borderRadius: "1rem",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              margin: "0 auto",
              maxWidth: "20rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#8b5a2b",
                marginBottom: "0.75rem",
              }}
            >
              Round Complete!
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                color: "#8b5a2b",
                marginBottom: "1.5rem",
              }}
            >
              Final Score: {sessionScore} / {TOTAL_QUESTIONS}
            </p>
            <button
              style={{
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontSize: "1rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#b86b2c"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#cd853f"; }}
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "auto",
            }}
          >
            <div
              style={{
                backgroundColor: "#f4d4a8",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <p
                style={{
                  fontSize: "1.5rem",
                  textAlign: "center",
                  color: "#8b5a2b",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {currentSentence.sentence || "Loading..."}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                minHeight: "60px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  justifyContent: "center",
                }}
              >
                {words.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, word);
                      e.currentTarget.style.opacity = "0.5";
                    }}
                    onDragEnd={handleDragEnd}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#f5deb3",
                      padding: "1rem 1.5rem",
                      borderRadius: "12px",
                      cursor: "grab",
                      boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                      transition: "transform 0.2s ease, background 0.3s",
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      userSelect: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "1rem",
                maxHeight: "250px",
              }}
            >
              {["subject", "object", "verb"].map((zone) => (
                <div
                  key={zone}
                  onDrop={(e) => handleDrop(e, zone)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "0.75rem",
                      textTransform: "capitalize",
                      color: "#fff8dc",
                    }}
                  >
                    {zone}
                  </h3>
                  {droppedWords[zone] && (
                    <div
                      style={{
                        backgroundColor: "#cd853f",
                        color: "#fff",
                        padding: "0.75rem 1.25rem",
                        borderRadius: "12px",
                        textAlign: "center",
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        marginBottom: "0.75rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        width: "100%",
                      }}
                    >
                      {droppedWords[zone]}
                    </div>
                  )}
                  {hints[zone] && (
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontStyle: "italic",
                        textAlign: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {hints[zone]}
                    </p>
                  )}
                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#e69950",
                      color: "#fff",
                      padding: "0.6rem 1rem",
                      borderRadius: "10px",
                      transition: "background 0.3s ease",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      marginTop: "auto",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#d68840"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#e69950"; }}
                    onClick={() => {
                      const wordData = correctAnswers[zone];
                      if (wordData) {
                        initWordAnalysis(
                          wordData,
                          zone.charAt(0).toUpperCase() + zone.slice(1)
                        );
                      }
                    }}
                    disabled={!correctAnswers[zone]}
                  >
                    Learn More
                  </button>
                </div>
              ))}
            </div>

            {feedback && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  color: feedbackColor,
                }}
              >
                {feedback}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  transition: "background 0.3s ease",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#15803d"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#16a34a"; }}
                onClick={handleShowHints}
              >
                Show Hint
              </button>
              {showReset && (
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    padding: "0.8rem 1.5rem",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    transition: "background 0.3s ease",
                    fontSize: "1rem",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#b91c1c"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#dc2626"; }}
                  onClick={handleReset}
                >
                  <RotateCcw style={{ width: "1rem", height: "1rem" }} /> Reset
                </button>
              )}
              <button
                style={{
                  backgroundColor: "#cd853f",
                  color: "#fff",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  transition: "background 0.3s ease",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#b86b2c"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#cd853f"; }}
                onClick={handleNextSentence}
              >
                Next Sentence
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: "1rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              maxWidth: "40rem",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.75rem",
                color: "#6b7280",
                fontSize: "2rem",
                fontWeight: "bold",
                lineHeight: 1,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "0",
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#374151"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "#6b7280"; }}
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#8b5a2b",
                marginBottom: "1rem",
                margin: "0 0 1rem 0",
              }}
            >
              {wordAnalysisType} Analysis: {currentWordAnalysis?.form}
            </h2>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#4a5568",
                  }}
                >
                  Guess the {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "#2d3748",
                  }}
                >
                  Score: {sessionScore}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  borderBottom: "2px solid #e2e8f0",
                  marginBottom: "1rem",
                }}
              >
                {[
                  "root",
                  "person",
                  "number",
                  ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
                ].map((tab) => (
                  <button
                    key={tab}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: activeTab === tab ? "#fff" : "#4a5568",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      backgroundColor: activeTab === tab ? "#4a90e2" : "#edf2f7",
                      borderRadius: "0.375rem 0.375rem 0 0",
                      marginRight: "2px",
                      border: "none",
                      fontSize: "0.875rem",
                    }}
                    onMouseOver={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeTab !== tab) {
                        e.currentTarget.style.backgroundColor = "#edf2f7";
                      }
                    }}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab === "root"
                      ? "Root"
                      : tab === "person"
                      ? "Person"
                      : tab === "number"
                      ? "Number"
                      : tab === "gender"
                      ? "Gender"
                      : "Tense"}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  justifyContent: "center",
                }}
              >
                {getMcqOptions(activeTab).map((option, index) => (
                  <button
                    key={`${activeTab}-${option}-${index}`}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      backgroundColor:
                        mcqAnswers[activeTab] === option ? "#2ecc71" : "#3498db",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.875rem",
                    }}
                    onMouseOver={(e) => {
                      if (mcqAnswers[activeTab] !== option) {
                        e.currentTarget.style.backgroundColor = "#2980b9";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (mcqAnswers[activeTab] !== option) {
                        e.currentTarget.style.backgroundColor = "#3498db";
                      }
                    }}
                    onClick={() => handleMcqSelect(activeTab, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {mcqFeedback[activeTab] && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: mcqFeedback[activeTab].includes("Correct") ? "#2ecc71" : "#e74c3c",
                    margin: "0.75rem 0 0 0",
                  }}
                >
                  {mcqFeedback[activeTab]}
                </p>
              )}
              {mcqHints[activeTab] && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "0.5rem",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                    color: "#7f8c8d",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  {mcqHints[activeTab]}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropGame;
