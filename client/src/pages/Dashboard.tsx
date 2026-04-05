import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, BookOpen, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";

const ACHIEVEMENTS = [
  {
    id: "first_poem",
    name: "初学者",
    description: "学习第一首诗",
    icon: "📖",
    requirement: 1,
  },
  {
    id: "five_poems",
    name: "诗词爱好者",
    description: "学习5首诗",
    icon: "📚",
    requirement: 5,
  },
  {
    id: "ten_poems",
    name: "诗词小达人",
    description: "学习10首诗",
    icon: "🌟",
    requirement: 10,
  },
  {
    id: "twenty_poems",
    name: "诗词大师",
    description: "学习20首诗",
    icon: "👑",
    requirement: 20,
  },
  {
    id: "all_seasons",
    name: "四季诗人",
    description: "学习四季的所有诗词",
    icon: "🌍",
    requirement: 12,
  },
  {
    id: "all_festivals",
    name: "节日小卫士",
    description: "学习所有节日的诗词",
    icon: "🎉",
    requirement: 8,
  },
  {
    id: "perfect_score",
    name: "答题高手",
    description: "连续答对10道题",
    icon: "🎯",
    requirement: 10,
  },
  {
    id: "collector",
    name: "收藏家",
    description: "收藏10首诗词",
    icon: "❤️",
    requirement: 10,
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // 获取学习记录
  const { data: learningRecords = [] } = trpc.learning.getRecords.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 获取成就
  const { data: achievements = [] } = trpc.achievements.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 计算统计数据
  const stats = useMemo(() => {
    const learned = learningRecords.filter((r) => r.isLearned).length;
    const favorites = learningRecords.filter((r) => r.isFavorite).length;
    const totalAnswered = learningRecords.reduce(
      (sum, r) => sum + (r.totalAttempts || 0),
      0
    );
    const correctAnswers = learningRecords.reduce(
      (sum, r) => sum + (r.correctCount || 0),
      0
    );
    const accuracy =
      totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    return {
      learned,
      favorites,
      totalAnswered,
      correctAnswers,
      accuracy,
      streak: learningRecords.filter((r) => r.isLearned).length, // 简化的连续学习天数
    };
  }, [learningRecords]);

  // 检查成就是否解锁
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      let unlocked = false;

      switch (achievement.id) {
        case "first_poem":
          unlocked = stats.learned >= 1;
          break;
        case "five_poems":
          unlocked = stats.learned >= 5;
          break;
        case "ten_poems":
          unlocked = stats.learned >= 10;
          break;
        case "twenty_poems":
          unlocked = stats.learned >= 20;
          break;
        case "all_seasons":
          unlocked = stats.learned >= 12;
          break;
        case "all_festivals":
          unlocked = stats.learned >= 8;
          break;
        case "perfect_score":
          unlocked = stats.correctAnswers >= 10;
          break;
        case "collector":
          unlocked = stats.favorites >= 10;
          break;
      }

      return { ...achievement, unlocked };
    });
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>请先登录</CardTitle>
            <CardDescription>登录后可以查看学习进度和成就</CardDescription>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white py-8 px-4 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/20 mb-4"
          >
            ← 返回首页
          </Button>
          <h1 className="text-4xl font-bold">学习进度</h1>
          <p className="text-lg opacity-90 mt-2">欢迎，{user?.name}！</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  已学诗词
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.learned}</div>
                <p className="text-xs text-gray-500 mt-1">共 78 首</p>
                <Progress value={(stats.learned / 78) * 100} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  ❤️ 收藏诗词
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.favorites}</div>
                <p className="text-xs text-gray-500 mt-1">喜欢的诗词</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  🎯 答题准确率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.accuracy}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.correctAnswers} / {stats.totalAnswered}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  连续学习
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.streak}</div>
                <p className="text-xs text-gray-500 mt-1">天</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            成就系统
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unlockedAchievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`border-2 transition-all ${
                    achievement.unlocked
                      ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="text-5xl mb-2">{achievement.icon}</div>
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    {achievement.unlocked ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        已解锁 ✓
                      </Badge>
                    ) : (
                      <div className="text-xs text-gray-600">
                        <p>进度: {Math.min(stats.learned, achievement.requirement)} / {achievement.requirement}</p>
                        <Progress
                          value={(Math.min(stats.learned, achievement.requirement) / achievement.requirement) * 100}
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

        {/* Recent Learning */}
        <div>
          <h2 className="text-3xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <Star className="w-8 h-8" />
            最近学习
          </h2>

          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              {learningRecords.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  还没有学习记录，<Button
                    variant="link"
                    onClick={() => setLocation("/")}
                    className="text-purple-600"
                  >
                    开始学习
                  </Button>
                </p>
              ) : (
                <div className="space-y-3">
                  {learningRecords.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {record.isFavorite && <span>❤️</span>}
                        <span className="font-medium">诗词 #{record.poemId}</span>
                      </div>
                      {record.isLearned && (
                        <Badge className="bg-green-100 text-green-800">已学</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
