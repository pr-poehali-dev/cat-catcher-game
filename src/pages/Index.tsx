import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Cat {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
  mood: 'happy' | 'sleepy' | 'playful' | 'grumpy';
  speed: number;
  direction: { x: number; y: number };
  isCaught: boolean;
}

interface CaughtCat extends Cat {
  personality: string;
  favoriteFood: string;
}

const Index = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [caughtCats, setCaughtCats] = useState<CaughtCat[]>([]);
  const [selectedCat, setSelectedCat] = useState<CaughtCat | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{sender: 'user' | 'cat', message: string}>>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const catEmojis = ['🐱', '🐾', '😺', '😸', '😻', '🙀', '😿', '😾'];
  const catNames = ['Мурка', 'Барсик', 'Пушок', 'Снежок', 'Рыжик', 'Тигра', 'Луна', 'Симба'];
  
  const moodColors = {
    happy: 'bg-coral',
    sleepy: 'bg-pixel-blue',
    playful: 'bg-mint',
    grumpy: 'bg-pixel-dark'
  };

  const generateRandomCat = useCallback((id: number): Cat => {
    return {
      id,
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 200) + 100,
      emoji: catEmojis[Math.floor(Math.random() * catEmojis.length)],
      name: catNames[Math.floor(Math.random() * catNames.length)],
      mood: ['happy', 'sleepy', 'playful', 'grumpy'][Math.floor(Math.random() * 4)] as Cat['mood'],
      speed: Math.random() * 2 + 1,
      direction: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      isCaught: false
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    const initialCats = Array.from({ length: 6 }, (_, i) => generateRandomCat(i));
    setCats(initialCats);
  };

  const catchCat = (catId: number) => {
    const cat = cats.find(c => c.id === catId);
    if (!cat) return;

    const caughtCat: CaughtCat = {
      ...cat,
      personality: ['Ласковый', 'Игривый', 'Спокойный', 'Любопытный'][Math.floor(Math.random() * 4)],
      favoriteFood: ['Рыбка', 'Молоко', 'Сосиски', 'Птичка'][Math.floor(Math.random() * 4)]
    };

    setCaughtCats(prev => [...prev, caughtCat]);
    setCats(prev => prev.filter(c => c.id !== catId));
    
    // Добавляем нового кота через некоторое время
    setTimeout(() => {
      setCats(prev => [...prev, generateRandomCat(Date.now())]);
    }, 3000);
  };

  const sendMessage = () => {
    if (!chatMessage.trim() || !selectedCat) return;

    const userMessage = { sender: 'user' as const, message: chatMessage };
    
    // Простой ИИ ответ на основе настроения кота
    const getCatResponse = (mood: string, message: string): string => {
      const responses = {
        happy: ['Мяу! Я так рад тебя видеть! 😸', 'Урр-мяу! Давай играть! 🐾', 'Мур-мур! Ты лучший! ❤️'],
        sleepy: ['Мяу... хочу спать... 😴', 'Мур... может позже поговорим? 💤', 'Зевает... мяу... 🥱'],
        playful: ['МЯУ-МЯУ! Поиграем?! 🏃‍♂️', 'Прыг-скок! Ловить меня! 🎯', 'Мяу! Бегом за мной! 🏃'],
        grumpy: ['Фыр... не трогай меня... 😾', 'Мяу-р-р... оставь в покое! 😤', 'Шшш... не мешай! 🙄']
      };
      
      const moodResponses = responses[mood as keyof typeof responses] || responses.happy;
      return moodResponses[Math.floor(Math.random() * moodResponses.length)];
    };

    const catResponse = { 
      sender: 'cat' as const, 
      message: getCatResponse(selectedCat.mood, chatMessage) 
    };

    setChatHistory(prev => [...prev, userMessage, catResponse]);
    setChatMessage('');
  };

  // Анимация движения котов
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setCats(prevCats => 
        prevCats.map(cat => {
          let newX = cat.x + cat.direction.x * cat.speed;
          let newY = cat.y + cat.direction.y * cat.speed;
          let newDirection = { ...cat.direction };

          // Отскок от границ
          if (newX <= 0 || newX >= window.innerWidth - 80) {
            newDirection.x *= -1;
            newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
          }
          if (newY <= 100 || newY >= window.innerHeight - 100) {
            newDirection.y *= -1;
            newY = Math.max(100, Math.min(window.innerHeight - 100, newY));
          }

          // Случайное изменение направления
          if (Math.random() < 0.02) {
            newDirection = {
              x: (Math.random() - 0.5) * 2,
              y: (Math.random() - 0.5) * 2
            };
          }

          return {
            ...cat,
            x: newX,
            y: newY,
            direction: newDirection
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pixel-lavender via-mint to-pixel-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-4 border-pixel-dark bg-pixel-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-pixel-dark pixel-font">
              🐱 PIXEL CATS 🐱
            </CardTitle>
            <p className="text-lg text-gray-600 mt-4">
              Ретро-игра по ловле котиков с ИИ-общением!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 space-y-1">
                <div>🎯 Лови котов кликом по ним</div>
                <div>🏠 Собирай их в свой домик</div>
                <div>💬 Общайся с пойманными котами</div>
                <div>😊 У каждого кота свое настроение</div>
              </div>
              <Button 
                onClick={startGame}
                className="w-full h-12 text-xl font-bold bg-coral hover:bg-coral/90 border-4 border-pixel-dark text-pixel-white"
              >
                ПОЕХАЛИ! 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-lavender via-mint to-pixel-blue relative overflow-hidden">
      {/* Игровое поле */}
      <div className="relative w-full h-screen">
        {/* Летающие коты */}
        {cats.map(cat => (
          <div
            key={cat.id}
            className={`absolute cursor-pointer transition-all duration-100 hover:scale-110 ${moodColors[cat.mood]} rounded-full p-2 border-2 border-pixel-dark animate-pixel-glow`}
            style={{
              left: `${cat.x}px`,
              top: `${cat.y}px`,
              transform: `scale(${cat.mood === 'playful' ? '1.2' : '1'})`,
            }}
            onClick={() => catchCat(cat.id)}
          >
            <div className="text-3xl animate-cat-bounce">
              {cat.emoji}
            </div>
          </div>
        ))}

        {/* Панель управления */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Card className="border-2 border-pixel-dark bg-pixel-white/90">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Icon name="Home" size={20} />
                <span className="font-bold">Домик: {caughtCats.length} котов</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pixel-dark bg-pixel-white/90">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Icon name="Target" size={20} />
                <span className="font-bold">На поле: {cats.length} котов</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Домик с котами */}
        <Card className="absolute bottom-4 left-4 w-80 max-h-96 border-4 border-pixel-dark bg-pixel-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Home" size={24} />
              Мой домик котов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {caughtCats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Пока нет котиков... Лови их! 🎯
              </p>
            ) : (
              caughtCats.map(cat => (
                <Dialog key={cat.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 h-auto border-2 border-pixel-dark bg-pixel-white hover:bg-mint/50"
                      onClick={() => {
                        setSelectedCat(cat);
                        setChatHistory([]);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{cat.emoji}</span>
                        <div className="text-left">
                          <div className="font-bold">{cat.name}</div>
                          <div className="text-xs text-gray-500">
                            {cat.personality} • Настроение: {cat.mood}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-4 border-pixel-dark bg-pixel-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-3xl">{cat.emoji}</span>
                        Чат с {cat.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="h-64 border-2 border-gray-200 rounded p-3 overflow-y-auto bg-gray-50">
                        {chatHistory.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            Начни разговор с {cat.name}! 💬
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {chatHistory.map((msg, index) => (
                              <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs p-2 rounded-lg border-2 border-pixel-dark ${
                                    msg.sender === 'user'
                                      ? 'bg-coral text-white'
                                      : `${moodColors[cat.mood]} text-pixel-dark`
                                  }`}
                                >
                                  {msg.message}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder={`Напиши что-то ${cat.name}...`}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="border-2 border-pixel-dark"
                        />
                        <Button 
                          onClick={sendMessage}
                          className="bg-coral hover:bg-coral/90 border-2 border-pixel-dark text-white"
                        >
                          <Icon name="Send" size={16} />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded border">
                        <strong>{cat.name}</strong> • {cat.personality} • Любит: {cat.favoriteFood} • Настроение: {cat.mood}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;