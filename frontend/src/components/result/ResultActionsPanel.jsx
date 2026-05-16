import { Shrink, Expand, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const ResultActionsPanel = ({ isLoading, disabled, onAction }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      <Button 
        variant="outline" 
        startIcon={<Shrink className="w-4 h-4" />} 
        onClick={() => onAction(api.summarize, '✂️ Скорочення')} 
        disabled={disabled || isLoading}
      >
        Скоротити
      </Button>
      
      <Button 
        variant="outline" 
        startIcon={<Expand className="w-4 h-4" />} 
        onClick={() => onAction(api.expand, '📈 Розширення')} 
        disabled={disabled || isLoading}
      >
        Розширити
      </Button>
      
      <Button 
        variant="outline" 
        startIcon={<RefreshCcw className="w-4 h-4" />} 
        onClick={() => onAction(api.rewrite, '📝 Перефразування')} 
        disabled={disabled || isLoading}
      >
        Перефразувати
      </Button>
    </div>
  );
};
