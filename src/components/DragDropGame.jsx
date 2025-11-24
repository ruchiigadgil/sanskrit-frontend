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
  const [showGuide, setShowGuide] = useState(true); // Show guide prompt initially
  const [isGuideMode, setIsGuideMode] = useState(false); // Guide auto-play mode


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
    if (isGuideMode) return;

    e.dataTransfer.setData("text/plain", word);
    draggedElement.current = word;
  };

  const handleDragEnd = (e) => {
    if (isGuideMode) return;

    e.target.style.opacity = "1";
  };

  const handleDrop = (e, dropZone) => {
    if (isGuideMode) return;

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
    if (isGuideMode) return;

    e.preventDefault();
    e.currentTarget.style.borderColor = "#4ade80";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  };

  const handleDragLeave = (e) => {
    if (isGuideMode) return;

    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  };

  // const startGuideMode = () => {
  //   setIsGuideMode(true);
  
  //   // Auto place correct answers after fetch sets data
  //   setTimeout(() => {
  //     setDroppedWords({
  //       subject: correctAnswers.subject?.form || "",
  //       object: correctAnswers.object?.form || "",
  //       verb: correctAnswers.verb?.form || ""
  //     });
  
  //     setFeedback("Drag each word and place it in the correct box — Subject, Verb, or Object! Now you try", "#16a34a");
  
  //     // Allow user to proceed manually to next question
  //   }, 600);
  // };
  
  const startGuideMode = () => {
    setIsGuideMode(true);
  
    const steps = [];
  
    if (correctAnswers.subject?.form) {
      steps.push({
        zone: "subject",
        word: correctAnswers.subject.form
      });
    }
    if (correctAnswers.object?.form) {
      steps.push({
        zone: "object",
        word: correctAnswers.object.form
      });
    }
    if (correctAnswers.verb?.form) {
      steps.push({
        zone: "verb",
        word: correctAnswers.verb.form
      });
    }
  
    let i = 0;
  
    const animateStep = () => {
      if (i >= steps.length) {
        setFeedback(
          "Now you try! Drag the words into the correct boxes.",
          "#16a34a"
        );
        setIsGuideMode(false); // Allow user to drag now
        return;
      }
  
      const { zone, word } = steps[i];
  
      setTimeout(() => {
        setDroppedWords(prev => ({ ...prev, [zone]: word }));
        setWords(prev => prev.filter(w => w !== word));
  
        i++;
        animateStep();
      }, 1200); // delay between each move
    };
  
    animateStep();
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


  // const handleShowHints = () => {
  //   if (!hintsShown) {
  //     setHintsShown(true);
  //     const newHints = {
  //       subject: correctAnswers.subject
  //         ? `Gender: ${correctAnswers.subject.gender}, Number: ${correctAnswers.subject.number}`
  //         : "No subject in this sentence",
  //       object: correctAnswers.object
  //         ? `Gender: ${correctAnswers.object.gender}, Number: ${correctAnswers.object.number}`
  //         : "No object in this sentence",
  //       verb: `Class: ${correctAnswers.verb.class}, Meaning: "${correctAnswers.verb.meaning}", Person: ${correctAnswers.verb.person}, Number: ${correctAnswers.verb.number}`,
  //     };
  //     setHints(newHints);
  //   }
  // };

  const handleShowHints = () => {
    if (!hintsShown) {
      setHintsShown(true);

      // ---- helper to turn short codes into full words ----
      const full = (code, map) => map[code] ?? code;

      const genderMap = { masc: "Masculine", fem: "Feminine", neut: "Neuter" };
      const numberMap = { sg: "singular", du: "dual", pl: "plural" };
      const personMap = { 1: "1st", 2: "2nd", 3: "3rd" };

      // ---- subject hint (sentence) ----
      const subjectHint = correctAnswers.subject
        ? `${full(correctAnswers.subject.gender, genderMap)} ${full(
            correctAnswers.subject.number,
            numberMap
          )}`
        : "No subject in this sentence";

      // ---- object hint (sentence) ----
      const objectHint = correctAnswers.object
        ? `${full(correctAnswers.object.gender, genderMap)} ${full(
            correctAnswers.object.number,
            numberMap
          )}`
        : "No object in this sentence";

      // ---- verb hint (sentence) ----
      const verbHint = `The verb is ${full(
        correctAnswers.verb.number,
        numberMap
      )} of ${full(correctAnswers.verb.person, personMap)} person meaning "${
        correctAnswers.verb.meaning
      }"`;

      setHints({
        subject: subjectHint,
        object: objectHint,
        verb: verbHint,
      });
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

        body {
          font-family: 'Noto Sans Devanagari', sans-serif;
          background: linear-gradient(135deg, #d76d2b, #f0c14b);
          margin: 0;
          padding: 0;
      }

        .drag-drop-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1rem;
        }

        .drag-drop-card {
          background: linear-gradient(to bottom right, #fff8e1, #ffe4b5);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 900px;
          color: #2c2c2c;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .dd-game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dd-title-badge {
          background-color: rgba(205, 133, 63, 0.2);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 1.2rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #2c2c2c;
        }

        .dd-score-badge {
          background-color: rgba(205, 133, 63, 0.15);
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .dd-main-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #2c2c2c;
          text-align: center;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dd-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .dd-control-btn {
          background-color: #cd853f;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .dd-control-btn:hover {
          background-color: #b86b2c;
          transform: scale(1.05);
        }

        .dd-question-badge {
          background-color: rgba(205, 133, 63, 0.15);
          border-radius: 8px;
          padding: 0.8rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .dd-sentence-display {
          font-size: 1.4rem;
          padding: 1.2rem;
          background-color: #fffdf5;
          border: 2px solid #ffd700;
          border-radius: 10px;
          text-align: center;
          color: #2c2c2c;
          font-weight: 500;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dd-words-container {
          background-color: rgba(205, 133, 63, 0.1);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          min-height: 80px;
          border: 2px solid rgba(205, 133, 63, 0.3);
        }

        .dd-words-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          justify-content: center;
        }

        .dd-draggable-word {
          background: white;
          color: #2c2c2c;
          padding: 0.8rem 1.2rem;
          border-radius: 8px;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          font-size: 1.1rem;
          font-weight: 600;
          user-select: none;
          border: 2px solid #cd853f;
        }

        .dd-draggable-word:hover {
          background: #fffdf5;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .dd-draggable-word:active {
          cursor: grabbing;
        }

        .dd-drop-zones {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .dd-drop-zone {
          background: rgba(205, 133, 63, 0.1);
          border: 2px dashed #cd853f;
          border-radius: 10px;
          padding: 1rem;
          transition: all 0.3s ease;
          min-height: 180px;
          display: flex;
          flex-direction: column;
        }

        .dd-drop-zone.drag-over {
          background: rgba(205, 133, 63, 0.25);
          border-color: #b86b2c;
          border-style: solid;
          transform: scale(1.02);
        }

        .dd-zone-title {
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 0.8rem;
          text-transform: capitalize;
          color: #2c2c2c;
        }

        .dd-dropped-word {
          background-color: #cd853f;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .dd-zone-hint {
          font-size: 0.95rem;
          color: #1a1a1a;
          font-style: normal;
          font-weight: 500;
          text-align: center;
          margin: 0.8rem auto;
          line-height: 1.6;
          background-color: rgba(255, 248, 225, 0.85);
          padding: 0.7rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(205, 133, 63, 0.4);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          max-width: 90%;
        }

        .dd-learn-btn {
          width: 100%;
          background-color: #e69950;
          color: white;
          border: none;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .dd-learn-btn:hover:not(:disabled) {
          background-color: #d68840;
          transform: scale(1.02);
        }

        .dd-learn-btn:disabled {
          background-color: #d3d3d3;
          cursor: not-allowed;
        }

        .dd-feedback {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding: 0.8rem;
          border-radius: 8px;
          background-color: rgba(205, 133, 63, 0.1);
        }

        .dd-action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .dd-hint-btn {
          background-color: #eaaa2c;
        }

        .dd-hint-btn:hover {
          background-color:rgb(178, 128, 28);
        }

        .dd-reset-btn {
          background-color: #dc2626;
        }

        .dd-reset-btn:hover {
          background-color: #b91c1c;
        }

        .dd-completion-card {
          background-color: rgba(205, 133, 63, 0.15);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 0 auto;
        }

        .dd-completion-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 1rem;
        }

        .dd-completion-score {
          font-size: 1.2rem;
          color: #2c2c2c;
          margin-bottom: 1.5rem;
        }

        .dd-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 1rem;
        }

        .dd-modal-content {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .dd-modal-close {
          position: absolute;
          top: 0.8rem;
          right: 1rem;
          color: #6b7280;
          font-size: 2rem;
          font-weight: bold;
          line-height: 1;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s ease;
        }

        .dd-modal-close:hover {
          color: #374151;
        }

        .dd-modal-header {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 1rem;
        }

        .dd-mcq-section {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .dd-mcq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .orange-text {
          color: #d66a16;
          font-weight: 600;
        }

        .dd-mcq-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .dd-mcq-score {
          font-size: 1rem;
          font-weight: 600;
          color: #2c2c2c;
        }

        .dd-tab-container {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 1rem;
          gap: 0.2rem;
        }

        .dd-tab-button {
          flex: 1;
          padding: 0.6rem;
          text-align: center;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          border: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .dd-tab-button.active {
          background-color: #e18837;
          color: white;
        }

        .dd-tab-button:not(.active) {
          background-color: #edf2f7;
          color: #4a5568;
        }

        .dd-tab-button:not(.active):hover {
          background-color: #e2e8f0;
        }

        .dd-mcq-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
          justify-content: center;
        }

        .dd-mcq-option {
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          border: none;
          font-size: 0.9rem;
          color: white;
        }

        .dd-mcq-option:not(.selected) {
          background-color: #e7a32a;
        }

        .dd-mcq-option:not(.selected):hover {
          background-color:rgb(178, 128, 28);
        }

        .dd-mcq-option.selected {
          background-color: #eaaa2c;
        }

        .dd-next-wrapper {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin-top: 16px;
        }

        .dd-next-button {
          padding: 10px 18px;
          background-color: #d66a16;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          font-size: 15px;
        }

        .dd-next-button:hover:not(:disabled) {
          background-color: #bf5e13;
          transform: translateY(-1px);
        }

        .dd-next-button:disabled {
          background-color: #c9c9c9;
          cursor: not-allowed;
          opacity: 0.6;
        }


        .dd-next-button:hover {
          background-color: #bf5e13;
          transform: translateY(-1px);
        }

        .dd-next-button:active {
          transform: scale(0.97);
        }


        .dd-mcq-feedback {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .dd-mcq-feedback.correct {
          color:rgb(69, 142, 23);
          background-color: rgba(46, 204, 113, 0.1);
        }

        .dd-mcq-feedback.incorrect {
          color:rgb(140, 34, 22);
          background-color: rgba(231, 76, 60, 0.1);
        }

        .dd-mcq-hint {
          text-align: center;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          font-style: italic;
          color: #7f8c8d;
        }
        
        .dd-guide-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background:rgb(127, 61, 10);
  padding: 1.5rem 2rem;
  border: 5px solid #d66a16;
  color: #fff;
  border-radius: 12px;
  z-index: 9999;
  text-align: center;
}

.dd-guide-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.dd-guide-btn {
  background: #d66a16;
  border: none;
  padding: 0.6rem 1rem;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.dd-guide-btn.dd-skip {
  background: #d66a16;
}

.dd-guide-continue {
  margin: 1rem auto;
  display: block;
  background: #d66a16;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  border: none;
}


.dd-word-animate {
  transition: transform 0.6s ease, opacity 0.6s ease;
  opacity: 0.9;
}

        @media (max-width: 768px) {
          .drag-drop-card {
            padding: 1.5rem;
          }
          .dd-main-title {
            font-size: 1.5rem;
          }
          .dd-drop-zones {
            grid-template-columns: 1fr;
          }
          .dd-game-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="drag-drop-wrapper">
        <div className="drag-drop-card">
          <div className="dd-game-header">
            <div className="dd-title-badge">संस्कृतमणिः</div>
            {!roundFinished && (
              <div className="dd-score-badge">
                <Award style={{ width: "1rem", height: "1rem" }} />
                <span>Score: {sessionScore}</span>
              </div>
            )}
          </div>

          <h1 className="dd-main-title">
            Drag & Drop Each Word Where It Belongs
          </h1>

          <div className="dd-controls">
            <button
              className="dd-control-btn"
              onClick={() => window.history.back()}
            >
              <ArrowLeft style={{ width: "0.9rem", height: "0.9rem" }} /> Back
            </button>
            <button
              className="dd-control-btn"
              onClick={() => window.history.back()}
            >
              <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} />{" "}
              Learning
            </button>
          </div>

          {showGuide && (
  <div className="dd-guide-popup">
    <h2>How to Play?</h2>
    <p>Drag each word into the correct box — Subject, Verb & Object.</p>
    
    <div className="dd-guide-buttons">
      <button
        className="dd-guide-btn"
        onClick={() => {
          setShowGuide(false);
          startGuideMode();
        }}
      >
        Show Me 👀
      </button>

      <button
        className="dd-guide-btn dd-skip"
        onClick={() => setShowGuide(false)}
      >
        Skip ➜
      </button>
    </div>
  </div>
)}

          {!roundFinished && (
            <div className="dd-question-badge">
              Question {qCount} / {TOTAL_QUESTIONS}
            </div>
          )}

          {roundFinished ? (
            <div className="dd-completion-card">
              <h2 className="dd-completion-title">Round Complete!</h2>
              <p className="dd-completion-score">
                Final Score: {sessionScore} / 25
              </p>
              <button className="dd-control-btn" onClick={handlePlayAgain}>
                Play Again
              </button>
            </div>
          ) : (
            <>
              <div className="dd-sentence-display">
                {currentSentence.sentence || "Loading..."}
              </div>

              <div className="dd-words-container ${isGuideMode ? 'dd-word-animate' : ''}">
                <div className="dd-words-flex">
                  {words.map((word, index) => (
                    <div
                      key={`${word}-${index}`}
                      className="dd-draggable-word"
                      draggable
                      onDragStart={(e) => handleDragStart(e, word)}
                      onDragEnd={handleDragEnd}
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dd-drop-zones">
                {["subject", "object", "verb"].map((zone) => (
                  <div
                    key={zone}
                    className={`dd-drop-zone`}
                    onDrop={(e) => handleDrop(e, zone)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <h3 className="dd-zone-title">{zone}</h3>
                    {droppedWords[zone] && (
                      <div className="dd-dropped-word">
                        {droppedWords[zone]}
                      </div>
                    )}
                    {hints[zone] && (
                      <p className="dd-zone-hint">{hints[zone]}</p>
                    )}
                    <button
                      className="dd-learn-btn"
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

              {isGuideMode && (
  <button
    className="dd-guide-continue"
    onClick={() => {
      setIsGuideMode(false);
      initGame(); // Start real game
    }}
  >
    Ready!
  </button>
)}

              {feedback && (
                <div className="dd-feedback" style={{ color: feedbackColor }}>
                  {feedback}
                </div>
              )}

              <div className="dd-action-buttons">
                <button
                  className="dd-control-btn dd-hint-btn"
                  onClick={handleShowHints}
                >
                  Show Hint
                </button>
                {showReset && (
                  <button
                    className="dd-control-btn dd-reset-btn"
                    onClick={handleReset}
                  >
                    <RotateCcw style={{ width: "0.9rem", height: "0.9rem" }} />{" "}
                    Reset
                  </button>
                )}
                <button className="dd-control-btn" onClick={handleNextSentence}>
                  Next Sentence
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="dd-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="dd-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dd-modal-close"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <div className="dd-modal-header">
                <h4>Sentence</h4>
                <h1>{currentSentence.sentence || "Loading..."}</h1>
            </div>
            <h2 className="dd-modal-header orange-text">
              <h4>{wordAnalysisType}</h4>
              <h1>{currentWordAnalysis?.form}</h1>
            </h2>


            <div className="dd-mcq-section">
              <div className="dd-mcq-header">
                <h3 className="dd-mcq-title">
                  Guess the{" "}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  {" "}of the {wordAnalysisType}
                </h3>
                <span className="dd-mcq-score">Score: {sessionScore}</span>
              </div>

              {/* Tabs */}
              {/* <div className="dd-tab-container">
                {[
                  "root",
                  "person",
                  "number",
                  ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`dd-tab-button ${activeTab === tab ? "active" : ""}`}
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
              </div> */}

              {/* Tabs */}
            <div className="dd-tab-container">
              {[
                "root",
                "person",
                "number",
                ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
              ].map((tab) => {
                const tabOrder = [
                  "root",
                  "person",
                  "number",
                  ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
                ];
                
                const currentIndex = tabOrder.indexOf(activeTab);
                const tabIndex = tabOrder.indexOf(tab);

                const isTabEnabled =
                  tabIndex <= currentIndex || mcqFeedback[tab]?.includes("Correct");

                return (
                  <button
                    key={tab}
                    className={`dd-tab-button ${activeTab === tab ? "active" : ""}`}
                    disabled={!isTabEnabled} // disable lock
                    onClick={() => isTabEnabled && handleTabChange(tab)}
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
                );
              })}
            </div>

              {/* MCQ Options */}
              <div className="dd-mcq-options">
                {getMcqOptions(activeTab).map((option, index) => (
                  <button
                    key={`${activeTab}-${option}-${index}`}
                    className={`dd-mcq-option ${
                      mcqAnswers[activeTab] === option ? "selected" : ""
                    }`}
                    onClick={() => handleMcqSelect(activeTab, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {mcqFeedback[activeTab] && (
                <p className={`dd-mcq-feedback ${
                  mcqFeedback[activeTab].includes("Correct") ? "correct" : "incorrect"
                }`}>
                  {mcqFeedback[activeTab]}
                </p>
              )}

              {mcqHints[activeTab] && (
                <p className="dd-mcq-hint">{mcqHints[activeTab]}</p>
              )}

              {/* NEXT / EXIT BUTTON */}
              {/* Persistent Next / Exit Button */}
            <div className="dd-next-wrapper">
              <button
                className="dd-next-button"
                disabled={!mcqFeedback[activeTab]?.includes("Correct")}
                onClick={() => {
                  if (!mcqFeedback[activeTab]?.includes("Correct")) return;

                  const tabOrder = [
                    "root",
                    "person",
                    "number",
                    ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
                  ];
                  const currentIndex = tabOrder.indexOf(activeTab);

                  if (currentIndex < tabOrder.length - 1) {
                    handleTabChange(tabOrder[currentIndex + 1]);
                  } else {
                    setModalOpen(false)// Exit
                  }
                }}
              >
                {(() => {
                  const tabOrder = [
                    "root",
                    "person",
                    "number",
                    ...(wordAnalysisType === "Verb" ? ["tense"] : ["gender"]),
                  ];
                  return activeTab === tabOrder[tabOrder.length - 1]
                    ? "Exit"
                    : "Next";
                })()}
              </button>
            </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default DragDropGame;
