import { useState } from "react";
import { WelcomeStep } from "./WelcomeStep.tsx";
import { SimbriefStep } from "./SimbriefStep.tsx";
import { PrinterConfigStep } from "./PrinterConfigStep.tsx";
import { CompleteStep } from "./CompleteStep.tsx";
import { WizardData } from "./const";

interface SetupWizardProps {
  onComplete: (data: WizardData) => void;
  initialData?: Partial<WizardData>;
  cupsPrinters: { name: string; info: string }[];
  onRefreshUsbPrinters: () => Promise<void>;
}

export const SetupWizard = ({ onComplete, initialData, cupsPrinters, onRefreshUsbPrinters }: SetupWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    username: initialData?.username || "",
    connectionType: initialData?.connectionType || "lan",
    printerIp: initialData?.printerIp || "10.203.10.197",
    printerPort: initialData?.printerPort || "9100",
    cupsPrinters: [],
    selectedCupsPrinter: "",
    usbScanLoading: false,
    trailingBlankLines: initialData?.trailingBlankLines || 3,
    printerWidth: initialData?.printerWidth || "58mm",
  });

  const steps = [
    { id: "welcome", title: "Welcome", component: WelcomeStep },
    { id: "simbrief", title: "SimBrief", component: SimbriefStep },
    { id: "printer-config", title: "Printer & Test", component: PrinterConfigStep },
    { id: "complete", title: "Complete", component: CompleteStep },
  ];

  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep.component;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCanProceed(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCanProceed(false);
    }
  };

  const handleComplete = () => {
    onComplete(wizardData);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <ul className="steps w-full mb-8">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`step ${
                index < currentStepIndex ? "step-primary" : ""
              } ${index === currentStepIndex ? "step-primary" : ""}`}
              data-content={index + 1}
            >
              <span className="hidden md:inline">{step.title}</span>
            </li>
          ))}
        </ul>

        <StepComponent
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleComplete}
          wizardData={wizardData}
          setWizardData={setWizardData}
          canProceed={canProceed}
          setCanProceed={setCanProceed}
          cupsPrinters={cupsPrinters}
          onRefreshUsbPrinters={onRefreshUsbPrinters}
        />
      </div>
    </div>
  );
};
