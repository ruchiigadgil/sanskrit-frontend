import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, tokenManager } from "../services/api";

const ShabdaFusion = ({ score: propScore }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const globalScore = location.state?.score ?? propScore ?? 0;
  const [sessionScore, setSessionScore] = useState(0);
  const [gameData, setGameData] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [matchedItems, setMatchedItems] = useState([]);
  const [shuffledSubjects, setShuffledSubjects] = useState([]);
  const [shuffledVerbs, setShuffledVerbs] = useState([]);
  const [error, setError] = useState(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const numberNames = {
    sg: "singular",
    du: "dual",
    pl: "plural",
  };

  const updateScore = async (gameName, scoreIncrement) => {
    try {
      const token = tokenManager.getToken();
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id;
      if (!token) {
        throw new Error("No token found, please log in again");
      }
      if (!userId) {
        throw new Error("No user ID found, please log in again");
      }
      const response = await authAPI.updateScore({
        user_id: userId,
        score: scoreIncrement,
        game_type: gameName,
      });
      return response.score;
    } catch (err) {
      if (
        err.message.includes("token") ||
        err.message.includes("Unauthorized")
      ) {
        tokenManager.removeToken();
        navigate("/login", { state: { from: location.pathname } });
      }
      setError(err.message || "Failed to update score");
      throw err;
    }
  };

  const fetchGameData = async (retries = 3, delay = 1000) => {
    setIsLoading(true);
    for (let i = 0; i < retries; i++) {
      try {
        const data = await authAPI.getMatchingGame();
        setGameData(data);
        startNewGame(data);
        setIsLoading(false);
        return;
      } catch (err) {
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        console.error("Failed to load matching game data:", err);
        setError("Failed to load game data. Please try again.");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const startNewGame = (data = gameData) => {
    if (!data.length) return;
    const random = data[Math.floor(Math.random() * data.length)];
    setCurrentGame(random);
    setSelectedItem(null);
    setMatchedPairs(0);
    setMatchedItems([]);
    setSessionScore(0);
    setError(null);
    setShowCompletionMessage(false);

    const subjectForms = ["sg", "du", "pl"].map((num) => ({
      text: random.subject_forms[num],
      number: num,
      type: "subject",
    }));

    const verbForms = ["sg", "du", "pl"].map((num) => ({
      text: random.verb_forms[num],
      number: num,
      type: "verb",
    }));

    setShuffledSubjects(shuffle(subjectForms));
    setShuffledVerbs(shuffle(verbForms));
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleItemClick = async (item) => {
    if (matchedItems.includes(item.text)) return;

    if (!selectedItem) {
      setSelectedItem(item);
      return;
    }

    if (selectedItem.text === item.text) {
      setSelectedItem(null);
      return;
    }

    if (selectedItem.type === item.type) {
      setSelectedItem(item);
      return;
    }

    const subject = selectedItem.type === "subject" ? selectedItem : item;
    const verb = selectedItem.type === "verb" ? selectedItem : item;

    const subjectElem = document.getElementById(subject.text);
    const verbElem = document.getElementById(verb.text);

    if (subject.number === verb.number) {
      subjectElem.classList.add("matched");
      verbElem.classList.add("matched");

      setMatchedItems((prev) => [...prev, subject.text, verb.text]);
      setMatchedPairs((prev) => {
        const updated = prev + 1;
        setSessionScore((prev) => prev + 1);
        if (updated === 3) {
          setShowCompletionMessage(true);
        }
        updateScore("shabdaFusion", 1)
          .then((newGlobalScore) => {
            authAPI.profile().catch((err) => {
              setError("Failed to refresh profile: " + err.message);
            });
          })
          .catch((err) => {
            setError(err.message || "Failed to update score");
          });
        return updated;
      });

      document.getElementById("hintDisplay").textContent = "";
      setSelectedItem(null);
    } else {
      subjectElem.classList.add("wrong");
      verbElem.classList.add("wrong");

      const number = subject.number;
      const hint = `
        The <strong>${numberNames[number]}</strong> form of <strong>${currentGame.subject_root}</strong> 
        (${currentGame.subject_forms[number]}) should match with the <strong>${numberNames[number]}</strong> 
        form of <strong>${currentGame.verb_root}</strong> (${currentGame.verb_forms[number]}).
      `;
      document.getElementById("hintDisplay").innerHTML = hint;

      setTimeout(() => {
        subjectElem.classList.remove("wrong", "selected");
        verbElem.classList.remove("wrong", "selected");
        setSelectedItem(null);
      }, 800);
    }
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
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
  
        .shabda-fusion {
          padding: 2rem;
          text-align: center;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
        }

        .shabda-card {
          background: linear-gradient(to bottom right, #fff8e1, #ffe4b5);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          color: #2c2c2c;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
  
        h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 1.5rem;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
  
        .controls {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .controls button {
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

        .controls button:hover {
          background-color: #b86b2c;
          transform: scale(1.05);
        }
  
        .info-panel {
          margin: 1rem 0 1.5rem 0;
          padding: 1rem;
          background-color: rgba(205, 133, 63, 0.15);
          border-radius: 10px;
        }
  
        .root-info, .meaning, .hint, .score, .session-score {
          margin: 0.5rem 0;
          font-size: 1rem;
          font-weight: 500;
          color: #2c2c2c;
        }
  
        .error-message {
          margin-top: 1rem;
          color: #dc2626;
          font-size: 0.95rem;
          font-weight: 500;
        }
  
        .game-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
  
        .column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 200px;
        }

        .column h3 {
          font-size: 1.2rem;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
  
        .item {
          background: rgba(255, 255, 255, 0.5);
          padding: 1rem 1.5rem;
          border-radius: 10px;
          border: 2px solid #cd853f;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c2c2c;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .item:hover {
          background: rgba(205, 133, 63, 0.2);
          transform: translateY(-2px);
        }
  
        .item.selected {
          border: 3px solid #2c2c2c;
          background-color: rgba(205, 133, 63, 0.3);
          transform: scale(1.02);
        }
  
        .matched {
          background: rgba(76, 175, 80, 0.3) !important;
          color: #2c2c2c !important;
          border-color: #4caf50 !important;
          pointer-events: none;
        }
        
        .wrong {
          background: rgba(244, 67, 54, 0.3) !important;
          color: #2c2c2c !important;
          border-color: #f44336 !important;
        }
  
        .completion-message {
          margin-top: 1.5rem;
          padding: 1rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c2c2c;
          background-color: rgba(76, 175, 80, 0.2);
          border-radius: 8px;
        }

        @media (max-width: 600px) {
          .shabda-fusion {
            padding: 1rem;
          }
          .shabda-card {
            padding: 1.5rem;
          }
          h1 {
            font-size: 1.5rem;
          }
          .game-container {
            flex-direction: column;
            gap: 1rem;
          }
          .controls {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="shabda-fusion">
        {isLoading ? (
          <div className="shabda-card">Loading game...</div>
        ) : currentGame ? (
          <div className="shabda-card">
            <h1>Sanskrit Matching Game</h1>

            <div className="controls">
              <button
                onClick={() =>
                  navigate("/dashboard", {
                    state: { score: globalScore + sessionScore },
                  })
                }
              >
                Back to Dashboard
              </button>
              <button onClick={() => startNewGame()}>New Game</button>
            </div>

            <div className="info-panel">
              <div className="root-info">
                Root: {currentGame.subject_root} + {currentGame.verb_root} (
                {currentGame.tense})
              </div>
              <div className="meaning">Meaning: {currentGame.meaning}</div>
              <div className="session-score">Session Score: {sessionScore}</div>
              <div className="score">
                Total Score: {sessionScore}
              </div>
              <div className="hint" id="hintDisplay"></div>
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="game-container">
              <div className="column">
                <h3>Subject Forms</h3>
                {shuffledSubjects.map((item) => (
                  <div
                    key={item.text}
                    id={item.text}
                    className={`item 
                      ${selectedItem?.text === item.text ? "selected" : ""}
                      ${matchedItems.includes(item.text) ? "matched" : ""}
                    `}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
              <div className="column">
                <h3>Verb Forms</h3>
                {shuffledVerbs.map((item) => (
                  <div
                    key={item.text}
                    id={item.text}
                    className={`item 
                      ${selectedItem?.text === item.text ? "selected" : ""}
                      ${matchedItems.includes(item.text) ? "matched" : ""}
                    `}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {showCompletionMessage && (
              <div className="completion-message">
                Well done! All matches correct!
              </div>
            )}
          </div>
        ) : (
          <div className="shabda-card">
            No game data available.{" "}
            <button onClick={() => fetchGameData()}>Retry</button>
          </div>
        )}
      </div>
    </>
  );
};

export default ShabdaFusion;
