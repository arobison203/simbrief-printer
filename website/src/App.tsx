import {
  PrinterIcon,
  CpuChipIcon,
  ClipboardDocumentCheckIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  CloudArrowDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface DownloadFile {
  name: string;
  description: string;
  pattern: string;
}

interface DownloadPlatform {
  platform: string;
  label: string;
  files: DownloadFile[];
}

function App() {
  const REPO = "arobison203/simbrief-printer";

  const getDownloadUrl = (pattern: string) => {
    return `https://github.com/${REPO}/releases/latest?pattern=${encodeURIComponent(pattern)}`;
  };

  const downloads: DownloadPlatform[] = [
    {
      platform: "macOS",
      label: "macOS",
      files: [
        {
          name: "Apple Silicon",
          description: "For M1, M2, M3 Macs",
          pattern: "aarch64",
        },
        {
          name: "Intel",
          description: "For Intel-based Macs",
          pattern: "x86_64",
        },
      ],
    },
    {
      platform: "Windows",
      label: "Windows",
      files: [
        {
          name: "MSI Installer",
          description: "Recommended installation method",
          pattern: ".msi",
        },
      ],
    },
    {
      platform: "Linux",
      label: "Linux",
      files: [
        {
          name: "AppImage",
          description: "Portable, works on most distributions",
          pattern: ".AppImage",
        },
        {
          name: "Debian",
          description: "For Debian/Ubuntu based systems",
          pattern: ".deb",
        },
      ],
    },
  ];

  const features = [
    {
      icon: <PrinterIcon className="w-6 h-6" />,
      title: "Dual Connection Support",
      description: "Network (TCP/IP) or USB system printer",
    },
    {
      icon: <CpuChipIcon className="w-6 h-6" />,
      title: "Multiple Paper Sizes",
      description: "58mm and 80mm thermal printers",
    },
    {
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      title: "SimBrief Integration",
      description: "Fetch flight plans via username",
    },
    {
      icon: <EyeIcon className="w-6 h-6" />,
      title: "Live Preview",
      description: "See exactly what will print",
    },
    {
      icon: <ArrowsRightLeftIcon className="w-6 h-6" />,
      title: "Unit Conversion",
      description: "Toggle between LBS and KG",
    },
    {
      icon: <CogIcon className="w-6 h-6" />,
      title: "Connection Testing",
      description: "Verify printer before use",
    },
  ];

  return (
    <div className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-base-content mb-4">
            SimBrief Printer
          </h1>
          <p className="text-xl text-base-content/70 mb-8">
            Print your flight plans to thermal receipt printers
          </p>

          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl justify-center mb-6">
                Choose Your Platform
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {downloads.map((platform) => (
                  <div
                    key={platform.platform}
                    className="card bg-base-100 shadow-lg"
                  >
                    <div className="card-body items-center text-center">
                      <h3 className="card-title text-xl">{platform.label}</h3>
                      <div className="w-full space-y-3 mt-4">
                        {platform.files.map((file: DownloadFile) => (
                          <a
                            key={file.name}
                            href={getDownloadUrl(file.pattern)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary w-full"
                          >
                            <CloudArrowDownIcon className="w-5 h-5" />
                            {file.name}
                          </a>
                        ))}
                      </div>
                      <p className="text-sm text-base-content/60 mt-4">
                        {platform.files
                          .map((f: DownloadFile) => f.description)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl justify-center mb-6">
                Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-primary shrink-0 mt-1">
                      {feature.icon}
                    </span>
                    <div className="text-left">
                      <h3 className="font-semibold text-base-content">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-base-content/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl justify-center mb-6">
                First Launch Tips
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-left">
                    <h3 className="font-semibold text-base-content">macOS</h3>
                    <p className="text-sm text-base-content/70">
                      Right-click → Open if blocked by Gatekeeper
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-left">
                    <h3 className="font-semibold text-base-content">Linux</h3>
                    <p className="text-sm text-base-content/70">
                      <code className="bg-base-300 px-2 py-1 rounded text-base-content">
                        chmod +x simbrief-printer_*.AppImage
                      </code>{" "}
                      before running
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-base-content/60 mt-6">
                Auto-updates are checked on launch, or manually via Help → Check
                for Updates
              </p>
            </div>
          </div>

          <footer className="mt-12 text-base-content/60 text-sm">
            <p>
              <DocumentTextIcon className="w-4 h-4 inline mr-1" />
              Open source on{" "}
              <a
                href={`https://github.com/${REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                GitHub
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
