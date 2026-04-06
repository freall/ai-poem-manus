import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { markPoemLearned, recordQuestionAttempt, toggleFavorite, useLearningRecord } from "@/lib/learning";
import { getPoemById, getPoemImageUrl, getQuizQuestions } from "@/lib/poems";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const poemId = Number.parseInt(id || "1", 10);
  const poem = getPoemById(poemId);
  const learningRecord = useLearningRecord(poemId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [celebrateShow, setCelebrateShow] = useState(false);

  const questions = useMemo(() => (poem ? getQuizQuestions(poem) : []), [poem]);
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCelebrateShow(false);
  }, [poemId]);

  const handleAnswerClick = (answer: string) => {
    if (!currentQuestion || showResult) return;

    const correct = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setShowResult(true);
    recordQuestionAttempt(poemId, correct);

    if (correct) {
      setCelebrateShow(true);
      window.setTimeout(() => setCelebrateShow(false), 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }

    markPoemLearned(poemId);
    setLocation("/dashboard");
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex === 0) return;

    setCurrentQuestionIndex((index) => index - 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (!poem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>未找到这首诗词</CardTitle>
            <CardDescription>请返回列表重新选择。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/")}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white py-6 px-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/20">
            ← 返回
          </Button>
          <h1 className="text-2xl font-bold text-center flex-1 truncate">{poem.title}</h1>
          <button onClick={() => toggleFavorite(poem.id)} aria-label="收藏诗词">
            <Heart
              className={`w-8 h-8 transition-colors ${
                learningRecord.isFavorite ? "fill-red-500 text-red-500" : "text-white/80 hover:text-white"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8 border-2 border-purple-200 bg-white/95 backdrop-blur shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{poem.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {poem.author} · {poem.dynasty}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {poem.season && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {poem.season}
                      </Badge>
                    )}
                    {poem.festival && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {poem.festival}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="mb-8 rounded-lg overflow-hidden shadow-md border border-purple-100">
                  <img src={getPoemImageUrl(poem)} alt={poem.title} className="w-full h-72 object-cover" />
                </div>

                <div className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                  <p className="text-2xl leading-relaxed text-gray-800 font-serif whitespace-pre-line">{poem.content}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-purple-600 mb-3">📖 白话文翻译</h3>
                  <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    {poem.translation}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-purple-600 mb-3">🎭 创作背景</h3>
                  <p className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    {poem.background}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-blue-200 bg-white/95 backdrop-blur shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <CardTitle className="text-2xl">📝 问答 {currentQuestionIndex + 1}/{questions.length}</CardTitle>
                <CardDescription>完成 3 道题后会自动记录学习进度</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {currentQuestion ? (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {celebrateShow && isCorrect && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="mb-4 p-4 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-lg text-center"
                        >
                          <div className="text-4xl mb-2">🎉</div>
                          <p className="font-bold text-green-700">答对了！太棒了！</p>
                        </motion.div>
                      )}

                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{currentQuestion.question}</h3>
                        <div className="space-y-3">
                          {currentQuestion.options.map((option) => (
                            <motion.button
                              key={option}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswerClick(option)}
                              disabled={showResult}
                              className={`w-full p-3 rounded-lg font-semibold transition-all text-left border-2 ${
                                selectedAnswer === option
                                  ? isCorrect
                                    ? "bg-green-200 border-green-500 text-green-800"
                                    : "bg-red-200 border-red-500 text-red-800"
                                  : showResult && option === currentQuestion.correctAnswer
                                    ? "bg-green-200 border-green-500 text-green-800"
                                    : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {option}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`mb-6 p-4 rounded-lg border-2 ${isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}
                        >
                          <p className={`font-bold mb-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                            {isCorrect ? "✓ 正确答案" : "✗ 错误答案"}
                          </p>
                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-bold">正确答案：</span>
                            {currentQuestion.correctAnswer}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-bold">解释：</span>
                            {currentQuestion.explanation}
                          </p>
                        </motion.div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} variant="outline" className="flex-1">
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          上一题
                        </Button>
                        <Button
                          onClick={handleNextQuestion}
                          disabled={!showResult}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {currentQuestionIndex === questions.length - 1 ? "完成并记录" : "下一题"}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-lg text-gray-600">暂无问题</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
