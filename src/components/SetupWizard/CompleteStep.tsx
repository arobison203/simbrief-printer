import { StepProps } from "./const";

export const CompleteStep = ({ onComplete }: StepProps) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="card-title text-3xl mb-2">Setup Complete!</h2>
        <p className="text-base-content mb-6">
          You're ready to start printing flight plans. Enter your SimBrief
          username and click "Fetch Flight Plan" to get started.
        </p>
        <div className="card-actions justify-center">
          <button className="btn btn-primary btn-lg" onClick={onComplete}>
            Start Using SimBrief Printer
          </button>
        </div>
      </div>
    </div>
  );
};
