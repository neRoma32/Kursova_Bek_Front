import { useState } from 'react';
import { api } from '../services/api';

export const useTextAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `Слів: ${words} | Символів: ${chars}`;
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
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

  return {
    inputText, setInputText, outputText, setOutputText,
    isLoading, getStats, handleClear, handleCheck, handleAction
  };
};