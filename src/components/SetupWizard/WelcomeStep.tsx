import { StepProps } from "./const";

export const WelcomeStep = ({ onNext }: StepProps) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="card-title text-3xl mb-2">
          Welcome to SimBrief Printer
        </h2>
        <p className="text-base-content mb-6">
          This wizard will guide you through setting up your thermal printer
          configuration
        </p>
        <div className="flex flex-col gap-3 text-left text-sm w-full max-w-md">
          <div className="flex items-start gap-3">
            <span className="badge badge-primary badge-sm mt-0.5">1</span>
            <span>Configure your SimBrief username</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="badge badge-primary badge-sm mt-0.5">2</span>
            <span>Choose connection type (LAN or USB)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="badge badge-primary badge-sm mt-0.5">3</span>
            <span>Configure printer and test print</span>
          </div>
        </div>
        <div className="card-actions justify-center mt-6">
          <button className="btn btn-primary btn-wide" onClick={onNext}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
