import { StepProps, WizardData } from "./const";

interface SimbriefStepProps extends StepProps {
  wizardData: WizardData;
}

export const SimbriefStep = ({
  wizardData,
  setWizardData,
  canProceed,
  setCanProceed,
  onNext,
  onBack,
}: SimbriefStepProps) => {
  const handleUsernameChange = (value: string) => {
    setWizardData({ ...wizardData, username: value });
    setCanProceed(value.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canProceed) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-2">SimBrief Username</h2>
        <p className="text-sm text-base-content mb-4">
          Enter your SimBrief username to fetch flight plans
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="username-input">
            Username
          </label>
          <input
            id="username-input"
            type="text"
            placeholder="Enter your SimBrief username"
            value={wizardData.username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`input input-bordered input-lg w-full ${
              wizardData.username.length > 0 ? "input-success" : ""
            }`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <div className="card-actions justify-end mt-6">
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={!canProceed}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
