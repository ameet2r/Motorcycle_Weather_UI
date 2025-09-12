import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ThemeProvider from './Themes/ThemeProvider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import NewSearchPage from "./routes/NewSearchPage";
import Forecast from "./routes/Forecast";
import Footer from "./components/Footer";
import Box from '@mui/material/Box';


export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Motorcycle Weather
            </Typography>
            <Button color="inherit" component={Link} to="/">
              New Search
            </Button>
            <Button color="inherit" component={Link} to="/forecast">
              Previous Searches
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<NewSearchPage />} />
            <Route path="/forecast" element={<Forecast />} />
          </Routes>
        </Container>
        <Box mt={2}>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}
