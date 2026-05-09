import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Сучасний глибокий синій
    },
    secondary: {
      main: '#8b5cf6', // Приємний фіолетовий для акцентів
    },
    background: {
      default: '#f8fafc', // Дуже світлий сіро-блакитний фон сторінки
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16, // Сучасні круглі кути для всіх елементів
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    button: {
      textTransform: 'none', // Вимикаємо дурноверхий КАПС на кнопках
      fontWeight: 600,
    },
  },
  components: {
    // Кастомізуємо панелі (Paper)
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // М'які об'ємні тіні
          border: '1px solid #e2e8f0', // Тонка рамка
        },
      },
    },
    // Кастомізуємо текстові поля
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Кастомізуємо кнопки
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
        },
      },
    },
  },
});