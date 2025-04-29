import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { QuestionModal } from "../Questions/QuestionModal";

const ActivityTab = () => {
  const [activityList, setActivityList] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const [answeredRes, askedRes] = await Promise.all([
          fetch(`${BASE_URL}/ques/answers/user/${userId}`),
          fetch(`${BASE_URL}/ques/user/${userId}`),
        ]);

        const answeredData = await answeredRes.json();
        const askedData = await askedRes.json();

        const answered = (answeredData.answers || []).map((item) => ({
          type: "answered",
          _id: item.questionId,
          title: item.questionText,
          body: item.answerText,
          createdAt: item.answerCreatedAt,
          username: item.questionAskedByUsername,
        }));

        const asked = (askedData.questions || []).map((q) => ({
          type: "asked",
          _id: q._id,
          title: q.question,
          body: q.answers?.[0]?.text || "No answers yet.",
          createdAt: q.createdAt,
          username: q.username,
        }));

        const combined = [...answered, ...asked].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setActivityList(combined);
      } catch (err) {
        console.error("Error loading activity:", err);
      }
    };

    fetchActivity();
  }, []);

  const handleOpenModal = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="space-y-4">
      {activityList.map((item) => (
        <div
          key={`${item.type}-${item._id}`}
          className="bg-gray-950 border border-[#2c2c32] rounded-xl p-5 hover:border-purple-600 transition"
        >
          <div className="flex items-start gap-4">
            <div className="pt-1">
              {item.type === "asked" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#a78bfa" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M2 8a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6H9l-5 4v-4H4a6 6 0 0 1-2-4V8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#34d399" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M20 17.17L18.83 16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2v.17zM4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6l-4 4V6a2 2 0 0 1 2-2z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-white font-semibold text-md mb-1">
                {item.type === "answered" ? (
                  <>
                    Answered: <span className="text-white font-medium">{item.title}</span>
                  </>
                ) : (
                  <>Asked: <span className="text-white font-medium">{item.title}</span></>
                )}
              </h2>

              <p className="text-gray-400 text-sm line-clamp-2">{item.body}</p>

              <div className="flex items-center text-sm text-gray-500 mt-2">
                <span>{dayjs(item.createdAt).fromNow()}</span>
                <button
                  onClick={() => handleOpenModal(item)}
                  className="ml-auto px-3 py-1 text-xs rounded-full bg-purple-600 hover:bg-purple-500 text-white"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ✅ Consistent with PublicQues */}
      {selectedQuestion && (
        <QuestionModal
          open={!!selectedQuestion}
          setOpen={() => setSelectedQuestion(null)}
          question={{
            _id: selectedQuestion._id,
            question: selectedQuestion.title,
            username: selectedQuestion.username || selectedQuestion.userName || "Unknown"
          }}
        />
      )}
    </div>
  );
};

export default ActivityTab;
