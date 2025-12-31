import { StockProvider } from "./context/StockContext.js";
import { BillingProvider } from "./context/BillingContext.js";
import StockSection from "./components/Stock/StockSection.js";
import BillingSection from "./components/Billing/BillingSection.js";

export default function App() {
  return (
    <StockProvider>
      <BillingProvider>
        <div style={{ padding: 20 }}>
          <StockSection />
          <BillingSection />
        </div>
      </BillingProvider>
    </StockProvider>
  );
}
