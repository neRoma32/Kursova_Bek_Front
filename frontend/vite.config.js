import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Added comment to force Vite restart to pick up Tailwind CSS
export default defineConfig({
  plugins: [react()],
})
