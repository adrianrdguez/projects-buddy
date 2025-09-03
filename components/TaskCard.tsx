import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCardProps } from "@/lib/types";

export function TaskCard({ task, onClick }: TaskCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completado</div>;
      case 'in_progress':
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En progreso</div>;
      default:
        return <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Pendiente</div>;
    }
  };

  return (
    <Card
      className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-300"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{task.title}</CardTitle>
          {getStatusBadge(task.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
      </CardContent>
    </Card>
  );
}