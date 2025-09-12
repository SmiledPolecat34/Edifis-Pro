import React, { useState, useMemo } from 'react';

interface Task {
  task_id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  construction_site: {
    construction_site_id: number;
    name: string;
  };
}

interface TimelineChartProps {
  tasks: Task[];
}

const statusStyles: { [key: string]: { bg: string; text: string } } = {
  'Prévu': { bg: 'bg-gray-300', text: 'text-gray-800' },
  'En cours': { bg: 'bg-blue-500', text: 'text-white' },
  'Terminé': { bg: 'bg-green-500', text: 'text-white' },
  'Annulé': { bg: 'bg-red-500', text: 'text-white' },
  'En attente de validation': { bg: 'bg-yellow-400', text: 'text-gray-800' },
};

const allStatuses = Object.keys(statusStyles);

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export default function TimelineChart({ tasks }: TimelineChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(allStatuses);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => selectedStatuses.includes(task.status));
  }, [tasks, selectedStatuses]);

  const sites: { [key: string]: Task[] } = useMemo(() => {
    const siteData: { [key: string]: Task[] } = {};
    filteredTasks.forEach(task => {
      if (task.construction_site) {
        if (!siteData[task.construction_site.name]) {
          siteData[task.construction_site.name] = [];
        }
        siteData[task.construction_site.name].push(task);
      }
    });
    for (const siteName in siteData) {
        siteData[siteName].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }
    return siteData;
  }, [filteredTasks]);

  const siteNames = Object.keys(sites).sort();

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const renderDaysHeader = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isPast = date < today && date.toDateString() !== today.toDateString();
      days.push(
        <div key={i} className={`text-center text-xs font-medium text-gray-500 border-r ${isPast ? 'bg-gray-100' : ''}`}>
          {i}
        </div>
      );
    }
    return days;
  };

  const renderTaskBar = (task: Task) => {
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);

    if (startDate.getFullYear() > year || (startDate.getFullYear() === year && startDate.getMonth() > month)) return null;
    if (endDate.getFullYear() < year || (endDate.getFullYear() === year && endDate.getMonth() < month)) return null;

    const startDay = startDate.getMonth() === month ? startDate.getDate() : 1;
    const endDay = endDate.getMonth() === month ? endDate.getDate() : daysInMonth;
    const duration = endDay - startDay + 1;

    const style = {
      gridColumn: `${startDay} / span ${duration}`,
    };

    const { bg, text } = statusStyles[task.status] || { bg: 'bg-gray-200', text: 'text-gray-700' };

    return (
      <div style={style} className={`group relative ${bg} ${text} rounded-lg h-8 flex items-center px-3 my-1 shadow-sm`}>
        <span className="text-xs font-semibold truncate">{task.name}</span>
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white p-3 rounded-lg border border-gray-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
            <p className="font-bold text-gray-900">{task.name}</p>
            <p className="text-sm text-gray-600">Statut: {task.status}</p>
            <p className="text-sm text-gray-600">Début: {startDate.toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Fin: {endDate.toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md font-sans">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Chronologie des Missions</h2>
            <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium">‹ Préc.</button>
                <span className="text-lg font-semibold text-gray-700">{currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium">Suiv ›</button>
            </div>
        </div>
        <div className="flex space-x-4 mb-4">
            {allStatuses.map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                </label>
            ))}
        </div>
        <div className="overflow-x-auto">
            <div className="grid gap-y-2 min-w-[1200px]" style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth}, minmax(40px, 1fr))` }}>
                <div className="font-semibold text-sm text-gray-600 border-r border-b pb-2">Chantier</div>
                <div className="col-span-${daysInMonth} grid border-b pb-2" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`}}>
                  {renderDaysHeader()}
                </div>

                {siteNames.map(siteName => (
                    <React.Fragment key={siteName}>
                        <div className="font-semibold text-sm text-gray-800 border-r pt-2 pr-2 truncate">{siteName}</div>
                        <div className={`col-span-${daysInMonth} grid relative border-r`} style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`}}>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const date = new Date(year, month, i + 1);
                                const isPast = date < new Date() && date.toDateString() !== new Date().toDateString();
                                return <div key={i} className={`border-r ${isPast ? 'bg-gray-100' : ''}`}></div>
                            })}
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(40px, 1fr))`}}>
                                {sites[siteName].map(task => renderTaskBar(task))}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
}
