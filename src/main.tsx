import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1B2559',
          colorLink: '#2C3E8C',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Button: {
            colorPrimary: '#1B2559',
            algorithm: true,
          },
          Tabs: {
            inkBarColor: '#2C3E8C',
            itemActiveColor: '#1B2559',
            itemSelectedColor: '#1B2559',
          },
          Menu: {
            itemSelectedBg: '#EEF2FF',
            itemSelectedColor: '#1B2559',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
