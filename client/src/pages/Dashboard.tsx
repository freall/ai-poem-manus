import { useMemo } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLearningRecords } from "@/lib/learning";
import { ALL_POEMS, getPoemById } from "@/lib/poems";
import { motion } from "framer-motion";
import { BookOpen, Flame, Star, Trophy } from "lucide-react";

const ACHIEVEMENTS = [
  { id: "first_poem", name: "初学者", description: "学习第一首诗", icon: "📖", requirement: 1 },
  { id: "five_poems", name: "诗词爱好者", description: "学习 5 首诗", icon: "📚", requirement: 5 },
  { id: "ten_poems", name: "诗词小达人", description: "学习 10 首诗", icon: "🌟", requirement: 10 },
  { id: "twenty_poems", name: "诗词大师", description: "学习 20 首诗", icon: "👑", requirement: 20 },
  { id: "all_seasons", name: "四季诗人", description: "完成全部节气主题学习", icon: "🌍", requirement: 48 },
  { id: "all_festivals", name: "节日小卫士", description: "完成全部节日主题学习", icon: "🎉", requirement: 30 },
  { id: "perfect_score", name: "答题高手", description: "累计答对 10 道题", icon: "🎯", requirement: 10 },
  { id: "collector", name: "收藏家", description: "收藏 10 首诗词", icon: "❤️", requirement: 10 },
] as const;

function getAchievementProgress(achievementId: string, stats: {
  learned: number;
  learnedSeasonal: number;
  learnedFestival: number;
  favorites: number;
  correctAnswers: number;
}) {
  switch (achievementId) {
    case "all_seasons":
      return stats.learnedSeasonal;
    case "all_festivals":
      return stats.learnedFestival;
    case "perfect_score":
      return stats.correctAnswers;
    case "collector":
      return stats.favorites;
    default:
      return stats.learned;
  }
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const learningRecords = useLearningRecords();

  const stats = useMemo(() => {
    const learnedRecords = learningRecords.filter((record) => record.isLearned);
    const learnedPoemIds = new Set(learnedRecords.map((record) => record.poemId));
    const favoriteRecords = learningRecords.filter((record) => record.isFavorite);
    const totalAnswered = learningRecords.reduce((sum, record) => sum + record.totalAttempts, 0);
    const correctAnswers = learningRecords.reduce((sum, record) => sum + record.correctCount, 0);
    const learnedSeasonal = ALL_POEMS.filter((poem) => poem.category === "节气" && learnedPoemIds.has(poem.id)).length;
    const learnedFestival = ALL_POEMS.filter((poem) => poem.category === "节日" && learnedPoemIds.has(poem.id)).length;

    return {
      learned: learnedRecords.length,
      learnedSeasonal,
      learnedFestival,
      favorites: favoriteRecords.length,
      totalAnswered,
      correctAnswers,
      accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
      streak: learnedRecords.length,
    };
  }, [learningRecords]);

  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      const progress = getAchievementProgress(achievement.id, stats);
      return {
        ...achievement,
        progress,
        unlocked: progress >= achievement.requirement,
      };
    });
  }, [stats]);

  const recentRecords = useMemo(() => {
    return learningRecords.slice().sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }).slice(0, 5);
  }, [learningRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white py-8 px-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/20 mb-4">
            ← 返回首页
          </Button>
          <h1 className="text-4xl font-bold">学习进度</h1>
          <p className="text-lg opacity-90 mt-2">本地纯前端学习记录会自动保存在当前浏览器中</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  已学诗词
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.learned}</div>
                <p className="text-xs text-gray-500 mt-1">共 {ALL_POEMS.length} 首</p>
                <Progress value={(stats.learned / ALL_POEMS.length) * 100} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">❤️ 收藏诗词</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.favorites}</div>
                <p className="text-xs text-gray-500 mt-1">喜欢的诗词</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">🎯 答题准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.accuracy}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.correctAnswers} / {stats.totalAnswered}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  连续学习
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.streak}</div>
                <p className="text-xs text-gray-500 mt-1">首</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            成就系统
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card
                  className={`border-2 transition-all ${
                    achievement.unlocked
                      ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg"
                      : "border-gray-200 bg-gray-50 opacity-70"
                  }`}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="text-5xl mb-2">{achievement.icon}</div>
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    <CardDescription className="text-sm">{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    {achievement.unlocked ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">已解锁 ✓</Badge>
                    ) : (
                      <div className="text-xs text-gray-600">
                        <p>
                          进度: {Math.min(achievement.progress, achievement.requirement)} / {achievement.requirement}
                        </p>
                        <Progress
                          value={(Math.min(achievement.progress, achievement.requirement) / achievement.requirement) * 100}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <Star className="w-8 h-8" />
            最近学习
          </h2>

          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              {recentRecords.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  还没有学习记录，
                  <Button variant="link" onClick={() => setLocation("/")} className="text-purple-600">
                    开始学习
                  </Button>
                </p>
              ) : (
                <div className="space-y-3">
                  {recentRecords.map((record) => {
                    const poem = getPoemById(record.poemId);
                    return (
                      <div key={record.poemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {record.isFavorite && <span>❤️</span>}
                          <div className="min-w-0">
                            <p className="font-medium truncate">{poem?.title || `诗词 #${record.poemId}`}</p>
                            <p className="text-xs text-gray-500 truncate">{poem ? `${poem.author} · ${poem.dynasty}` : "本地记录"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {record.isLearned && <Badge className="bg-green-100 text-green-800">已学</Badge>}
                          {!record.isLearned && record.totalAttempts > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">练习中</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
