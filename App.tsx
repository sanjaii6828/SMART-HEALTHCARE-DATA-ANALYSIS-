import { Layout } from "./components/Layout";
import { DataProvider, useData } from "./context/DataContext";
import { CleaningPage } from "./pages/CleaningPage";
import { CodePage } from "./pages/CodePage";
import { EdaPage } from "./pages/EdaPage";
import { HomePage } from "./pages/HomePage";
import { ImportPage } from "./pages/ImportPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PatientsPage } from "./pages/PatientsPage";
import { PredictionPage } from "./pages/PredictionPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RiskPage } from "./pages/RiskPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { VisualizationPage } from "./pages/VisualizationPage";

function Router() {
  const { page } = useData();
  switch (page) {
    case "overview":
      return <OverviewPage />;
    case "import":
      return <ImportPage />;
    case "cleaning":
      return <CleaningPage />;
    case "eda":
      return <EdaPage />;
    case "patients":
      return <PatientsPage />;
    case "visualization":
      return <VisualizationPage />;
    case "statistics":
      return <StatisticsPage />;
    case "risk":
      return <RiskPage />;
    case "prediction":
      return <PredictionPage />;
    case "reports":
      return <ReportsPage />;
    case "code":
      return <CodePage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <DataProvider>
      <Layout>
        <Router />
      </Layout>
    </DataProvider>
  );
}
