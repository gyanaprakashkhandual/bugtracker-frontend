import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit2, Trash2, MousePointer2 } from 'lucide-react';
import gsap from 'gsap';

const KanbanBoard = () => {
  const initialCards = [
    { id: 'IS-000014', title: 'UI Bug', desc: "The 'Submit' button overlaps with the footer section on smaller screens.", project: 'Caffetest', column: 0 },
    { id: 'IS-000013', title: 'API Integration', desc: 'The third-party payment API occasionally returns a 403 Forbidden response due to expired credentials.', project: 'Caffetest', column: 0 },
    { id: 'IS-000002', title: 'Performance', desc: 'Page takes more than 5 seconds to load after login due to excessive image size.', project: 'Caffetest', column: 0 },
    { id: 'IS-000010', title: 'Test Case Failure', desc: 'Automated Cypress test for login flow fails on Firefox due to a missing data-testid attribute.', project: 'Caffetest', column: 1 },
    { id: 'IS-000007', title: 'GitHub Merge Conflict', desc: 'A merge conflict occurred between the feature/auth and main branches during pull request #42.', project: 'Caffetest', column: 1 },
    { id: 'IS-000006', title: 'Production Outage', desc: 'The production server went down during deployment due to missing environment variables in the .env file.', project: 'Caffetest', column: 1 },
    { id: 'IS-000012', title: 'Authentication Failure', desc: 'OAuth token refresh fails after session expiry, causing users to be logged out unexpectedly.', project: 'Caffetest', column: 2 },
    { id: 'IS-000011', title: 'Project Setup Error', desc: 'New developers are unable to run the project locally due to missing dependencies in package.json.', project: 'Caffetest', column: 2 },
    { id: 'IS-000009', title: 'Code Source Corruption', desc: 'Some source files were accidentally deleted during a rebase operation; repository integrity is compromised.', project: 'Caffetest', column: 2 },
    { id: 'IS-000003', title: 'Security', desc: 'Password field allows copy-paste, which violates security guidelines.', project: 'Caffetest', column: 2 },
    { id: 'IS-000008', title: 'Project Setup Error', desc: 'New developers are unable to run the project locally due to missing dependencies in package.json.', project: 'Caffetest', column: 3 },
    { id: 'IS-000005', title: 'Project Deadline', desc: 'The project timeline is delayed due to late delivery of UI components and backend API integration.', project: 'Caffetest', column: 3 },
    { id: 'IS-000004', title: 'Functional Bug', desc: "Clicking on 'Delete Project' does not remove the project from the list until page refresh.", project: 'Caffetest', column: 3 },
  ];

  const columns = [
    { id: 0, title: 'OPEN', bg: 'bg-blue-50', count: 3 },
    { id: 1, title: 'ON GOING', bg: 'bg-yellow-50', count: 3 },
    { id: 2, title: 'IN REVIEW', bg: 'bg-purple-50', count: 4 },
    { id: 3, title: 'CLOSED', bg: 'bg-green-50', count: 3 },
  ];

  const tagColors = {
    'UI Bug': 'bg-teal-100 text-teal-700',
    'API Integration': 'bg-emerald-100 text-emerald-700',
    'Performance': 'bg-lime-100 text-lime-700',
    'Test Case Failure': 'bg-teal-100 text-teal-700',
    'GitHub Merge Conflict': 'bg-emerald-100 text-emerald-700',
    'Production Outage': 'bg-pink-100 text-pink-700',
    'Authentication Failure': 'bg-teal-100 text-teal-700',
    'Project Setup Error': 'bg-emerald-100 text-emerald-700',
    'Code Source Corruption': 'bg-teal-100 text-teal-700',
    'Security': 'bg-emerald-100 text-emerald-700',
    'Project Deadline': 'bg-teal-100 text-teal-700',
    'Functional Bug': 'bg-indigo-100 text-indigo-700',
  };

  const [cards, setCards] = useState(initialCards);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCard, setDraggedCard] = useState(null);
  const boardRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      const cardsCopy = [...cards];
      const availableCards = cardsCopy.filter(card => card.column < 3);
      
      if (availableCards.length === 0) return;
      
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      const cardIndex = cardsCopy.findIndex(c => c.id === randomCard.id);
      
      animateDragAndDrop(cardsCopy[cardIndex], cardIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [cards]);

  const animateDragAndDrop = (card, cardIndex) => {
    const cardElement = cardRefs.current[card.id];
    if (!cardElement) return;

    const rect = cardElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const targetColumn = (card.column + 1) % 4;
    const endX = startX + 350;
    const endY = startY + (Math.random() * 100 - 50);

    setDraggedCard(card);
    setIsDragging(true);

    gsap.to({}, {
      duration: 0.1,
      onUpdate: function() {
        setCursorPos({ x: startX - 50, y: startY - 50 });
      }
    });

    gsap.to({}, {
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress();
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        const wobble = Math.sin(progress * Math.PI * 3) * 10;
        
        setCursorPos({ 
          x: currentX - 12, 
          y: currentY - 12 + wobble 
        });
      },
      onComplete: () => {
        setCards(prevCards => {
          const newCards = [...prevCards];
          newCards[cardIndex] = { ...card, column: targetColumn };
          return newCards;
        });
        
        setTimeout(() => {
          setIsDragging(false);
          setDraggedCard(null);
          setCursorPos({ x: -100, y: -100 });
        }, 300);
      }
    });
  };

  useEffect(() => {
    if (boardRef.current) {
      gsap.fromTo(
        boardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const getColumnCards = (columnId) => {
    return cards.filter(card => card.column === columnId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 relative overflow-hidden">
      {/* Animated Cursor */}
      <motion.div
        className="fixed pointer-events-none z-50"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
        }}
        animate={{
          scale: isDragging ? 1 : 0,
          rotate: isDragging ? [0, -5, 5, -5, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, repeat: isDragging ? Infinity : 0 }
        }}
      >
        <div className="relative">
          <MousePointer2 
            size={24} 
            className="text-blue-600 drop-shadow-lg filter"
            fill="white"
            strokeWidth={2}
          />
          <motion.div
            className="absolute -top-1 -left-1 w-8 h-8 bg-blue-400 rounded-full opacity-30 blur-sm"
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>

      {/* Dragged Card Preview */}
      <AnimatePresence>
        {isDragging && draggedCard && (
          <motion.div
            className="fixed pointer-events-none z-40"
            style={{
              left: cursorPos.x + 30,
              top: cursorPos.y + 30,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 0.9 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="bg-white rounded-lg p-4 shadow-2xl border-2 border-blue-400 w-64 transform rotate-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">
                  {draggedCard.id}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${tagColors[draggedCard.title]}`}>
                  {draggedCard.title}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {draggedCard.desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={boardRef} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: column.id * 0.1 }}
              className={`${column.bg} rounded-lg p-4 min-h-[600px] relative`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 tracking-wide">
                  {column.title}
                </h3>
                <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                  {getColumnCards(column.id).length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {getColumnCards(column.id).map((card) => (
                    <motion.div
                      key={card.id}
                      ref={el => cardRefs.current[card.id] = el}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ 
                        opacity: draggedCard?.id === card.id ? 0.3 : 1, 
                        scale: draggedCard?.id === card.id ? 0.95 : 1, 
                        y: 0 
                      }}
                      exit={{ opacity: 0, scale: 0.8, x: 100 }}
                      transition={{
                        layout: { duration: 0.5, ease: 'easeInOut' },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                      }}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 relative"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {card.id}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${tagColors[card.title]}`}>
                          {card.title}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {card.desc}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{card.project}</span>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-amber-500 hover:text-amber-600"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <svg className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none" viewBox="0 0 200 100">
                <motion.path
                  d="M 0 50 Q 50 20 100 50 T 200 50"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;