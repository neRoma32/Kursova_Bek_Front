import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useTextAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Нові стани для режиму перекладу
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  const [outputLang, setOutputLang] = useState('en');

  // Нові стани для Grammarly-режиму
  const [mistakes, setMistakes] = useState([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `Слів: ${words} | Символів: ${chars}`;
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMistakes([]);
  };

  const handleCheck = async () => {
    if (!inputText) return;
    setIsLoading(true);
    try {
      const data = await api.checkGrammar(inputText);
      setOutputText(data.result.style_improved);
    } catch (error) {
      console.error(error);
      setOutputText("Помилка з'єднання з сервером.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionFunction) => {
    if (!inputText) return;
    setIsLoading(true);
    try {
      const data = await actionFunction(inputText);
      setOutputText(data.processed_text);
    } catch (error) {
      console.error(error);
      setOutputText("Помилка обробки тексту.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ефект для швидкої перевірки помилок (Grammarly-режим)
  useEffect(() => {
    if (isTranslationMode || !inputText.trim()) {
      if (!inputText.trim()) setMistakes([]);
      return;
    }

    const checkTimeout = setTimeout(async () => {
      try {
        const data = await api.fastCheck(inputText);
        setMistakes(data.mistakes || []);
      } catch (error) {
        console.error("Fast check error:", error);
      }
    }, 800); // 800мс debounce

    return () => clearTimeout(checkTimeout);
  }, [inputText, isTranslationMode]);

  // Ефект для автоматичного перекладу (з debounce)
  useEffect(() => {
    if (!isTranslationMode) return;

    const translateTimeout = setTimeout(async () => {
      if (inputText.trim()) {
        setIsLoading(true);
        try {
          const data = await api.translate(inputText, outputLang);
          setOutputText(data.processed_text);
        } catch (error) {
          console.error(error);
          setOutputText("Помилка перекладу.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setOutputText('');
      }
    }, 1000); // 1 секунда затримки (debounce)

    return () => clearTimeout(translateTimeout);
  }, [inputText, outputLang, isTranslationMode]);

  const handleFileUploadAction = async (file) => {
    setIsLoading(true);
    try {
      const data = await api.analyzeFile(file);
      setInputText(data.original_text);
      setOutputText(data.spellcheck.style_improved + "\n\n--- Короткий зміст ---\n" + data.summary);
      setMistakes(data.spellcheck.mistakes || []);
    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('Помилка аналізу файлу');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCorrection = (mistake, suggestion) => {
    const { offset, length } = mistake;
    const newText = inputText.substring(0, offset) + suggestion + inputText.substring(offset + length);
    setInputText(newText);
    
    // Видаляємо помилку з масиву, оскільки ми її виправили
    // Але краще почекати, поки відпрацює debounce і оновить всі помилки,
    // втім для швидкого UI можемо просто прибрати її з локального стейту
    setMistakes((prev) => prev.filter(m => m.offset !== mistake.offset));
  };

  return {
    inputText, setInputText, outputText, setOutputText,
    isLoading, getStats, handleClear, handleCheck, handleAction, handleFileUploadAction,
    isTranslationMode, setIsTranslationMode, outputLang, setOutputLang,
    mistakes, isAssistantOpen, setIsAssistantOpen, applyCorrection
  };
};