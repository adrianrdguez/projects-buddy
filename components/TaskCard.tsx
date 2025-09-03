import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCardProps } from "@/lib/types";

export function TaskCard({ task, onClick }: TaskCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500';
      case 'in_progress':
        return 'border-blue-500';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <Card
      className={`bg-gray-800 border-2 border-dashed cursor-pointer hover:bg-gray-700 transition-colors ${getStatusColor(task.status)}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white">{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm">{task.description}</p>
      </CardContent>
    </Card>
  );
}