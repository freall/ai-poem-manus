import { useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleFavorite, useLearningRecords } from "@/lib/learning";
import { getCategoryDisplayName, getPoemsByCategory } from "@/lib/poems";
import { Heart } from "lucide-react";

export default function PoemList() {
  const { category } = useParams<{ category: string }>();
  const [, setLocation] = useLocation();
  const learningRecords = useLearningRecords();

  const poems = useMemo(() => {
    if (!category) return [];
    return getPoemsByCategory(category);
  }, [category]);

  const favoriteIds = useMemo(() => {
    return new Set(learningRecords.filter((record) => record.isFavorite).map((record) => record.poemId));
  }, [learningRecords]);

  const categoryName = getCategoryDisplayName(category || "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white py-8 px-4">
        <Button variant="ghost" onClick={() => setLocation("/")} className="text-white hover:bg-white/20 mb-4">
          ← 返回首页
        </Button>
        <h1 className="text-4xl font-bold">{categoryName}的诗词</h1>
        <p className="text-lg opacity-90 mt-2">共 {poems.length} 首诗词</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((poem) => (
            <Card
              key={poem.id}
              className="hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400 bg-white/90 backdrop-blur cursor-pointer group"
              onClick={() => setLocation(`/poem/${poem.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors">{poem.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {poem.author} · {poem.dynasty}
                    </CardDescription>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(poem.id);
                    }}
                    className="shrink-0"
                    aria-label="收藏诗词"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        favoriteIds.has(poem.id) ? "fill-red-500 text-red-500" : "text-gray-300 hover:text-red-300"
                      }`}
                    />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{poem.content}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {poems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-600">暂无诗词数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
