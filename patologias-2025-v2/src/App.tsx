import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { IconButton, Box } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import './App.css'
import TableMovimientos from './components/TablePatologias'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  // Tema claro (por defecto)
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#ffffff',
        paper: '#f8f9fa',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
      },
    },
    components: {
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: 'Z#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: '#f5f5f5',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even)': {
              backgroundColor: '#fafafa',
            },
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            color: '#424242',
            borderBottom: '2px solid #e0e0e0',
          },
          body: {
            color: '#333333',
          },
        },
      },
    },
  })

  // Tema oscuro
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
      },
    },
    components: {
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid #333333',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: '#2a2a2a',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(even)': {
              backgroundColor: '#252525',
            },
            '&:hover': {
              backgroundColor: '#333333',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            color: '#ffffff',
            borderBottom: '2px solid #444444',
          },
          body: {
            color: '#ffffff',
          },
        },
      },
    },
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        padding: 2,
        transition: 'background-color 0.3s ease'
      }}>
        {/* Botón para cambiar tema */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton 
            onClick={toggleDarkMode} 
            color="primary"
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
        
        <TableMovimientos />
      </Box>
    </ThemeProvider>
  )
}

export default App