import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useHistory } from './useHistory';

export const useTextAnalyzer = () => {
  const [inputText, setInputTextRaw] = useState('');
  const [outputText, setOutputTextRaw] = useState('');

  const setInputText = (value) => {
    if (typeof value === 'function') {
      setInputTextRaw((prev) => {
        const res = value(prev);
        return typeof res === 'string' ? res.replace(/\r\n/g, '\n') : res;
      });
    } else {
      setInputTextRaw(typeof value === 'string' ? value.replace(/\r\n/g, '\n') : value);
    }
  };

  const setOutputText = (value) => {
    if (typeof value === 'function') {
      setOutputTextRaw((prev) => {
        const res = value(prev);
        return typeof res === 'string' ? res.replace(/\r\n/g, '\n') : res;
      });
    } else {
      setOutputTextRaw(typeof value === 'string' ? value.replace(/\r\n/g, '\n') : value);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState('analyze');
  const [outputLang, setOutputLang] = useState('en');

  const [mistakes, setMistakes] = useState([]);
  const [ignoredMistakes, setIgnoredMistakes] = useState([]);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null); 
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(null);

  // Історія запитів
  const { history, addHistoryItem, deleteHistoryItem, clearHistory } = useHistory(selectedMode);

  // Document Viewer States
  const [uploadedFile, setUploadedFile] = useState(null);
  const uploadedFileRef = useRef(null);
  useEffect(() => {
    uploadedFileRef.current = uploadedFile;
  }, [uploadedFile]);

  const [viewMode, setViewMode] = useState('text');
  const [zoom, setZoom] = useState(1.0);
  const [lastInputText, setLastInputText] = useState(null);

  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `Слів: ${words} | Символів: ${chars}`;
  };

  const handleClear = () => {
    setLastInputText(inputText);
    setInputText('');
    setOutputText('');
    setMistakes([]);
    setIgnoredMistakes([]);
    setAiAnalysis(null);
    setAssistantResult(null);
    setUploadedFile(null);
    setViewMode('text');
    setZoom(1.0);
    setCurrentTitle(null);
    setIsLoading(false);
  };

  const handleUndo = () => {
    if (lastInputText !== null) {
      const current = inputText;
      setInputText(lastInputText);
      setLastInputText(current);
    }
  };

  // Завантажити з історії
  const loadFromHistory = (item) => {
    setSelectedMode(item.mode || 'analyze');
    setInputText(item.inputText || '');
    setOutputText(item.outputText || '');
    setAiAnalysis(item.aiAnalysis || null);
    setMistakes(item.mistakes || []);
    setIgnoredMistakes([]);
    setCurrentTitle(item.title || null);
    
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
        setCurrentTitle(data.title || null);
        // Save to history
        addHistoryItem({
          mode: 'analyze',
          actionLabel: '🪄 Аналіз',
          inputText,
          outputText: finalOutput,
          aiAnalysis: analysisData,
          mistakes: finalMistakes,
          title: data.title || null
        });
      } else if (selectedMode === 'translate') {
        const data = await api.translate(inputText, outputLang);
        finalOutput = data.processed_text;
        setOutputText(finalOutput);
        
        if (data.corrected_text && data.corrected_text !== inputText) {
          setInputText(data.corrected_text);
        }
        
        // Save to history
        addHistoryItem({
          mode: 'translate',
          actionLabel: '🌐  Переклад',
          inputText: data.corrected_text || inputText,
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
        mistakes: mistakes,
        title: currentTitle
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
    if (inputText.length > 5000) {
      alert("Текст занадто довгий для обробки (ліміт 5000 символів)");
      return;
    }
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
        assistantResult: result,
        title: currentTitle
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
    if (inputText.length > 5000) {
      alert("Текст занадто довгий для обробки (ліміт 5000 символів)");
      return;
    }
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
        assistantResult: result,
        title: currentTitle
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
    if (inputText.length > 5000) {
      alert("Текст занадто довгий для обробки (ліміт 5000 символів)");
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.checkGrammar(inputText);
      const newOutput = data.result.style_improved;
      
      setLastInputText(inputText);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: '📝 Оригінал до покращення',
        inputText: inputText,
        outputText: outputText,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: assistantResult,
        title: currentTitle
      });

      if (selectedMode === 'analyze') {
        setInputText(newOutput);
      } else {
        setOutputText(newOutput);
      }
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: '✨ Покращення',
        inputText: selectedMode === 'analyze' ? newOutput : inputText,
        outputText: selectedMode === 'analyze' ? outputText : newOutput,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: assistantResult,
        title: currentTitle
      });
    } catch (error) {
      console.error(error);
      if (selectedMode === 'analyze') {
        alert("Помилка покращення тексту.");
      } else {
        setOutputText("Помилка покращення тексту.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorAction = async (actionFunction, actionLabel) => {
    if (!inputText.trim()) return;
    if (inputText.length > 5000) {
      alert("Текст занадто довгий для обробки (ліміт 5000 символів)");
      return;
    }
    setLastInputText(inputText);
    
    addHistoryItem({
      mode: selectedMode,
      actionLabel: `📝 Оригінал до ${actionLabel.toLowerCase()}`,
      inputText: inputText,
      outputText: outputText,
      aiAnalysis: aiAnalysis,
      mistakes: mistakes,
      assistantResult: assistantResult,
      title: currentTitle
    });

    setIsLoading(true);
    try {
      const data = await actionFunction(inputText);
      const newInputText = data.processed_text;
      setInputText(newInputText);
      
      addHistoryItem({
        mode: selectedMode,
        actionLabel: actionLabel,
        inputText: newInputText,
        outputText: outputText,
        aiAnalysis: aiAnalysis,
        mistakes: mistakes,
        assistantResult: assistantResult,
        title: currentTitle
      });
    } catch (error) {
      console.error(error);
      alert("Помилка обробки тексту.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMode !== 'analyze' || !inputText.trim() || inputText.length > 5000) {
      if (!inputText.trim() || selectedMode !== 'analyze' || inputText.length > 5000) {
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
        if (inputText.length > 5000) {
          setOutputText("Помилка: перевищено ліміт 5000 символів.");
          return;
        }
        setIsLoading(true);
        try {
          const data = await api.translate(inputText, outputLang);
          const finalOutput = data.processed_text;
          setOutputText(finalOutput);
          
          if (data.corrected_text && data.corrected_text !== inputText) {
            setInputText(data.corrected_text);
          }

          // Зберігаємо в історію, якщо текст довший за 10 символів і переклад не пустий
          if (inputText.trim().length > 10 && finalOutput) {
            const finalInput = data.corrected_text || inputText;
            const translateHistory = historyRef.current.filter(h => h.mode === 'translate');
            const lastTranslate = translateHistory[0];
            
            // Запобігаємо дублям
            if (!lastTranslate || lastTranslate.inputText !== finalInput) {
              addHistoryItem({
                mode: 'translate',
                inputText: finalInput,
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
    setSelectedMode('analyze');
    const fileType = file.name.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
    setUploadedFile({ name: file.name, type: fileType, file });
    
    // Auto-detect mobile screens to default to Text View
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'text' : 'document');
    setZoom(1.0);

    try {
      const data = await api.analyzeFile(file);
      
      // If the upload was cancelled or replaced in the meantime, abort state updates
      if (!uploadedFileRef.current || uploadedFileRef.current.name !== file.name) {
        return;
      }

      if (data.original_text.length >= 5000) {
        alert("Зверніть увагу: завантажений файл містить більше 5000 символів. Для стабільної роботи системи оброблено лише перші 5000 символів.");
      }
      setInputText(data.original_text);
      setOutputText(data.spellcheck.style_improved + "\n\n--- Короткий зміст ---\n" + data.summary);
      setMistakes(data.spellcheck.mistakes || []);
      setIgnoredMistakes([]);
    } catch (error) {
      console.error('Error analyzing file:', error);
      if (uploadedFileRef.current && uploadedFileRef.current.name === file.name) {
        alert('Помилка аналізу файлу');
        setUploadedFile(null);
        setViewMode('text');
      }
    } finally {
      if (uploadedFileRef.current && uploadedFileRef.current.name === file.name) {
        setIsLoading(false);
      }
    }
  };

  const applyCorrection = (mistake, suggestion) => {
    setLastInputText(inputText);
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
    uploadedFile, setUploadedFile, viewMode, setViewMode, zoom, setZoom,
    lastInputText, handleUndo, handleEditorAction
  };
};