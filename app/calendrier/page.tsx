"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useAppSoundsSimple } from "@/hooks/use-app-sounds-simple";

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { playBackSound } = useAppSoundsSimple();

  const handleBackClick = () => {
    console.log("Back button clicked!");
    playBackSound();
  };

  const events = [
    {
      id: 1,
      date: "2024-01-15",
      title: "Rendez-vous médecin",
      time: "14:30",
      color: "pink",
    },
    {
      id: 2,
      date: "2024-01-18",
      title: "Dîner avec les amies",
      time: "19:00",
      color: "rose",
    },
    {
      id: 3,
      date: "2024-01-22",
      title: "Cours de yoga",
      time: "10:00",
      color: "pink",
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    return days;
  };

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const days = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-25 to-pink-100 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-20 left-20 w-12 h-12 bg-pink-200/30 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-40 right-32 w-8 h-8 bg-rose-200/40 rounded-full blur-lg animate-float-medium delay-1000"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20 active:scale-95 transition-transform duration-100"
              onMouseDown={handleBackClick}
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-white" />
              <h1 className="text-white font-semibold text-xl">
                Mon Calendrier
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={previousMonth}
              className="hover:bg-pink-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              onClick={nextMonth}
              className="hover:bg-pink-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const isToday =
                day.date.toDateString() === new Date().toDateString();
              const isSelected =
                day.date.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                    ${isToday ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" : ""}
                    ${isSelected && !isToday ? "bg-pink-100 text-pink-700" : ""}
                    ${!isToday && !isSelected ? "hover:bg-pink-50" : ""}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events for selected date */}
        <div
          className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Événements du {selectedDate.toLocaleDateString("fr-FR")}
          </h3>
          <div className="space-y-3">
            {events.filter(
              (event) => event.date === selectedDate.toISOString().split("T")[0]
            ).length > 0 ? (
              events
                .filter(
                  (event) =>
                    event.date === selectedDate.toISOString().split("T")[0]
                )
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r from-${event.color}-400 to-${event.color}-500`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun événement prévu ce jour-là ✨</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
