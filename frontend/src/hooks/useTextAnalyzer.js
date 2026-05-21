import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useHistory } from './useHistory';

export const useTextAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState('analyze');
  const [outputLang, setOutputLang] = useState('en');

  const [mistakes, setMistakes] = useState([]);
  const [ignoredMistakes, setIgnoredMistakes] = useState([]);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null); 
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // Історія запитів
  const { history, addHistoryItem, deleteHistoryItem, clearHistory } = useHistory();

  // Document Viewer States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [viewMode, setViewMode] = useState('text');
  const [zoom, setZoom] = useState(1.0);

  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `Слів: ${words} | Символів: ${chars}`;
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMistakes([]);
    setIgnoredMistakes([]);
    setAiAnalysis(null);
    setAssistantResult(null);
    setUploadedFile(null);
    setViewMode('text');
    setZoom(1.0);
  };

  // Завантажити з історії
  const loadFromHistory = (item) => {
    setSelectedMode(item.mode || 'analyze');
    setInputText(item.inputText || '');
    setOutputText(item.outputText || '');
    setAiAnalysis(item.aiAnalysis || null);
    setMistakes(item.mistakes || []);
    setIgnoredMistakes([]);
    
    if (item.assistantResult) {
      setIsAssistantOpen(true);
      setAssistantResult(item.assistantResult);
    } else {
      setAssistantResult(null);
    }
  };

  const handleMainAction = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setAiAnalysis(null);
    setAssistantResult(null);
    try {
      let finalOutput = '';
      let analysisData = null;
      let finalMistakes = mistakes;

      if (selectedMode === 'analyze') {
        const data = await api.checkGrammar(inputText);
        finalOutput = data.result.style_improved;
        setOutputText(finalOutput);
        if (data.ai_analysis) {
          analysisData = data.ai_analysis;
          setAiAnalysis(analysisData);
        }
        // Save to history
        addHistoryItem({
          mode: 'analyze',
          actionLabel: '🪄 Аналіз',
          inputText,
          outputText: finalOutput,
          aiAnalysis: analysisData,
          mistakes: finalMistakes
        });
      } else if (selectedMode === 'translate') {
        const data = await api.translate(inputText, outputLang);
        finalOutput = data.processed_text;
        setOutputText(finalOutput);
        
        // Save to history
        addHistoryItem({
          mode: 'translate',
          actionLabel: '🌐 Переклад',
          inputText,
          outputText: finalOutput,
        });
      }
    } catch (error) {
      console.error(error);
      setOutputText("Помилка обробки запиту.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultAction = async (actionFunction, actionLabel) => {
    if (!outputText) return;
    setIsLoading(true);
    try {
      const data = await actionFunction(outputText);
      const newOutput = data.processed_text;
      setOutputText(newOutput);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: actionLabel,
        inputText: inputText,
        outputText: newOutput,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes
      });
    } catch (error) {
      console.error(error);
      alert("Помилка обробки тексту.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistantDescribe = async () => {
    if (!inputText.trim()) return;
    setIsAssistantLoading(true);
    setAssistantResult(null);
    try {
      const data = await api.describeText(inputText);
      const result = { type: 'describe', text: data.processed_text };
      setAssistantResult(result);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: '📄 Короткий опис',
        inputText: inputText,
        outputText: outputText,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: result
      });
    } catch (error) {
      console.error(error);
      setAssistantResult({ type: 'error', text: 'Помилка генерації опису.' });
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleAssistantKeywords = async () => {
    if (!inputText.trim()) return;
    setIsAssistantLoading(true);
    setAssistantResult(null);
    try {
      const data = await api.getKeywords(inputText);
      const result = { type: 'keywords', text: data.processed_text };
      setAssistantResult(result);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: '🔑 Ключові слова',
        inputText: inputText,
        outputText: outputText,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: result
      });
    } catch (error) {
      console.error(error);
      setAssistantResult({ type: 'error', text: 'Помилка генерації ключових слів.' });
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleAssistantImprove = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const data = await api.checkGrammar(inputText);
      const newOutput = data.result.style_improved;
      setOutputText(newOutput);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: '✨ Покращення',
        inputText: inputText,
        outputText: newOutput,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: assistantResult
      });
    } catch (error) {
      console.error(error);
      setOutputText("Помилка покращення тексту.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMode !== 'analyze' || !inputText.trim()) {
      if (!inputText.trim() || selectedMode !== 'analyze') {
        setMistakes([]);
        if (!inputText.trim()) setIgnoredMistakes([]);
      }
      return;
    }

    const checkTimeout = setTimeout(async () => {
      try {
        const data = await api.fastCheck(inputText);
        const newMistakes = (data.mistakes || []).filter(m => {
          const word = inputText.substring(m.offset, m.offset + m.length);
          const mistakeId = `${word}-${m.message}`;
          return !ignoredMistakes.includes(mistakeId);
        });
        setMistakes(newMistakes);
      } catch (error) {
        console.error("Fast check error:", error);
      }
    }, 800);

    return () => clearTimeout(checkTimeout);
  }, [inputText, selectedMode, ignoredMistakes]);

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Ефект для автоматичного перекладу
  useEffect(() => {
    if (selectedMode !== 'translate') return;

    const translateTimeout = setTimeout(async () => {
      if (inputText.trim()) {
        setIsLoading(true);
        try {
          const data = await api.translate(inputText, outputLang);
          const finalOutput = data.processed_text;
          setOutputText(finalOutput);

          // Зберігаємо в історію, якщо текст довший за 10 символів і переклад не пустий
          if (inputText.trim().length > 10 && finalOutput) {
            const translateHistory = historyRef.current.filter(h => h.mode === 'translate');
            const lastTranslate = translateHistory[0];
            
            // Запобігаємо дублям
            if (!lastTranslate || lastTranslate.inputText !== inputText) {
              addHistoryItem({
                mode: 'translate',
                inputText,
                outputText: finalOutput,
              });
            }
          }
        } catch (error) {
          console.error(error);
          setOutputText("Помилка перекладу.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setOutputText('');
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(translateTimeout);
  }, [inputText, outputLang, selectedMode]);

  const handleFileUploadAction = async (file) => {
    setIsLoading(true);
    const fileType = file.name.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
    setUploadedFile({ name: file.name, type: fileType, file });
    
    // Auto-detect mobile screens to default to Text View
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'text' : 'document');
    setZoom(1.0);

    try {
      const data = await api.analyzeFile(file);
      setInputText(data.original_text);
      setOutputText(data.spellcheck.style_improved + "\n\n--- Короткий зміст ---\n" + data.summary);
      setMistakes(data.spellcheck.mistakes || []);
      setIgnoredMistakes([]);
    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('Помилка аналізу файлу');
      setUploadedFile(null);
      setViewMode('text');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCorrection = (mistake, suggestion) => {
    const { offset, length } = mistake;
    const newText = inputText.substring(0, offset) + suggestion + inputText.substring(offset + length);
    setInputText(newText);
    
    const lengthDifference = suggestion.length - length;
    
    setMistakes((prev) => 
      prev
        .filter(m => m.offset !== mistake.offset)
        .map(m => {
          if (m.offset > mistake.offset) {
            return { ...m, offset: m.offset + lengthDifference };
          }
          return m; 
        })
    );
  };

  const dismissMistake = (mistakeOffset) => {
    const mistakeToDismiss = mistakes.find(m => m.offset === mistakeOffset);
    if (mistakeToDismiss) {
      const word = inputText.substring(mistakeToDismiss.offset, mistakeToDismiss.offset + mistakeToDismiss.length);
      const mistakeId = `${word}-${mistakeToDismiss.message}`;
      setIgnoredMistakes(prev => [...prev, mistakeId]);
    }
    setMistakes((prev) => prev.filter(m => m.offset !== mistakeOffset));
  };

  return {
    inputText, setInputText, outputText, setOutputText,
    isLoading, getStats, handleClear, handleMainAction, handleResultAction, handleFileUploadAction,
    selectedMode, setSelectedMode, outputLang, setOutputLang,
    mistakes, isAssistantOpen, setIsAssistantOpen, applyCorrection, dismissMistake,
    aiAnalysis, assistantResult, isAssistantLoading,
    handleAssistantDescribe, handleAssistantKeywords, handleAssistantImprove,
    history, deleteHistoryItem, clearHistory, loadFromHistory,
    uploadedFile, setUploadedFile, viewMode, setViewMode, zoom, setZoom
  };
};