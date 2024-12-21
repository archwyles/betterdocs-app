import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Achievement, ProgressTracking, SkillLevel } from "@/lib/types";

interface ProgressTrackerProps {
  progressData: ProgressTracking;
  achievements: Achievement[];
  skillLevels: Record<string, SkillLevel>;
}

const ProgressTracker = ({
  progressData,
  achievements,
  skillLevels,
}: ProgressTrackerProps) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
            <CardDescription>Your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progressData.completion_percentage} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progressData.completion_percentage}% Complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Points</CardTitle>
            <CardDescription>Your achievement score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {progressData.total_points}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
            <CardDescription>Unlocked rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {achievements.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement: Achievement, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <div className="mt-1 text-sm text-purple-500">
                    +{achievement.points} points
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Levels Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Skill Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(skillLevels).map(
              ([skill, data]: [string, SkillLevel], index: number) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {skill}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Level: {data.current_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-500">
                        {data.points} pts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Next: {data.next_milestone}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={(data.points / (data.points + 100)) * 100}
                    className="mt-2"
                  />
                </motion.div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
