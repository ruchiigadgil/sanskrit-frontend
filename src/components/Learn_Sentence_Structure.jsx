import React, { useState, useEffect } from 'react';

const LearnSanskritSentence = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [quizStates, setQuizStates] = useState({});
  const [quizGame, setQuizGame] = useState({
    currentPronoun: null,
    targets: [],
    attempts: 0,
    feedback: '',
    isDropping: false, // Added to prevent multiple drops
  });

  const sections = [
    'intro',
    'subjectObject',
    'verbs',
    'personNumber',
    'quiz',
    'practice'
  ];

  const quizzes = [
    {
      question: "Translate: 'The boy reads the book'",
      options: [
        "बालकः पुस्तकम् पठति",
        "बालकः पुस्तकः पठति",
        "बालकम् पुस्तकम् पठति"
      ],
      correct: 0,
      explanation: "बालकः is the subject (Prathama Vibhakti) and पुस्तकम् is the object (Dvitiya Vibhakti)."
    },
    {
      question: "They (two) go to the village",
      options: [
        "तौ ग्रामम् गच्छतः",
        "ते ग्रामम् गच्छति",
        "तौ ग्रामः गच्छतः"
      ],
      correct: 0,
      explanation: "तौ is the dual subject pronoun, and गच्छतः is the dual third-person verb form."
    }
  ];

  const endingsData = [
    {
      type: "Masculine -a",
      prathamaSing: "रामः",
      dvitiyaSing: "रामम्",
      prathamaDual: "रामौ",
      dvitiyaDual: "रामौ",
      prathamaPlural: "रामाः",
      dvitiyaPlural: "रामान्"
    },
    {
      type: "Feminine -ā",
      prathamaSing: "सीता",
      dvitiyaSing: "सीताम्",
      prathamaDual: "सीते",
      dvitiyaDual: "सीते",
      prathamaPlural: "सीताः",
      dvitiyaPlural: "सीताः"
    },
    {
      type: "Neuter -a",
      prathamaSing: "फलम्",
      dvitiyaSing: "फलम्",
      prathamaDual: "फले",
      dvitiyaDual: "फले",
      prathamaPlural: "फलानि",
      dvitiyaPlural: "फलानि"
    }
  ];

  const verbData = [
    { root: "पठ् (read)", singular: "पठति", dual: "पठतः", plural: "पठन्ति" },
    { root: "गम् (go)", singular: "गच्छति", dual: "गच्छतः", plural: "गच्छन्ति" },
    { root: "कृ (do)", singular: "करोति", dual: "कुरुतः", plural: "कुर्वन्ति" }
  ];

  const pronounData = [
    { pronoun: "अहम्", person: "First", number: "Singular" },
    { pronoun: "आवाम्", person: "First", number: "Dual" },
    { pronoun: "वयम्", person: "First", number: "Plural" },
    { pronoun: "त्वम्", person: "Second", number: "Singular" },
    { pronoun: "युवाम्", person: "Second", number: "Dual" },
    { pronoun: "यूयम्", person: "Second", number: "Plural" },
    { pronoun: "सः", person: "Third", number: "Singular" },
    { pronoun: "तौ", person: "Third", number: "Dual" },
    { pronoun: "ते", person: "Third", number: "Plural" }
  ];

  useEffect(() => {
    // Initialize quiz with a random pronoun and targets
    if (!quizGame.currentPronoun || quizGame.attempts >= 3) {
      const randomPronoun = pronounData[Math.floor(Math.random() * pronounData.length)];
      const targets = [
        { id: '1', label: `${randomPronoun.person}, ${randomPronoun.number}`, correct: true },
        { id: '2', label: `${pronounData[Math.floor(Math.random() * pronounData.length)].person}, ${pronounData[Math.floor(Math.random() * pronounData.length)].number}`, correct: false },
        { id: '3', label: `${pronounData[Math.floor(Math.random() * pronounData.length)].person}, ${pronounData[Math.floor(Math.random() * pronounData.length)].number}`, correct: false }
      ].sort(() => Math.random() - 0.5).filter((t, i, arr) => 
        i === arr.findIndex((t2) => t2.label === t.label) // Remove duplicates
      );
      setQuizGame({
        currentPronoun: randomPronoun.pronoun,
        targets: targets,
        attempts: 0,
        feedback: '',
        isDropping: false,
      });
    }
  }, [quizGame.attempts]);

  const handleDragStart = (e, pronoun) => {
    e.dataTransfer.setData('text/plain', pronoun);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (quizGame.isDropping) return; // Prevent multiple drops
    setQuizGame(prev => ({ ...prev, isDropping: true }));

    const pronoun = e.dataTransfer.getData('text/plain');
    const target = quizGame.targets.find(t => t.id === targetId);

    if (target.correct) {
      setQuizGame(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        feedback: 'Correct!',
        isDropping: false,
      }));
    } else {
      setQuizGame(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        feedback: 'Try again! 😕',
        isDropping: false,
      }));
    }

    // Auto-move to next question after a short delay
    setTimeout(() => {
      setQuizGame(prev => ({
        ...prev,
        feedback: '',
      }));
    }, 1000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetQuiz = () => {
    setQuizGame(prev => ({
      ...prev,
      currentPronoun: null,
      targets: [],
      attempts: 0,
      feedback: '',
      isDropping: false,
    }));
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d76d2b, #f0c14b)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif'"
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      color: 'white',
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '10px',
      textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1.2rem',
      fontWeight: '500',
      marginBottom: '20px'
    },
    progressBar: {
      width: '100%',
      maxWidth: '600px',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '4px',
      margin: '0 auto 20px',
      overflow: 'hidden'
    },
    progress: {
      height: '100%',
      background: '#cd853f',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
      width: `${((currentSection + 1) / sections.length) * 100}%`
    },
    navigation: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '30px'
    },
    navButton: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    activeNavButton: {
      background: 'white',
      color: '#ff6b35'
    },
    inactiveNavButton: {
      background: 'rgba(255, 255, 255, 0.3)',
      color: 'white'
    },
    contentCard: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(20px)'
    },
    sectionTitle: {
      color: '#8b4513',
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '20px',
      textAlign: 'center'
    },
    keyRule: {
      background: '#cd853f',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '15px',
      textAlign: 'center',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(205, 133, 63, 0.3)'
    },
    exampleBox: {
      background: '#cd853f',
      color: 'white',
      padding: '20px',
      borderRadius: '15px',
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(205, 133, 63, 0.3)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '20px',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    },
    tableHeader: {
      background: '#cd853f',
      color: 'white',
      padding: '15px',
      textAlign: 'center',
      fontWeight: '600'
    },
    tableCell: {
      padding: '12px 15px',
      textAlign: 'center',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '1.1rem',
      color: 'black'
    },
    oddRow: {
      backgroundColor: '#f9f9f9'
    },
    evenRow: {
      backgroundColor: 'white'
    },
    draggable: {
      background: '#cd853f',
      color: 'black',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '1.2rem',
      fontWeight: '600',
      cursor: 'move',
      userSelect: 'none',
      marginBottom: '20px',
      display: 'inline-block',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease'
    },
    dropTarget: {
      background: '#cd853f',
      color: 'black',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '1.1rem',
      fontWeight: '500',
      margin: '10px',
      display: 'inline-block',
      width: '200px',
      textAlign: 'center',
      minHeight: '60px',
      transition: 'background 0.3s ease',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    dropTargetHover: {
      background: '#b86b2c',
      transform: 'scale(1.05)'
    },
    feedback: {
      textAlign: 'center',
      fontSize: '1.2rem',
      color: 'black',
      marginTop: '20px',
      padding: '10px',
      borderRadius: '10px',
      fontWeight: '600',
      animation: 'fadeIn 1s'
    },
    resetButton: {
      display: 'block',
      margin: '0 auto',
      padding: '10px 20px',
      background: '#cd853f',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    quizContainer: {
      marginBottom: '20px'
    },
    quizQuestion: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#8b4513',
      marginBottom: '15px',
      textAlign: 'center'
    },
    optionButton: {
      display: 'block',
      width: '100%',
      padding: '12px 20px',
      margin: '8px 0',
      border: '2px solid #ddd',
      borderRadius: '10px',
      background: 'white',
      cursor: 'pointer',
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      color: 'black'
    },
    correctOption: {
      background: '#cd853f',
      color: 'black',
      borderColor: '#cd853f'
    },
    incorrectOption: {
      background: '#cd853f',
      color: 'black',
      borderColor: '#cd853f'
    },
    explanation: {
      background: 'rgba(205, 133, 63, 0.1)',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '15px',
      borderLeft: '4px solid #cd853f',
      color: 'black'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '30px'
    },
    navBtn: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      background: '#cd853f',
      color: 'white'
    },
    tip: {
      background: '#cd853f',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '10px',
      margin: '10px 0',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    funFact: {
      background: '#cd853f',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '10px',
      margin: '10px 0',
      fontSize: '0.95rem',
      fontWeight: '500',
      textAlign: 'center'
    }
  };

  const renderIntroSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Introduction to Sanskrit Sentence Structure</h2>
      <div style={styles.keyRule}>
        Sanskrit sentences typically follow Subject-Object-Verb (SOV) order.<br/>
        Key components: Subject (Prathama Vibhakti), Object (Dvitiya Vibhakti), and Verb.
      </div>
      <div style={styles.tip}>
        <strong>Key Memory Aid:</strong> "Subject → Object → Verb" (Think: SOV like 'Save Our Village'!)
      </div>
      <div style={styles.funFact}>
        <strong>Fun Fact:</strong> Sanskrit sentences are flexible—word order (SOV, OSV, etc.) doesn't change the meaning due to case endings!
      </div>
    </div>
  );

  const renderSubjectObjectSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Subject and Object</h2>
      <div style={styles.exampleBox}>
        रामः <span style={{color: '#ffff00'}}>पुस्तकम्</span> पठति।
        <br/>
        <small style={{fontSize: '1rem', opacity: 0.9}}>
          Rama reads <strong>the book</strong> (Rama = Subject, Book = Object)
        </small>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Type</th>
            <th style={styles.tableHeader}>Prathama Singular</th>
            <th style={styles.tableHeader}>Dvitiya Singular</th>
            <th style={styles.tableHeader}>Prathama Dual</th>
            <th style={styles.tableHeader}>Dvitiya Dual</th>
            <th style={styles.tableHeader}>Prathama Plural</th>
            <th style={styles.tableHeader}>Dvitiya Plural</th>
          </tr>
        </thead>
        <tbody>
          {endingsData.map((row, index) => (
            <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <td style={styles.tableCell}><strong>{row.type}</strong></td>
              <td style={styles.tableCell}>{row.prathamaSing}</td>
              <td style={styles.tableCell}>{row.dvitiyaSing}</td>
              <td style={styles.tableCell}>{row.prathamaDual}</td>
              <td style={styles.tableCell}>{row.dvitiyaDual}</td>
              <td style={styles.tableCell}>{row.prathamaPlural}</td>
              <td style={styles.tableCell}>{row.dvitiyaPlural}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={styles.tip}>
        <strong>Tip:</strong> Prathama Vibhakti marks the subject, Dvitiya marks the object. Dual forms are unique to Sanskrit!
      </div>
    </div>
  );

  const renderVerbsSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Verbs in Sanskrit</h2>
      <div style={styles.keyRule}>
        Verbs change based on person (first, second, third) and number (singular, dual, plural).
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Verb Root</th>
            <th style={styles.tableHeader}>Singular (3rd Person)</th>
            <th style={styles.tableHeader}>Dual (3rd Person)</th>
            <th style={styles.tableHeader}>Plural (3rd Person)</th>
          </tr>
        </thead>
        <tbody>
          {verbData.map((verb, index) => (
            <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <td style={styles.tableCell}>{verb.root}</td>
              <td style={styles.tableCell}>{verb.singular}</td>
              <td style={styles.tableCell}>{verb.dual}</td>
              <td style={styles.tableCell}>{verb.plural}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={styles.tip}>
        <strong>Tip:</strong> Verbs agree with the subject's number and person. Dual verbs end in -तः.
      </div>
    </div>
  );

  const renderPersonNumberSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Person and Number</h2>
      <div style={styles.keyRule}>
        Person (First, Second, Third) and Number (Singular, Dual, Plural) determine verb and pronoun forms.
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Person</th>
            <th style={styles.tableHeader}>Number</th>
            <th style={styles.tableHeader}>Pronoun</th>
            <th style={styles.tableHeader}>Example Sentence (with Verb)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.evenRow}>
            <td style={styles.tableCell}>First</td>
            <td style={styles.tableCell}>Singular</td>
            <td style={styles.tableCell}>अहम् (I)</td>
            <td style={styles.tableCell}>अहम् पठामि (I read)</td>
          </tr>
          <tr style={styles.oddRow}>
            <td style={styles.tableCell}>First</td>
            <td style={styles.tableCell}>Dual</td>
            <td style={styles.tableCell}>आवाम् (We two)</td>
            <td style={styles.tableCell}>आवाम् पठवः (We two read)</td>
          </tr>
          <tr style={styles.evenRow}>
            <td style={styles.tableCell}>First</td>
            <td style={styles.tableCell}>Plural</td>
            <td style={styles.tableCell}>वयम् (We all)</td>
            <td style={styles.tableCell}>वयम् पठामः (We all read)</td>
          </tr>
          <tr style={styles.oddRow}>
            <td style={styles.tableCell}>Second</td>
            <td style={styles.tableCell}>Singular</td>
            <td style={styles.tableCell}>त्वम् (You)</td>
            <td style={styles.tableCell}>त्वम् पठसि (You read)</td>
          </tr>
          <tr style={styles.evenRow}>
            <td style={styles.tableCell}>Second</td>
            <td style={styles.tableCell}>Dual</td>
            <td style={styles.tableCell}>युवाम् (You two)</td>
            <td style={styles.tableCell}>युवाम् पठथः (You two read)</td>
          </tr>
          <tr style={styles.oddRow}>
            <td style={styles.tableCell}>Second</td>
            <td style={styles.tableCell}>Plural</td>
            <td style={styles.tableCell}>यूयम् (You all)</td>
            <td style={styles.tableCell}>यूयम् पठथ (You all read)</td>
          </tr>
          <tr style={styles.evenRow}>
            <td style={styles.tableCell}>Third</td>
            <td style={styles.tableCell}>Singular</td>
            <td style={styles.tableCell}>सः (He)</td>
            <td style={styles.tableCell}>सः पठति (He reads)</td>
          </tr>
          <tr style={styles.oddRow}>
            <td style={styles.tableCell}>Third</td>
            <td style={styles.tableCell}>Dual</td>
            <td style={styles.tableCell}>तौ (They two)</td>
            <td style={styles.tableCell}>तौ पठतः (They two read)</td>
          </tr>
          <tr style={styles.evenRow}>
            <td style={styles.tableCell}>Third</td>
            <td style={styles.tableCell}>Plural</td>
            <td style={styles.tableCell}>ते (They all)</td>
            <td style={styles.tableCell}>ते पठन्ति (They all read)</td>
          </tr>
        </tbody>
      </table>
      <div>
        {quizGame.currentPronoun && (
          <div>
            <div
              style={styles.draggable}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, quizGame.currentPronoun)}
            >
              {quizGame.currentPronoun}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {quizGame.targets.map(target => (
                <div
                  key={target.id}
                  style={{
                    ...styles.dropTarget,
                    ...(quizGame.feedback && target.correct ? { background: '#cd853f' } : {}),
                    ...(quizGame.feedback && !target.correct ? { background: '#cd853f' } : {})
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, target.id)}
                >
                  {target.label}
                </div>
              ))}
            </div>
            {quizGame.feedback && <div style={styles.feedback}>{quizGame.feedback}</div>}
            <button style={styles.resetButton} onClick={resetQuiz}>Next Question</button>
          </div>
        )}
      </div>
      <div style={styles.tip}>
        <strong>Tip:</strong> Drag the pronoun to the correct person and number! Use the table for hints.
      </div>
    </div>
  );

  const renderQuizSection = () => (
    <div>
      <h2 style={styles.sectionTitle}>Interactive Quiz</h2>
      {quizzes.map((quiz, quizIndex) => {
        const currentState = quizStates[quizIndex] || { answer: null, showAnswer: false };
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
                  ...(currentState.showAnswer && optionIndex === quiz.correct ? styles.correctOption : {}),
                  ...(currentState.showAnswer && currentState.answer === optionIndex && optionIndex !== quiz.correct ? styles.incorrectOption : {})
                }}
                onClick={() => handleQuizAnswer(quizIndex, optionIndex, optionIndex === quiz.correct)}
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
      <h2 style={styles.sectionTitle}>Practice Time!</h2>
      <div style={styles.keyRule}>
        Try forming sentences with Subject (Prathama) + Object (Dvitiya) + Verb!<br/>
        Example: सः फलम् खादति (He eats the fruit).
      </div>
      <div style={styles.tip}>
        <strong>Next Steps:</strong> Practice with flashcards, create your own sentences, or take a final test!
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch(sections[currentSection]) {
      case 'intro': return renderIntroSection();
      case 'subjectObject': return renderSubjectObjectSection();
      case 'verbs': return renderVerbsSection();
      case 'personNumber': return renderPersonNumberSection();
      case 'quiz': return renderQuizSection();
      case 'practice': return renderPracticeSection();
      default: return renderIntroSection();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sanskrit Sentence Structure</h1>
        <p style={styles.subtitle}>Learn Subjects, Objects, Verbs, Person, and Number</p>
        <div style={styles.progressBar}>
          <div style={styles.progress}></div>
        </div>
        <div style={styles.navigation}>
          {['Intro', 'Subject & Object', 'Verbs', 'Person & Number', 'Quiz', 'Practice'].map((label, index) => (
            <button
              key={index}
              style={{
                ...styles.navButton,
                ...(currentSection === index ? styles.activeNavButton : styles.inactiveNavButton)
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
              opacity: currentSection === 0 ? 0.5 : 1
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
              opacity: currentSection === sections.length - 1 ? 0.5 : 1
            }}
            onClick={() => {
              setCurrentSection(Math.min(sections.length - 1, currentSection + 1));
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

export default LearnSanskritSentence;
