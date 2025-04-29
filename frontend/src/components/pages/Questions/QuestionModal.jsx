import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useAuth } from "../../store/UseAuth";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function QuestionModal({ open, setOpen, question }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    if (open && question?._id) {
      fetchAnswers();
    }
  }, [open, question]);

  const handleAddAnswer = async () => {
    if (!newAnswer.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/ques/${question._id}/answer`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: newAnswer, userId: user._id, username: user.username }),
      });

      if (response.ok) {
        fetchAnswers();
        setNewAnswer("");
      }
    } catch (error) {
      console.error("Failed to add answer", error);
    }
  };

  const [error, setError] = useState("");

  const fetchAnswers = async () => {
    try {
      setError("");
      const response = await fetch(`${BASE_URL}/ques/${question._id}/answer`);
      if (!response.ok) throw new Error("Failed to fetch answers");
      const data = await response.json();
      setAnswers(data.answers || []);
    } catch (error) {
      console.error(error);
      setError("Failed to load answers. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-2xl bg-gray-950 text-white rounded-lg p-6 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{question?.question}</DialogTitle>
          <p className="text-sm text-gray-400">Asked by {question?.username}</p>
        </DialogHeader>

        {/* Answers List */}
        <div className="space-y-4 max-h-60 overflow-y-auto scroll-smooth bg-gray-900 p-4 rounded-lg">
          {answers.length > 0 ? (
            answers.map((answer, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-md">
                <p className="text-white">{answer.text}</p>
                <p className="text-xs text-gray-400">- {answer.username}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No answers yet. Be the first to answer!</p>
          )}
        </div>

        {/* Answer Input Field */}
        <div className="mt-4">
          <textarea
            className="w-full p-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-purple-600"
            placeholder="Write your answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={3}
          />
          <DialogFooter className="flex justify-between mt-3">
            <Button className="hidden sm:block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md"
              onClick={handleAddAnswer}
              disabled={!newAnswer.trim()}
            >
              Submit Answer
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
