import { createTheme } from '@mui/material/styles';

const dark = createTheme({
    palette: {
        mode: "dark",
        common: {
            black: "#000",
            white: "#fff"
        },
        primary: {
            light: "#64b5f6",
            main: "#2196f3",
            dark: "#1976d2",
            contrastText: "#fff"
        },
        secondary: {
            light: "#81c784",
            main: "#66bb6a",
            dark: "#4caf50",
            contrastText: "#000"
        },
        tertiary: {
            light: "#ffb74d",
            main: "#ffa726",
            dark: "#ff9800",
            contrastText: "#000"
        },
        error: {
            light: "#ef5350",
            main: "#f44336",
            dark: "#d32f2f",
            contrastText: "#fff"
        },
        warning: {
            light: "#ff9800",
            main: "#ed6c02",
            dark: "#e65100",
            contrastText: "#fff"
        },
        info: {
            light: "#29b6f6",
            main: "#0288d1",
            dark: "#0277bd",
            contrastText: "#fff"
        },
        success: {
            light: "#81c784",
            main: "#66bb6a",
            dark: "#4caf50",
            contrastText: "#000"
        },
        grey: {
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#eeeeee",
            300: "#e0e0e0",
            400: "#bdbdbd",
            500: "#9e9e9e",
            600: "#757575",
            700: "#616161",
            800: "#424242",
            900: "#212121",
            A100: "#f5f5f5",
            A200: "#eeeeee",
            A400: "#bdbdbd",
            A700: "#616161"
        },
        text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
            disabled: "rgba(255, 255, 255, 0.5)",
            hint: "rgba(255, 255, 255, 0.5)"
        },
        background: {
            default: "#0f172a",
            paper: "#1e293b"
        },
        divider: "rgba(255, 255, 255, 0.12)",
        action: {
            active: "#fff",
            hover: "rgba(255, 255, 255, 0.08)",
            hoverOpacity: 0.08,
            selected: "rgba(255, 255, 255, 0.16)",
            selectedOpacity: 0.16,
            disabled: "rgba(255, 255, 255, 0.3)",
            disabledBackground: "rgba(255, 255, 255, 0.12)",
            disabledOpacity: 0.38,
            focus: "rgba(255, 255, 255, 0.12)",
            focusOpacity: 0.12,
            activatedOpacity: 0.24
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.01562em'
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.2,
            letterSpacing: '-0.00833em'
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
            letterSpacing: '0em'
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.3,
            letterSpacing: '0.00735em'
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
            letterSpacing: '0em'
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.4,
            letterSpacing: '0.0075em'
        },
        subtitle1: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.00938em'
        },
        subtitle2: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.00714em'
        },
        body1: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.6,
            letterSpacing: '0.00938em'
        },
        body2: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            letterSpacing: '0.01071em'
        },
        button: {
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.75,
            letterSpacing: '0.02857em',
            textTransform: 'none'
        },
        caption: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.5,
            letterSpacing: '0.03333em'
        },
        overline: {
            fontWeight: 500,
            fontSize: '0.75rem',
            lineHeight: 2.5,
            letterSpacing: '0.08333em',
            textTransform: 'uppercase'
        }
    },
    shape: {
        borderRadius: 12
    },
    shadows: [
        'none',
        '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.4)',
        '0px 3px 6px rgba(0, 0, 0, 0.35), 0px 3px 6px rgba(0, 0, 0, 0.45)',
        '0px 10px 20px rgba(0, 0, 0, 0.4), 0px 6px 6px rgba(0, 0, 0, 0.5)',
        '0px 14px 28px rgba(0, 0, 0, 0.45), 0px 10px 10px rgba(0, 0, 0, 0.55)',
        '0px 19px 38px rgba(0, 0, 0, 0.5), 0px 15px 12px rgba(0, 0, 0, 0.6)',
        '0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.28), 0px 1px 10px 0px rgba(0,0,0,0.24)',
        '0px 3px 5px -1px rgba(0,0,0,0.4), 0px 5px 8px 0px rgba(0,0,0,0.28), 0px 1px 14px 0px rgba(0,0,0,0.24)',
        '0px 3px 5px -1px rgba(0,0,0,0.4), 0px 6px 10px 0px rgba(0,0,0,0.28), 0px 1px 18px 0px rgba(0,0,0,0.24)',
        '0px 4px 5px -2px rgba(0,0,0,0.4), 0px 7px 10px 1px rgba(0,0,0,0.28), 0px 2px 16px 1px rgba(0,0,0,0.24)',
        '0px 5px 5px -3px rgba(0,0,0,0.4), 0px 8px 10px 1px rgba(0,0,0,0.28), 0px 3px 14px 2px rgba(0,0,0,0.24)',
        '0px 5px 6px -3px rgba(0,0,0,0.4), 0px 9px 12px 1px rgba(0,0,0,0.28), 0px 3px 16px 2px rgba(0,0,0,0.24)',
        '0px 6px 6px -3px rgba(0,0,0,0.4), 0px 10px 14px 1px rgba(0,0,0,0.28), 0px 4px 18px 3px rgba(0,0,0,0.24)',
        '0px 6px 7px -4px rgba(0,0,0,0.4), 0px 11px 15px 1px rgba(0,0,0,0.28), 0px 4px 20px 3px rgba(0,0,0,0.24)',
        '0px 7px 8px -4px rgba(0,0,0,0.4), 0px 12px 17px 2px rgba(0,0,0,0.28), 0px 5px 22px 4px rgba(0,0,0,0.24)',
        '0px 7px 8px -4px rgba(0,0,0,0.4), 0px 13px 19px 2px rgba(0,0,0,0.28), 0px 5px 24px 4px rgba(0,0,0,0.24)',
        '0px 7px 9px -4px rgba(0,0,0,0.4), 0px 14px 21px 2px rgba(0,0,0,0.28), 0px 5px 26px 4px rgba(0,0,0,0.24)',
        '0px 8px 9px -5px rgba(0,0,0,0.4), 0px 15px 22px 2px rgba(0,0,0,0.28), 0px 6px 28px 5px rgba(0,0,0,0.24)',
        '0px 8px 10px -5px rgba(0,0,0,0.4), 0px 16px 24px 2px rgba(0,0,0,0.28), 0px 6px 30px 5px rgba(0,0,0,0.24)',
        '0px 8px 11px -5px rgba(0,0,0,0.4), 0px 17px 26px 2px rgba(0,0,0,0.28), 0px 6px 32px 5px rgba(0,0,0,0.24)',
        '0px 9px 11px -5px rgba(0,0,0,0.4), 0px 18px 28px 2px rgba(0,0,0,0.28), 0px 7px 34px 6px rgba(0,0,0,0.24)',
        '0px 9px 12px -6px rgba(0,0,0,0.4), 0px 19px 29px 2px rgba(0,0,0,0.28), 0px 7px 36px 6px rgba(0,0,0,0.24)',
        '0px 10px 13px -6px rgba(0,0,0,0.4), 0px 20px 31px 3px rgba(0,0,0,0.28), 0px 8px 38px 7px rgba(0,0,0,0.24)',
        '0px 10px 13px -6px rgba(0,0,0,0.4), 0px 21px 33px 3px rgba(0,0,0,0.28), 0px 8px 40px 7px rgba(0,0,0,0.24)',
        '0px 10px 14px -6px rgba(0,0,0,0.4), 0px 22px 35px 3px rgba(0,0,0,0.28), 0px 8px 42px 7px rgba(0,0,0,0.24)'
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    backgroundColor: '#0f172a'
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 500,
                    padding: '8px 16px',
                    transition: 'all 0.2s ease-in-out'
                },
                contained: {
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.4)',
                        transform: 'translateY(-1px)'
                    }
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        transform: 'translateY(-1px)'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.4)',
                        transform: 'translateY(-2px)'
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundImage: 'none'
                },
                elevation1: {
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.4)'
                },
                elevation2: {
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.35), 0px 3px 6px rgba(0, 0, 0, 0.45)'
                },
                elevation3: {
                    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.4), 0px 6px 6px rgba(0, 0, 0, 0.5)'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(33, 150, 243, 0.5)'
                            }
                        },
                        '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderWidth: '2px'
                            }
                        }
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05)'
                    }
                }
            }
        }
    }
});

export default dark;