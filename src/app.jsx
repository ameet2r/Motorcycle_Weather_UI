import { Router } from "preact-router";
import NewSearchPage from "./routes/NewSearchPage";
import Forecast from "./routes/Forecast";
import { Link } from "preact-router/match";

export default function App() {
  return (
    <div>
      <header>
        <h1>Motorcycle Weather</h1>
        <nav>
          <Link href="/">New Search</Link>
          <Link href="/forecast">Previous Searching</Link>
        </nav>
      </header>
      <Router>
        <NewSearchPage path="/" />
        <Forecast path="/forecast" />
      </Router>
    </div>
  );
}
