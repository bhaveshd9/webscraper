import React, { useState, useEffect } from 'react';
import { Globe, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  progress: number;
  status: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, progress, status }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const steps = [
    { icon: Globe, text: 'Initializing Web Scraper', color: 'text-blue-500' },
    { icon: Shield, text: 'Loading Security Modules', color: 'text-green-500' },
    { icon: Zap, text: 'Optimizing Performance', color: 'text-yellow-500' },
    { icon: TrendingUp, text: 'Ready to Scrape', color: 'text-indigo-500' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => onComplete(), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    const stepProgress = Math.floor((progress / 100) * steps.length);
    setCurrentStep(Math.min(stepProgress, steps.length - 1));
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 text-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="relative inline-block">
            <Globe size={80} className="text-white mb-4 animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Web Scraper Pro
          </h1>
          <p className="text-blue-200 text-lg">Advanced Data Extraction Platform</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-md mx-auto mb-8">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10'
                  }`}
                >
                  <div className={`relative ${isCompleted ? 'text-green-400' : isActive ? step.color : 'text-gray-400'}`}>
                    {isCompleted ? (
                      <CheckCircle size={24} className="animate-pulse" />
                    ) : (
                      <Icon size={24} className={isActive ? 'animate-spin' : ''} />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-blue-200 mt-2">
            <span>{status}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Zap size={20} className="text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Lightning Fast</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Shield size={20} className="text-green-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Secure & Safe</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Shield size={20} className="text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Anti-Detection</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <TrendingUp size={20} className="text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-blue-200">Real-time Data</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 