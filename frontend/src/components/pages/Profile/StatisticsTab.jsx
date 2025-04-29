import { useEffect, useState } from "react";
import dayjs from "dayjs";

const StatisticsTab = () => {
  const [answers, setAnswers] = useState([]);
  const [answerTagCounts, setAnswerTagCounts] = useState({});
  const [questionTagCounts, setQuestionTagCounts] = useState({});
  const [answerHistory, setAnswerHistory] = useState({});
  const [questionHistory, setQuestionHistory] = useState({});

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAnswers = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const res = await fetch(`${BASE_URL}/ques/answers/user/${userId}`);
        const data = await res.json();
        const answers = data.answers || [];
        setAnswers(answers);

        // 🔢 Tag Counts
        const aTagMap = {};
        const qTagMap = {};
        answers.forEach((ans) => {
          const tags = ans.questionTags;
          if (tags.length === 0) {
            qTagMap["Other"] = (qTagMap["Other"] || 0) + 1;
            aTagMap["Other"] = (aTagMap["Other"] || 0) + 1;
          } else {
            tags.forEach((tag) => {
              qTagMap[tag] = (qTagMap[tag] || 0) + 1;
              aTagMap[tag] = (aTagMap[tag] || 0) + 1;
            });
          }
        });
        setQuestionTagCounts(qTagMap);
        setAnswerTagCounts(aTagMap);

        // 🧮 History Calculation
        const now = dayjs();
        let answersW = 0, answersM = 0, answersY = 0;
        let questionsW = 0, questionsM = 0, questionsY = 0;

        answers.forEach((ans) => {
          const answerDate = dayjs(ans.answerCreatedAt);
          const questionDate = dayjs(ans.questionCreatedAt);

          if (now.diff(answerDate, "week") === 0) answersW++;
          if (now.diff(answerDate, "month") === 0) answersM++;
          if (now.diff(answerDate, "year") === 0) answersY++;

          if (now.diff(questionDate, "week") === 0) questionsW++;
          if (now.diff(questionDate, "month") === 0) questionsM++;
          if (now.diff(questionDate, "year") === 0) questionsY++;
        });

        setAnswerHistory({
          week: answersW,
          month: answersM,
          year: answersY,
          all: answers.length,
        });

        setQuestionHistory({
          week: questionsW,
          month: questionsM,
          year: questionsY,
          all: answers.length, // fallback to same
        });
      } catch (err) {
        console.error("Error fetching answer data:", err);
      }
    };

    fetchAnswers();
  }, []);

  return (
    <div className="bg-gray-950 text-white rounded-xl border border-gray-700 p-6 space-y-6">
      {/* Overview Placeholder */}
      <div className="border border-gray-700 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-1">Activity Overview</h2>
        <p className="text-sm text-gray-400 mb-4">Your activity statistics over time</p>
        <div className="bg-gray-800 h-48 rounded-lg flex items-center justify-center text-gray-400">
          Activity chart would be displayed here
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Question Tags Table */}
        <div className="border border-gray-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Questions by Tags</h2>
          <ul className="space-y-2">
            {Object.entries(questionTagCounts).map(([tag, count]) => (
              <li key={tag} className="flex justify-between">
                <span>{tag}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Answer Tags Table */}
        <div className="border border-gray-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Answers by Tags</h2>
          <ul className="space-y-2">
            {Object.entries(answerTagCounts).map(([tag, count]) => (
              <li key={tag} className="flex justify-between">
                <span>{tag}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Answer History */}
        <div className="border border-gray-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Answer History</h2>
          <ul className="space-y-2">
            <li className="flex justify-between"><span>This Week</span><span className="font-semibold">{answerHistory.week}</span></li>
            <li className="flex justify-between"><span>This Month</span><span className="font-semibold">{answerHistory.month}</span></li>
            <li className="flex justify-between"><span>This Year</span><span className="font-semibold">{answerHistory.year}</span></li>
            <li className="flex justify-between"><span>All Time</span><span className="font-semibold">{answerHistory.all}</span></li>
          </ul>
        </div>

        {/* Question History */}
        <div className="border border-gray-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Question History</h2>
          <ul className="space-y-2">
            <li className="flex justify-between"><span>This Week</span><span className="font-semibold">{questionHistory.week}</span></li>
            <li className="flex justify-between"><span>This Month</span><span className="font-semibold">{questionHistory.month}</span></li>
            <li className="flex justify-between"><span>This Year</span><span className="font-semibold">{questionHistory.year}</span></li>
            <li className="flex justify-between"><span>All Time</span><span className="font-semibold">{questionHistory.all}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
