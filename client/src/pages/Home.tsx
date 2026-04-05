import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Leaf, Gift, BarChart3 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const SEASONS = [
  { id: "spring", name: "春季", icon: "🌸", description: "春天的诗词" },
  { id: "summer", name: "夏季", icon: "☀️", description: "夏天的诗词" },
  { id: "autumn", name: "秋季", icon: "🍂", description: "秋天的诗词" },
  { id: "winter", name: "冬季", icon: "❄️", description: "冬天的诗词" },
];

const FESTIVALS = [
  { id: "spring-festival", name: "春节", icon: "🎆" },
  { id: "lantern-festival", name: "元宵节", icon: "🏮" },
  { id: "qingming", name: "清明节", icon: "🌾" },
  { id: "dragon-boat", name: "端午节", icon: "🎋" },
  { id: "qixi", name: "七夕节", icon: "💫" },
  { id: "mid-autumn", name: "中秋节", icon: "🌕" },
  { id: "chongyang", name: "重阳节", icon: "🌼" },
  { id: "new-year-eve", name: "除夕", icon: "🎇" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<"seasons" | "festivals" | null>(null);

  const handleSeasonClick = (seasonId: string) => {
    setLocation(`/poems/${seasonId}`);
  };

  const handleFestivalClick = (festivalId: string) => {
    setLocation(`/poems/${festivalId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white py-12 px-4 text-center shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-12 h-12" />
            <h1 className="text-5xl font-bold">趣学诗词</h1>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              学习进度
            </Button>
          )}
        </div>
        <p className="text-xl opacity-90">跟随节气和节日，探索中国古代诗歌的美妙世界</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {selectedCategory === null ? (
          // Category Selection
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Seasons Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-green-200 bg-white/80 backdrop-blur">
              <CardHeader
                onClick={() => setSelectedCategory("seasons")}
                className="bg-gradient-to-r from-green-200 to-emerald-200 text-center cursor-pointer"
              >
                <div className="text-5xl mb-3">🌿</div>
                <CardTitle className="text-2xl">24 节气</CardTitle>
                <CardDescription className="text-base">春夏秋冬四季诗词</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  跟随四季变化，学习与节气相关的经典诗词，感受自然的美妙与诗歌的意境。
                </p>
                <Button
                  onClick={() => setSelectedCategory("seasons")}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500"
                >
                  开始学习
                </Button>
              </CardContent>
            </Card>

            {/* Festivals Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-red-200 bg-white/80 backdrop-blur">
              <CardHeader
                onClick={() => setSelectedCategory("festivals")}
                className="bg-gradient-to-r from-red-200 to-pink-200 text-center cursor-pointer"
              >
                <div className="text-5xl mb-3">🎉</div>
                <CardTitle className="text-2xl">传统节日</CardTitle>
                <CardDescription className="text-base">8 个重要节日诗词</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  探索春节、中秋、重阳等传统节日的诗词文化，了解节日背后的故事和意义。
                </p>
                <Button
                  onClick={() => setSelectedCategory("festivals")}
                  className="w-full bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
                >
                  开始学习
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : selectedCategory === "seasons" ? (
          // Seasons View
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              className="mb-8"
            >
              ← 返回
            </Button>
            <h2 className="text-4xl font-bold text-center mb-12 text-purple-600">24 节气诗词</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SEASONS.map((season) => (
                <Card
                  key={season.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 border-green-200 hover:border-green-400 bg-white/90 backdrop-blur"
                  onClick={() => handleSeasonClick(season.id)}
                >
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-3">{season.icon}</div>
                    <CardTitle className="text-2xl">{season.name}</CardTitle>
                    <CardDescription>{season.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500">
                      查看诗词
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Festivals View
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              className="mb-8"
            >
              ← 返回
            </Button>
            <h2 className="text-4xl font-bold text-center mb-12 text-pink-600">传统节日诗词</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FESTIVALS.map((festival) => (
                <Card
                  key={festival.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 border-red-200 hover:border-red-400 bg-white/90 backdrop-blur"
                  onClick={() => handleFestivalClick(festival.id)}
                >
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-3">{festival.icon}</div>
                    <CardTitle className="text-2xl">{festival.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500">
                      查看诗词
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
