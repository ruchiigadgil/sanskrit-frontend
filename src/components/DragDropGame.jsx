import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Award, BookOpen, RotateCcw } from "lucide-react";
import { authAPI, tokenManager } from "../services/api";
const TOTAL_QUESTIONS = 5;
const API_URL =
  "https://sanskrit-backend-4cpp.onrender.com/api/get-sentence-game";

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
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState({}); // Track selected MCQ answers

  const draggedElement = useRef(null);

  useEffect(() => {
    localStorage.removeItem("dragDropGameScore");
    setSessionScore(0);
    initGame();
    // Reset scroll position to top on mount
    window.scrollTo(0, 0);
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const updateScore = async (scoreIncrement) => {
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
        score: scoreIncrement, // Send increment instead of total
        game_type: "drag_drop_game",
      });
      return response.score;
    } catch (err) {
      setFeedback(`Error updating score: ${err.message}`);
      setFeedbackColor("#dc2626");
      throw err;
    }
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

  const handlePlayAgain = async () => {
    await updateScore(sessionScore); // Add total sessionScore to global score
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
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
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

  const checkCompletion = async (droppedWordsState) => {
    const hasObject = correctAnswers.object !== null;
    if (
      droppedWordsState.subject &&
      droppedWordsState.verb &&
      (!hasObject || droppedWordsState.object)
    ) {
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

      if (
        isSubjectCorrect &&
        isVerbCorrect &&
        (!hasObject || isObjectCorrect) &&
        !isScored
      ) {
        showFeedback("All parts are correct! Well done!", "#16a34a");
        setSessionScore((prev) => prev + 1);
        setIsScored(true);
        await updateScore(1); // Increment global score by 1 per correct completion
      } else if (
        !isSubjectCorrect ||
        !isVerbCorrect ||
        (hasObject && !isObjectCorrect)
      ) {
        showFeedback(
          "Not all parts are correct. Please try again or check hints.",
          "#dc2626"
        );
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
    setSelectedMcqAnswers({}); // Reset selected answers
    setModalOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMcqFeedback((prev) => ({ ...prev, [tab]: "" }));
    setMcqHints((prev) => ({ ...prev, [tab]: "" }));
  };

  const handleMcqSelect = (tab, option) => {
    if (selectedMcqAnswers[tab] === option) return; // Prevent multiple clicks on same answer

    let isCorrect = false;
    let hint = "";
    const isVerb = wordAnalysisType === "Verb";
    let normalizedOption = option;
    let normalizedCorrectValue = currentWordAnalysis[tab];

    // Only exit early if not tense tab, since tense uses currentSentence.tense
    if (tab !== "tense" && (!currentWordAnalysis || currentWordAnalysis[tab] === undefined)) {
      return; // Exit if no valid data for non-tense tabs
    }

    // Reverse maps for display to internal value
    const personDisplayToValue = {
      "first person": "1",
      "second person": "2",
      "third person": "3",
    };
    const numberDisplayToValue = {
      singular: "sg",
      dual: "du",
      plural: "pl",
    };
    const genderDisplayToValue = {
      masculine: "masc",
      feminine: "fem",
      neuter: "neut",
      "no gender": null, // Map "no gender" to null to match backend
    };

    // Map display to value for comparison
    if (tab === "person") {
      normalizedOption = personDisplayToValue[option] || option;
      // Override person check if the form is a pronoun like asmad or yushmad
      if (currentWordAnalysis.form && currentWordAnalysis.form.includes("asmad")) {
        normalizedCorrectValue = "1"; // Force first person for asmad
      } else if (currentWordAnalysis.form && currentWordAnalysis.form.includes("yushmad")) {
        normalizedCorrectValue = "2"; // Force second person for yushmad
      } else {
        normalizedCorrectValue = String(currentWordAnalysis[tab] || ""); // Default to stored value
      }
    } else if (tab === "number") {
      normalizedOption = numberDisplayToValue[option] || option;
      normalizedCorrectValue = String(currentWordAnalysis[tab]); // Ensure string for comparison
    } else if (tab === "gender") {
      normalizedOption = genderDisplayToValue[option];
      normalizedCorrectValue = currentWordAnalysis[tab]; // Keep as is to handle null
    } else if (tab === "tense" && isVerb) {
      normalizedCorrectValue = String(currentSentence.tense || "");
    }

    // Validation logic
    switch (tab) {
      case "root":
        isCorrect = String(option) === String(currentWordAnalysis.root);
        hint = isVerb
          ? `The root is the base form of the verb, e.g., "${currentWordAnalysis.root}" for "${currentWordAnalysis.form}".`
          : `The root is the base form of the noun, e.g., "${currentWordAnalysis.root}" for "${currentWordAnalysis.form}".`;
        break;
      case "person":
        isCorrect = normalizedOption === normalizedCorrectValue;
        const personValueToDisplay = {
          1: "first person",
          2: "second person",
          3: "third person",
        };
        const correctDisplay =
          personValueToDisplay[normalizedCorrectValue] || normalizedCorrectValue;
        hint = isVerb
          ? `The person indicates who is performing the action: first person, second person, third person. Correct: ${correctDisplay}.`
          : `The person indicates the grammatical person: first person, second person, third person. Correct: ${correctDisplay}.`;
        break;
      case "number":
        isCorrect = normalizedOption === normalizedCorrectValue;
        const numberValueToDisplay = {
          sg: "singular",
          du: "dual",
          pl: "plural",
        };
        const correctDisplayNumber =
          numberValueToDisplay[normalizedCorrectValue] || normalizedCorrectValue;
        hint = `The number indicates singular, dual, or plural. Correct: ${correctDisplayNumber}.`;
        break;
      case "gender":
        isCorrect =
          normalizedOption === normalizedCorrectValue ||
          (normalizedOption === null && normalizedCorrectValue === null); // Handle null for "no gender"
        const genderValueToDisplay = {
          masc: "masculine",
          fem: "feminine",
          neut: "neuter",
          null: "no gender",
        };
        const correctDisplayGender =
          genderValueToDisplay[normalizedCorrectValue] ||
          normalizedCorrectValue ||
          "no gender";
        hint = `The gender is masculine, feminine, or neuter. Correct: ${correctDisplayGender}.`;
        break;
      case "tense":
        isCorrect = String(option) === normalizedCorrectValue;
        hint = `The tense indicates the time of the action: past, present, or future. Correct: ${normalizedCorrectValue}.`;
        break;
      default:
        break;
    }

    // Update states
    setSelectedMcqAnswers((prev) => ({ ...prev, [tab]: option }));
    setMcqAnswers((prev) => ({ ...prev, [tab]: normalizedOption }));
    setMcqFeedback((prev) => ({
      ...prev,
      [tab]: isCorrect ? "Correct! Well done!" : "Incorrect. Try again or check the hint.",
    }));
    setMcqHints((prev) => ({ ...prev, [tab]: isCorrect ? "" : hint }));

    // Update score only if the answer is correct and not previously selected
    if (isCorrect && !selectedMcqAnswers[tab]) {
      setSessionScore((prev) => prev + 1);
      updateScore(1); // Increment global score by 1 per correct MCQ answer
    }
  };

  const getMcqOptions = (tab) => {
    const isVerb = wordAnalysisType === "Verb";
    if (tab === "root") {
      const rootOptions =
        currentSentence.mcq_options?.[wordAnalysisType.toLowerCase()] || [];
      if (rootOptions.length < 3) {
        const additionalOptions = words
          .filter((w) => w !== currentWordAnalysis?.form)
          .slice(0, 3 - rootOptions.length);
        return shuffleArray([...rootOptions, ...additionalOptions]);
      }
      return shuffleArray(rootOptions);
    }
    if (tab === "person")
      return ["first person", "second person", "third person"];
    if (tab === "number") return ["singular", "dual", "plural"];
    if (tab === "gender") {
      if (!currentWordAnalysis?.gender) {
        return shuffleArray(["masculine", "feminine", "neuter"])
          .slice(0, 2)
          .concat("no gender");
      }
      return ["masculine", "feminine", "neuter"];
    }
    if (tab === "tense" && isVerb) return ["past", "present", "future"];
    return [];
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #d4883f 0%, #d89554 25%, #e0a068 50%, #d89554 75%, #d4883f 100%)",
        color: "#fff8dc",
        padding: "1.5rem",
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: "800px",
        margin: "0 auto",
        height: "100vh",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        transform: "scale(0.85)",
        transformOrigin: "top center",
        marginTop: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.4rem",
            fontSize: "1.1rem",
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
              padding: "0.4rem 0.8rem",
              borderRadius: "0.6rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "#8b5a2b",
                fontWeight: "bold",
              }}
            >
              <Award style={{ width: "1rem", height: "1rem" }} />
              <span style={{ fontSize: "0.9rem" }}>Score: {sessionScore}</span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              marginBottom: "0.75rem",
              color: "#fff8dc",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
            }}
          >
            Drag & Drop Each Word Where It Belongs
          </h1>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "0.75rem",
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#b86b2c";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#cd853f";
              }}
              onClick={() => window.history.back()}
            >
              <ArrowLeft style={{ width: "0.9rem", height: "0.9rem" }} /> Back
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#b86b2c";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#cd853f";
              }}
              onClick={() => window.history.back()}
            >
              <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} />{" "}
              Learning
            </button>
          </div>
        </div>

        {!roundFinished && (
          <div
            style={{
              backgroundColor: "rgba(244, 212, 168, 0.3)",
              backdropFilter: "blur(10px)",
              borderRadius: "0.4rem",
              padding: "0.4rem",
              marginBottom: "0.4rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "1.3rem",
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
              borderRadius: "0.8rem",
              padding: "1.5rem",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              margin: "0 auto",
              maxWidth: "18rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                color: "#8b5a2b",
                marginBottom: "0.6rem",
              }}
            >
              Round Complete!
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#8b5a2b",
                marginBottom: "1.2rem",
              }}
            >
              Final Score: {sessionScore} / {TOTAL_QUESTIONS}
            </p>
            <button
              style={{
                backgroundColor: "#cd853f",
                color: "#fff",
                padding: "0.6rem 1.2rem",
                borderRadius: "0.6rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                transition: "background 0.3s ease",
                fontSize: "0.9rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#b86b2c";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#cd853f";
              }}
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
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#f4d4a8",
                borderRadius: "0.6rem",
                padding: "0.6rem",
                marginBottom: "0.4rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              <p
                style={{
                  fontSize: "1.3rem",
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
                borderRadius: "0.6rem",
                padding: "0.6rem",
                marginBottom: "0.4rem",
                minHeight: "50px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.6rem",
                  justifyContent: "center",
                }}
              >
                {words.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, word);
                    }}
                    onDragEnd={handleDragEnd}
                    style={{
                      background: "rgba(255, 255, 255, 0.5)",
                      color: "#8b5a2b",
                      padding: "0.8rem 1.2rem",
                      borderRadius: "10px",
                      cursor: "grab",
                      boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s ease, background 0.3s",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      userSelect: "none",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.6)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.5)";
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
                gap: "0.8rem",
                marginBottom: "0.8rem",
                overflow: "hidden",
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
                    borderRadius: "10px",
                    padding: "0.8rem 1.2rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "0.6rem",
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
                        padding: "0.6rem 1rem",
                        borderRadius: "10px",
                        textAlign: "center",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        marginBottom: "0.6rem",
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
                        fontSize: "0.8rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontStyle: "italic",
                        textAlign: "center",
                        marginBottom: "0.6rem",
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
                      padding: "0.5rem 0.8rem",
                      borderRadius: "8px",
                      transition: "background 0.3s ease",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      marginTop: "auto",
                      border: "none",
                      cursor: "pointer",
                      marginBottom: "1.5rem", // Increased bottom margin
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#d68840";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#e69950";
                    }}
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
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "0.8rem",
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
                gap: "0.8rem",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  transition: "background 0.3s ease",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#15803d";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                }}
                onClick={handleShowHints}
              >
                Show Hint
              </button>
              {showReset && (
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    transition: "background 0.3s ease",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#b91c1c";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                  }}
                  onClick={handleReset}
                >
                  <RotateCcw style={{ width: "0.9rem", height: "0.9rem" }} />{" "}
                  Reset
                </button>
              )}
              <button
                style={{
                  backgroundColor: "#cd853f",
                  color: "#fff",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  transition: "background 0.3s ease",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#b86b2c";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#cd853f";
                }}
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
            marginBottom: "1rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.8rem",
              padding: "1.2rem",
              maxWidth: "38rem",
              width: "100%",
              maxHeight: "75vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: "0.4rem",
                right: "0.6rem",
                color: "#6b7280",
                fontSize: "1.8rem",
                fontWeight: "bold",
                lineHeight: 1,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: "0",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#374151";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#6b7280";
              }}
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "#8b5a2b",
                marginBottom: "0.8rem",
                margin: "0 0 0.8rem 0",
              }}
            >
              {wordAnalysisType} Analysis: {currentWordAnalysis?.form}
            </h2>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                borderRadius: "0.4rem",
                padding: "0.8rem",
                marginBottom: "0.8rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.6rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#4a5568",
                  }}
                >
                  Guess the{" "}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <span
                  style={{
                    fontSize: "0.9rem",
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
                  marginBottom: "0.6rem",
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
                      padding: "0.4rem 0.6rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: activeTab === tab ? "#fff" : "#4a5568",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      backgroundColor:
                        activeTab === tab ? "#4a90e2" : "#edf2f7",
                      borderRadius: "0.3rem 0.3rem 0 0",
                      marginRight: "2px",
                      border: "none",
                      fontSize: "0.8rem",
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
                  gap: "0.6rem",
                  justifyContent: "center",
                }}
              >
                {getMcqOptions(activeTab).map((option, index) => (
                  <button
                    key={`${activeTab}-${option}-${index}`}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "0.4rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      backgroundColor:
                        mcqAnswers[activeTab] === option
                          ? "#2ecc71"
                          : "#3498db",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.8rem",
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
                    marginTop: "0.6rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: mcqFeedback[activeTab].includes("Correct")
                      ? "#2ecc71"
                      : "#e74c3c",
                    margin: "0.6rem 0 0 0",
                  }}
                >
                  {mcqFeedback[activeTab]}
                </p>
              )}
              {mcqHints[activeTab] && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "0.4rem",
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                    color: "#7f8c8d",
                    margin: "0.4rem 0 0 0",
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
