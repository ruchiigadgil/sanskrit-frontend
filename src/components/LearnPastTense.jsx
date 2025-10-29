import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LearnPastTense = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [quizStates, setQuizStates] = useState({});
  const [flippedCards, setFlippedCards] = useState({});

  const sections = [
    "intro",
    "formation",
    "endings",
    "examples",
    "quiz",
    "practice",
  ];

  const quizzes = [
    {
      question: "What is the correct past tense form: 'I ate'?",
      options: ["अहम् खादति", "अहम् अखादम्", "अहम् खादामि"],
      correct: 1,
      explanation:
        "First person singular uses -अम् ending with prefix अ. अहम् अखादम् = I ate",
    },
    {
      question: "Translate: 'They (3+) went'",
      options: ["ते अगच्छत्", "ते अगच्छतः", "ते अगच्छन्"],
      correct: 2,
      explanation:
        "Third person plural uses -न् ending with prefix अ. ते अगच्छन् = They went",
    },
    {
      question: "What is 'You both read' in Sanskrit (past)?",
      options: ["युवाम् अपठ:", "युवाम् अपठतम्", "युवाम् अपठत"],
      correct: 1,
      explanation:
        "Second person dual uses -तम् ending with prefix अ. युवाम् अपठतम् = You both read",
    },
  ];

  const endingsData = [
    {
      person: "प्रथम पुरुषः (3rd Person)",
      singular: "-त् (अगच्छत्)",
      dual: "-ताम् (अगच्छतः)",
      plural: "-अन् (अगच्छन्)",
    },
    {
      person: "मध्यम पुरुषः (2nd Person)",
      singular: "- ः (अगच्छ:)",
      dual: "- तम् (अगच्छतम्)",
      plural: "-त (अगच्छत)",
    },
    {
      person: "उत्तम पुरुषः (1st Person)",
      singular: "-अम् (अगच्छम्)",
      dual: "-व (अगच्छाव)",
      plural: "-म (अगच्छाम)",
    },
  ];

  const verbExamples = [
    { root: "गम् (to go)", forms: ["अगच्छत्", "अगच्छ:", "अगच्छम्"] },
    { root: "खाद् (to eat)", forms: ["अखादत्", "अखाद:", "अखादम्"] },
    { root: "पठ् (to read)", forms: ["अपठत्", "अपठ:", "अपठम्"] },
    { root: "लिख् (to write)", forms: ["अलिखत्", "अलिख:", "अलिखम्"] },
  ];

  const styles = {
    container: {
      minHeight: "100vh",
      background: "none",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      color: "white",
      fontSize: "2.5rem",
      fontWeight: "700",
      marginBottom: "10px",
      textShadow: "3px 3px 6px rgba(0, 0, 0, 0.4)",
      letterSpacing: "1px",
    },
    subtitle: {
      color: "rgba(255, 255, 255, 0.95)",
      fontSize: "1.3rem",
      fontWeight: "500",
      marginBottom: "25px",
      textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
    },
    backButton: {
      background: "linear-gradient(45deg, #8b4513, #a0522d)",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "25px",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 6px 20px rgba(139, 69, 19, 0.4)",
      fontWeight: "600",
      marginBottom: "25px",
      display: "inline-block",
    },
    progressBar: {
      width: "100%",
      maxWidth: "600px",
      height: "10px",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderRadius: "5px",
      margin: "0 auto 25px",
      overflow: "hidden",
      boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    progress: {
      height: "100%",
      background: "#cd853f",
      borderRadius: "5px",
      transition: "width 0.3s ease",
      width: `${((currentSection + 1) / sections.length) * 100}%`,
      boxShadow: "0 2px 4px rgba(205, 133, 63, 0.3)",
    },
    navigation: {
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "30px",
    },
    navButton: {
      padding: "10px 18px",
      borderRadius: "25px",
      border: "none",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      minWidth: "100px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    activeNavButton: {
      background: "linear-gradient(45deg, #ffffff, #f8f8f8)",
      color: "#ff6b35",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)",
    },
    inactiveNavButton: {
      background: "rgba(255, 255, 255, 0.25)",
      color: "white",
      backdropFilter: "blur(10px)",
    },
    contentCard: {
      maxWidth: "950px",
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.98)",
      borderRadius: "25px",
      padding: "40px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    sectionTitle: {
      color: "#8b4513",
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "25px",
      textAlign: "center",
      textShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
    },
    keyRule: {
      background: "#cd853f",
      color: "white",
      padding: "20px 25px",
      borderRadius: "18px",
      textAlign: "center",
      fontSize: "1.2rem",
      fontWeight: "600",
      marginBottom: "25px",
      boxShadow: "0 10px 25px rgba(205, 133, 63, 0.3)",
      lineHeight: "1.5",
    },
    exampleBox: {
      background: "#cd853f",
      color: "white",
      padding: "25px",
      borderRadius: "18px",
      textAlign: "center",
      fontSize: "1.4rem",
      fontWeight: "600",
      marginBottom: "25px",
      boxShadow: "0 10px 25px rgba(205, 133, 63, 0.3)",
      lineHeight: "1.4",
    },
    formulaBox: {
      background: "#cd853f",
      color: "white",
      padding: "25px",
      borderRadius: "18px",
      textAlign: "center",
      fontSize: "1.4rem",
      fontWeight: "600",
      marginBottom: "25px",
      boxShadow: "0 10px 25px rgba(205, 133, 63, 0.3)",
      lineHeight: "1.4",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "25px",
      borderRadius: "15px",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      fontSize: "1rem",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #8b4513, #a0522d)",
      color: "white",
      padding: "18px 15px",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "1.1rem",
    },
    tableCell: {
      padding: "15px",
      textAlign: "center",
      borderBottom: "1px solid #e0e0e0",
      fontSize: "1.1rem",
      fontWeight: "500",
      color: "#333333", // Ensure text is not white
    },
    oddRow: {
      backgroundColor: "#f8f9fa",
    },
    evenRow: {
      backgroundColor: "white",
    },
    cardsContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "15px",
      marginBottom: "25px",
      padding: "10px",
    },
    flipCard: {
      width: "200px",
      height: "150px",
      perspective: "1000px",
      cursor: "pointer",
    },
    flipCardInner: {
      position: "relative",
      width: "100%",
      height: "100%",
      textAlign: "center",
      transition: "transform 0.6s ease-in-out",
      transformStyle: "preserve-3d",
    },
    flipCardFront: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      background: "#cd853f",
      color: "white",
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.1rem",
      fontWeight: "700",
      boxShadow: "0 8px 20px rgba(205, 133, 63, 0.3)",
      padding: "15px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
    },
    flipCardBack: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      background: "#cd853f",
      color: "white",
      borderRadius: "18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      fontWeight: "600",
      boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)",
      padding: "15px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
    },
    quizContainer: {
      marginBottom: "30px",
      padding: "20px",
      borderRadius: "15px",
      background: "rgba(248, 249, 250, 0.8)",
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
    },
    quizQuestion: {
      fontSize: "1.4rem",
      fontWeight: "700",
      color: "#8b4513",
      marginBottom: "20px",
      textAlign: "center",
      lineHeight: "1.4",
    },
    optionButton: {
      display: "block",
      width: "100%",
      padding: "15px 20px",
      margin: "10px 0",
      border: "2px solid #e0e0e0",
      borderRadius: "12px",
      background: "white",
      cursor: "pointer",
      fontSize: "1.1rem",
      transition: "all 0.3s ease",
      textAlign: "left",
      fontWeight: "500",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    correctOption: {
      background: "#cd853f",
      color: "white",
      borderColor: "#cd853f",
      boxShadow: "0 5px 15px rgba(205, 133, 63, 0.3)",
    },
    incorrectOption: {
      background: "#cd853f",
      color: "white",
      borderColor: "#cd853f",
      boxShadow: "0 5px 15px rgba(205, 133, 63, 0.3)",
    },
    explanation: {
      background: "rgba(205, 133, 63, 0.1)",
      padding: "18px",
      borderRadius: "12px",
      marginTop: "15px",
      borderLeft: "4px solid #cd853f",
      fontSize: "1rem",
      lineHeight: "1.5",
      color: "#333333",
    },
    tip: {
      background: "#cd853f",
      color: "white",
      padding: "15px 20px",
      borderRadius: "12px",
      margin: "15px 0",
      fontSize: "1rem",
      fontWeight: "500",
      boxShadow: "0 5px 15px rgba(205, 133, 63, 0.3)",
      lineHeight: "1.4",
    },
    navigationButtons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "40px",
      gap: "20px",
    },
    navBtn: {
      padding: "12px 30px",
      border: "none",
      borderRadius: "25px",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      background: "#cd853f",
      color: "white",
      boxShadow: "0 5px 15px rgba(205, 133, 63, 0.3)",
      minWidth: "120px",
    },
  };

  const handleCardFlip = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleQuizAnswer = (quizIndex, optionIndex, isCorrect) => {
    setQuizStates((prev) => ({
      ...prev,
      [quizIndex]: {
        answer: optionIndex,
        showAnswer: true,
      },
    }));
  };

  const handleButtonHover = (e) => {
    e.target.style.background = "linear-gradient(45deg, #a0522d, #cd853f)";
    e.target.style.transform = "translateY(-3px) scale(1.05)";
    e.target.style.boxShadow = "0 10px 30px rgba(139, 69, 19, 0.5)";
  };

  const handleButtonLeave = (e) => {
    e.target.style.background = "linear-gradient(45deg, #8b4513, #a0522d)";
    e.target.style.transform = "translateY(0) scale(1)";
    e.target.style.boxShadow = "0 6px 20px rgba(139, 69, 19, 0.4)";
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleBackToLearning = () => {
    navigate("/learn");
  };

  const renderIntroSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Past Tense - लङ् लकार</h2>
      <div style={styles.keyRule}>
        Past Tense = Actions that have happened
        <br />
        In Sanskrit: <strong>लङ् लकार (Laṅ Lakāra)</strong>
      </div>
      <div style={styles.tip}>
        <strong>Key Memory Aid:</strong> "Yesterday's actions are done!"
        (Think: <strong>Past = Back</strong>)
      </div>
      <div style={styles.exampleBox}>
        अहम् पुस्तकम् अपठम्।
        <br />
        <small
          style={{
            fontSize: "1.1rem",
            opacity: 0.9,
            marginTop: "10px",
            display: "block",
          }}
        >
          I read a book (yesterday)
        </small>
      </div>
    </div>
  );

  const renderFormationSection = () => (
    <div>
      <h2 style={styles.sectionTitle}> How to Form Past Tense</h2>
      <div style={styles.formulaBox}>
        Verb Root + अ + Person Ending = Past Tense
        <br />
        <small
          style={{
            fontSize: "1.1rem",
            opacity: 0.9,
            marginTop: "10px",
            display: "block",
          }}
        >
          धातु + अ + पुरुष प्रत्यय = लङ् लकार
        </small>
      </div>

      <div style={styles.tip}>
        <strong>Step 1:</strong> Take the verb root (धातु) - like गम् (to go)
      </div>
      <div style={styles.tip}>
        <strong>Step 2:</strong> Add अ - गम् becomes अगच्छ
      </div>
      <div style={styles.tip}>
        <strong>Step 3:</strong> Add person ending - अगच्छ + अम् = अगच्छम् (I
        went)
      </div>

      <div style={styles.exampleBox}>
        गम् → अगच्छ → अगच्छम्
        <br />
        <small
          style={{
            fontSize: "1.1rem",
            opacity: 0.9,
            marginTop: "10px",
            display: "block",
          }}
        >
          Root → Past Stem → I went
        </small>
      </div>
    </div>
  );

  const renderEndingsSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Past Tense Endings</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Person (पुरुष)</th>
            <th style={styles.tableHeader}>Singular (एकवचन)</th>
            <th style={styles.tableHeader}>Dual (द्विवचन)</th>
            <th style={styles.tableHeader}>Plural (बहुवचन)</th>
          </tr>
        </thead>
        <tbody>
          {endingsData.map((row, index) => (
            <tr
              key={index}
              style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
            >
              <td style={styles.tableCell}>
                <strong>{row.person}</strong>
              </td>
              <td style={styles.tableCell}>{row.singular}</td>
              <td style={styles.tableCell}>{row.dual}</td>
              <td style={styles.tableCell}>{row.plural}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={styles.tip}>
        <strong>Memory Trick:</strong> Add अ + unique endings (अम्, थाः, त्
        etc.)
      </div>
    </div>
  );

  const renderExamplesSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Common Verb Examples</h2>
      <div style={styles.cardsContainer}>
        {verbExamples.map((verb, index) => (
          <div
            key={index}
            style={styles.flipCard}
            onClick={() => handleCardFlip(index)}
          >
            <div
              style={{
                ...styles.flipCardInner,
                transform: flippedCards[index]
                  ? "rotateY(180deg)"
                  : "rotateY(0deg)",
              }}
            >
              <div style={styles.flipCardFront}>
                <strong>{verb.root}</strong>
                <br />
                <small style={{ marginTop: "10px", opacity: 0.9 }}>
                  Click to see forms
                </small>
              </div>
              <div style={styles.flipCardBack}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    color: "white",
                  }}
                >
                  <strong>3rd:</strong> {verb.forms[0]}
                  <br />
                  <strong>2nd:</strong> {verb.forms[1]}
                  <br />
                  <strong>1st:</strong> {verb.forms[2]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.tip}>
        <strong>Tip:</strong> The अ prefix signals past action across all
        verbs
      </div>
    </div>
  );

  const renderQuizSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Test Your Knowledge</h2>
      {quizzes.map((quiz, quizIndex) => {
        const currentState = quizStates[quizIndex] || {
          answer: null,
          showAnswer: false,
        };
        return (
          <div key={quizIndex} style={styles.quizContainer}>
            <div style={styles.quizQuestion}>
              Quiz {quizIndex + 1}: {quiz.question}
            </div>
            {quiz.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                style={{
                  ...styles.optionButton,
                  color: "#333333",
                  ...(currentState.showAnswer && optionIndex === quiz.correct
                    ? styles.correctOption
                    : {}),
                  ...(currentState.showAnswer &&
                  currentState.answer === optionIndex &&
                  optionIndex !== quiz.correct
                    ? styles.incorrectOption
                    : {}),
                }}
                onClick={() =>
                  handleQuizAnswer(
                    quizIndex,
                    optionIndex,
                    optionIndex === quiz.correct
                  )
                }
                disabled={currentState.showAnswer}
              >
                {option}
              </button>
            ))}
            {currentState.showAnswer && (
              <div style={styles.explanation}>
                <strong>Explanation:</strong> {quiz.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPracticeSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Excellent Progress!</h2>
      <div style={styles.keyRule}>
        <strong>You've Learned Past Tense!</strong>
        <br />
        Now you can express actions that happened in Sanskrit!
      </div>

      <div style={styles.exampleBox}>
        Practice Sentences:
        <br />
        <div
          style={{ fontSize: "1.3rem", marginTop: "15px", lineHeight: "1.8" }}
        >
          अहम् गृहम् अगच्छम्। (I went home)
          <br />
          त्वम् पुस्तकम् अपठः। (You read a book)
          <br />
          सः मित्रम् अदर्शत्। (He saw a friend)
        </div>
      </div>

      <div style={styles.tip}>
        <strong>Next Steps:</strong> Practice with more verbs • Learn future
        tense • Try storytelling!
      </div>

      <div style={styles.tip}>
        <strong>Pro Tip:</strong> Recall yesterday's events and convert them
        to Sanskrit daily!
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (sections[currentSection]) {
      case "intro":
        return renderIntroSection();
      case "formation":
        return renderFormationSection();
      case "endings":
        return renderEndingsSection();
      case "examples":
        return renderExamplesSection();
      case "quiz":
        return renderQuizSection();
      case "practice":
        return renderPracticeSection();
      default:
        return renderIntroSection();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sanskrit Past Tense</h1>
        <p style={styles.subtitle}>लङ् लकार - Actions Done</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            style={styles.backButton}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </button>
          <button
            style={styles.backButton}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={handleBackToLearning}
          >
            ← Back to Learning
          </button>
        </div>

        <div style={styles.progressBar}>
          <div style={styles.progress}></div>
        </div>

        <div style={styles.navigation}>
          {[
            "Intro",
            "Formation",
            "Endings",
            "Examples",
            "Quiz",
            "Practice",
          ].map((label, index) => (
            <button
              key={index}
              style={{
                ...styles.navButton,
                ...(currentSection === index
                  ? styles.activeNavButton
                  : styles.inactiveNavButton),
              }}
              onClick={() => {
                setCurrentSection(index);
                setQuizStates({});
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.contentCard}>
        {renderCurrentSection()}

        <div style={styles.navigationButtons}>
          <button
            style={{
              ...styles.navBtn,
              opacity: currentSection === 0 ? 0.5 : 1,
            }}
            onClick={() => {
              setCurrentSection(Math.max(0, currentSection - 1));
              setQuizStates({});
            }}
            disabled={currentSection === 0}
          >
            ← Previous
          </button>

          <button
            style={{
              ...styles.navBtn,
              opacity: currentSection === sections.length - 1 ? 0.5 : 1,
            }}
            onClick={() => {
              setCurrentSection(
                Math.min(sections.length - 1, currentSection + 1)
              );
              setQuizStates({});
            }}
            disabled={currentSection === sections.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnPastTense;
